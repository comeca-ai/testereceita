# Scripts de ETL e Automação para CNPJ Agent

## apps/cnpj-etl/src/etl-pipeline.ts
```typescript
import { RFBFileParser } from '@cnpj/processor';
import { CNPJDatabase } from '@cnpj/db';
import { CompanyData, EstablishmentData, PartnerData } from '@cnpj/types';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

export interface ETLConfig {
  batchSize: number;
  maxConcurrency: number;
  enableValidation: boolean;
  skipExisting: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export class CNPJETLPipeline {
  private parser: RFBFileParser;
  private database: CNPJDatabase;
  private config: ETLConfig;
  private stats = {
    processed: 0,
    errors: 0,
    skipped: 0,
    startTime: Date.now()
  };

  constructor(config: ETLConfig) {
    this.config = config;
    this.parser = new RFBFileParser({ 
      batchSize: config.batchSize,
      skipErrors: true 
    });
    this.database = new CNPJDatabase();
  }

  async processCompanies(filePath: string): Promise<void> {
    console.log(`[ETL] Starting company processing: ${filePath}`);
    
    try {
      const batches = await this.parser.parseCompanies(filePath);
      
      for await (const batch of batches) {
        await this.processBatch('companies', batch, async (companies: CompanyData[]) => {
          return await this.database.insertCompanies(companies);
        });
      }
      
      console.log(`[ETL] Company processing completed`);
    } catch (error) {
      console.error(`[ETL] Error processing companies:`, error);
      throw error;
    }
  }

  async processEstablishments(filePath: string): Promise<void> {
    console.log(`[ETL] Starting establishment processing: ${filePath}`);
    
    try {
      const batches = await this.parser.parseEstablishments(filePath);
      
      for await (const batch of batches) {
        await this.processBatch('establishments', batch, async (establishments: EstablishmentData[]) => {
          return await this.database.insertEstablishments(establishments);
        });
      }
      
      console.log(`[ETL] Establishment processing completed`);
    } catch (error) {
      console.error(`[ETL] Error processing establishments:`, error);
      throw error;
    }
  }

  async processPartners(filePath: string): Promise<void> {
    console.log(`[ETL] Starting partner processing: ${filePath}`);
    
    try {
      const batches = await this.parser.parsePartners(filePath);
      
      for await (const batch of batches) {
        await this.processBatch('partners', batch, async (partners: PartnerData[]) => {
          return await this.database.insertPartners(partners);
        });
      }
      
      console.log(`[ETL] Partner processing completed`);
    } catch (error) {
      console.error(`[ETL] Error processing partners:`, error);
      throw error;
    }
  }

  private async processBatch<T>(
    type: string, 
    batch: T[], 
    processor: (batch: T[]) => Promise<number>
  ): Promise<void> {
    try {
      const inserted = await processor(batch);
      this.stats.processed += inserted;
      this.stats.skipped += (batch.length - inserted);
      
      if (this.stats.processed % 100000 === 0) {
        this.logProgress(type);
      }
    } catch (error) {
      this.stats.errors += batch.length;
      console.error(`[ETL] Error processing ${type} batch:`, error);
      
      if (!this.config.skipExisting) {
        throw error;
      }
    }
  }

  private logProgress(type: string): void {
    const elapsed = Date.now() - this.stats.startTime;
    const rate = Math.round(this.stats.processed / (elapsed / 1000));
    
    console.log(`[ETL] ${type}: ${this.stats.processed.toLocaleString()} processed, ` +
               `${this.stats.errors} errors, ${rate}/s`);
  }

  async getStats() {
    const elapsed = Date.now() - this.stats.startTime;
    return {
      ...this.stats,
      elapsedMs: elapsed,
      ratePerSecond: Math.round(this.stats.processed / (elapsed / 1000))
    };
  }
}
```

## tools/cnpj-downloader/src/rfb-downloader.ts
```typescript
import axios from 'axios';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join, basename } from 'path';
import { createHash } from 'crypto';
import { pipeline } from 'stream/promises';
import { Extract } from 'unzipper';

export interface DownloadConfig {
  baseUrl: string;
  mirrorUrl?: string;
  outputDir: string;
  maxConcurrent: number;
  retryAttempts: number;
  timeout: number;
}

export interface DownloadProgress {
  fileName: string;
  downloaded: number;
  total: number;
  percentage: number;
  speed: number; // bytes/sec
}

export class RFBDownloader {
  private config: DownloadConfig;
  private activeDownloads = new Map<string, AbortController>();

  constructor(config: DownloadConfig) {
    this.config = config;
    this.ensureOutputDir();
  }

  private ensureOutputDir(): void {
    if (!existsSync(this.config.outputDir)) {
      mkdirSync(this.config.outputDir, { recursive: true });
    }
  }

  async downloadAllFiles(progressCallback?: (progress: DownloadProgress) => void): Promise<string[]> {
    console.log('[Downloader] Discovering available files...');
    
    const fileList = await this.discoverFiles();
    console.log(`[Downloader] Found ${fileList.length} files to download`);
    
    const downloadedFiles: string[] = [];
    const semaphore = this.createSemaphore(this.config.maxConcurrent);
    
    const downloadPromises = fileList.map(async (fileName) => {
      await semaphore.acquire();
      
      try {
        const filePath = await this.downloadFile(fileName, progressCallback);
        downloadedFiles.push(filePath);
        return filePath;
      } finally {
        semaphore.release();
      }
    });
    
    await Promise.all(downloadPromises);
    console.log(`[Downloader] Downloaded ${downloadedFiles.length} files`);
    
    return downloadedFiles;
  }

  async downloadFile(
    fileName: string, 
    progressCallback?: (progress: DownloadProgress) => void
  ): Promise<string> {
    const outputPath = join(this.config.outputDir, fileName);
    
    // Skip if file already exists
    if (existsSync(outputPath)) {
      console.log(`[Downloader] Skipping existing file: ${fileName}`);
      return outputPath;
    }
    
    const abortController = new AbortController();
    this.activeDownloads.set(fileName, abortController);
    
    try {
      let lastError: Error | null = null;
      
      for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
        try {
          const url = `${this.config.baseUrl}/${fileName}`;
          console.log(`[Downloader] Downloading ${fileName} (attempt ${attempt})`);
          
          const response = await axios.get(url, {
            responseType: 'stream',
            timeout: this.config.timeout,
            signal: abortController.signal,
            onDownloadProgress: (progressEvent) => {
              if (progressCallback && progressEvent.total) {
                const progress: DownloadProgress = {
                  fileName,
                  downloaded: progressEvent.loaded,
                  total: progressEvent.total,
                  percentage: Math.round((progressEvent.loaded / progressEvent.total) * 100),
                  speed: progressEvent.rate || 0
                };
                progressCallback(progress);
              }
            }
          });
          
          const writeStream = createWriteStream(outputPath);
          await pipeline(response.data, writeStream);
          
          console.log(`[Downloader] Successfully downloaded: ${fileName}`);
          return outputPath;
          
        } catch (error) {
          lastError = error as Error;
          console.warn(`[Downloader] Attempt ${attempt} failed for ${fileName}:`, error);
          
          if (attempt < this.config.retryAttempts) {
            await this.delay(1000 * attempt); // Exponential backoff
          }
        }
      }
      
      throw lastError || new Error(`Failed to download ${fileName} after ${this.config.retryAttempts} attempts`);
      
    } finally {
      this.activeDownloads.delete(fileName);
    }
  }

  async extractFile(zipPath: string, outputDir?: string): Promise<string[]> {
    const extractDir = outputDir || join(this.config.outputDir, 'extracted');
    
    if (!existsSync(extractDir)) {
      mkdirSync(extractDir, { recursive: true });
    }
    
    console.log(`[Downloader] Extracting ${basename(zipPath)}...`);
    
    return new Promise((resolve, reject) => {
      const extractedFiles: string[] = [];
      
      createReadStream(zipPath)
        .pipe(Extract({ path: extractDir }))
        .on('entry', (entry) => {
          if (entry.type === 'File') {
            extractedFiles.push(join(extractDir, entry.path));
          }
        })
        .on('finish', () => {
          console.log(`[Downloader] Extracted ${extractedFiles.length} files from ${basename(zipPath)}`);
          resolve(extractedFiles);
        })
        .on('error', reject);
    });
  }

  private async discoverFiles(): Promise<string[]> {
    try {
      // Common RFB file patterns
      const patterns = [
        'Empresas0.zip', 'Empresas1.zip', 'Empresas2.zip', 'Empresas3.zip',
        'Estabelecimentos0.zip', 'Estabelecimentos1.zip', 'Estabelecimentos2.zip', 
        'Estabelecimentos3.zip', 'Estabelecimentos4.zip', 'Estabelecimentos5.zip',
        'Estabelecimentos6.zip', 'Estabelecimentos7.zip', 'Estabelecimentos8.zip',
        'Estabelecimentos9.zip',
        'Socios0.zip', 'Socios1.zip', 'Socios2.zip', 'Socios3.zip',
        'Simples.zip',
        'Cnaes.zip',
        'Motivos.zip', 
        'Paises.zip',
        'Qualificacoes.zip'
      ];
      
      const availableFiles: string[] = [];
      
      for (const pattern of patterns) {
        try {
          const response = await axios.head(`${this.config.baseUrl}/${pattern}`, {
            timeout: 5000
          });
          
          if (response.status === 200) {
            availableFiles.push(pattern);
          }
        } catch (error) {
          // File doesn't exist, continue
        }
      }
      
      return availableFiles;
      
    } catch (error) {
      console.error('[Downloader] Error discovering files:', error);
      throw error;
    }
  }

  private createSemaphore(limit: number) {
    let current = 0;
    const waiting: Array<() => void> = [];
    
    return {
      async acquire() {
        if (current < limit) {
          current++;
          return;
        }
        
        return new Promise<void>((resolve) => {
          waiting.push(resolve);
        });
      },
      
      release() {
        current--;
        const next = waiting.shift();
        if (next) {
          current++;
          next();
        }
      }
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  cancelAll(): void {
    console.log('[Downloader] Cancelling all active downloads...');
    for (const [fileName, controller] of this.activeDownloads) {
      controller.abort();
      console.log(`[Downloader] Cancelled: ${fileName}`);
    }
    this.activeDownloads.clear();
  }
}
```

## package.json exemplo para cnpj-etl app
```json
{
  "name": "cnpj-etl",
  "version": "1.0.0",
  "private": true,
  "description": "ETL service for processing CNPJ data from Receita Federal",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsx watch src/index.ts",
    "start": "node dist/index.js",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "lint": "eslint src/**/*.ts",
    "type-check": "tsc --noEmit",
    "etl:download": "tsx src/cli/download.ts",
    "etl:process": "tsx src/cli/process.ts",
    "etl:validate": "tsx src/cli/validate.ts",
    "etl:full": "npm run etl:download && npm run etl:process && npm run etl:validate",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@cnpj/core": "workspace:*",
    "@cnpj/types": "workspace:*", 
    "@cnpj/db": "workspace:*",
    "@cnpj/processor": "workspace:*",
    "axios": "catalog:",
    "csv-parse": "catalog:",
    "fast-csv": "catalog:",
    "unzipper": "^0.10.14",
    "commander": "^11.1.0",
    "chalk": "^5.3.0",
    "ora": "^7.0.1",
    "dotenv": "^16.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "tsx": "^4.6.0",
    "typescript": "catalog:",
    "vitest": "catalog:",
    "eslint": "catalog:"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## Script CLI para download automatizado
```typescript
// apps/cnpj-etl/src/cli/download.ts
#!/usr/bin/env node

import { Command } from 'commander';
import { RFBDownloader, DownloadConfig } from '../rfb-downloader';
import chalk from 'chalk';
import ora from 'ora';

const program = new Command();

program
  .name('cnpj-downloader')
  .description('Download CNPJ data files from Receita Federal')
  .version('1.0.0');

program
  .option('-o, --output <dir>', 'Output directory', './data/downloads')
  .option('-c, --concurrent <num>', 'Max concurrent downloads', '3')
  .option('-r, --retries <num>', 'Retry attempts', '3')
  .option('-t, --timeout <ms>', 'Request timeout', '300000')
  .option('--extract', 'Extract ZIP files after download')
  .action(async (options) => {
    const config: DownloadConfig = {
      baseUrl: process.env.RFB_BASE_URL || 'https://arquivos.receitafederal.gov.br/CNPJ',
      mirrorUrl: process.env.RFB_MIRROR_URL,
      outputDir: options.output,
      maxConcurrent: parseInt(options.concurrent),
      retryAttempts: parseInt(options.retries),
      timeout: parseInt(options.timeout)
    };

    console.log(chalk.blue('🚀 CNPJ Data Downloader'));
    console.log(chalk.gray(`Source: ${config.baseUrl}`));
    console.log(chalk.gray(`Output: ${config.outputDir}`));
    console.log();

    const downloader = new RFBDownloader(config);
    const spinner = ora('Initializing download...').start();

    try {
      const files = await downloader.downloadAllFiles((progress) => {
        const percent = progress.percentage.toFixed(1);
        const speed = (progress.speed / 1024 / 1024).toFixed(1); // MB/s
        
        spinner.text = `${progress.fileName}: ${percent}% (${speed} MB/s)`;
      });

      spinner.succeed(`Downloaded ${files.length} files successfully!`);

      if (options.extract) {
        spinner.start('Extracting files...');
        
        for (const file of files) {
          if (file.endsWith('.zip')) {
            await downloader.extractFile(file);
          }
        }
        
        spinner.succeed('All files extracted successfully!');
      }

    } catch (error) {
      spinner.fail('Download failed');
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

program.parse();
```

## Docker Compose para desenvolvimento
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: cnpj_db
      POSTGRES_USER: cnpj_user
      POSTGRES_PASSWORD: cnpj_pass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./data/sql:/docker-entrypoint-initdb.d
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  cnpj-api:
    build:
      context: .
      dockerfile: apps/cnpj-api/Dockerfile
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://cnpj_user:cnpj_pass@postgres:5432/cnpj_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - ./apps/cnpj-api:/app
      - /app/node_modules
    restart: unless-stopped

  cnpj-dashboard:
    build:
      context: .
      dockerfile: apps/cnpj-dashboard/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - VITE_API_BASE_URL=http://localhost:3001
    volumes:
      - ./apps/cnpj-dashboard:/app
      - /app/node_modules
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```