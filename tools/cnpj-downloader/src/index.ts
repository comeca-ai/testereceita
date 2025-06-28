import axios from 'axios';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as dotenv from 'dotenv';
import chalk from 'chalk';
import { Command } from 'commander';
import extract from 'extract-zip';
import ora from 'ora';
import pLimit from 'p-limit';

// Carrega as variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Configuração
const config = {
  baseUrl: 'https://dadosabertos.rfb.gov.br/CNPJ/',
  downloadDir: path.resolve(__dirname, '../downloads'),
  extractDir: path.resolve(__dirname, '../extracted'),
  concurrency: 2, // Número de downloads simultâneos
  files: [
    'Empresas.zip',
    'Estabelecimentos.zip',
    'Socios.zip',
    'Simples.zip',
    'Cnaes.zip',
    'Motivos.zip',
    'Municipios.zip',
    'Naturezas.zip',
    'Paises.zip',
    'Qualificacoes.zip'
  ]
};

// Cria os diretórios se não existirem
fs.ensureDirSync(config.downloadDir);
fs.ensureDirSync(config.extractDir);

// Função para baixar um arquivo
async function downloadFile(fileName: string): Promise<void> {
  const url = `${config.baseUrl}${fileName}`;
  const filePath = path.join(config.downloadDir, fileName);
  
  // Verifica se o arquivo já existe
  if (fs.existsSync(filePath)) {
    console.log(chalk.yellow(`Arquivo ${fileName} já existe. Pulando download.`));
    return;
  }
  
  const spinner = ora(`Baixando ${fileName}...`).start();
  
  try {
    const response = await axios({
      method: 'GET',
      url,
      responseType: 'stream'
    });
    
    const writer = fs.createWriteStream(filePath);
    
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        spinner.succeed(`Download de ${fileName} concluído`);
        resolve();
      });
      
      writer.on('error', (err) => {
        spinner.fail(`Erro no download de ${fileName}`);
        reject(err);
      });
    });
  } catch (error) {
    spinner.fail(`Erro no download de ${fileName}`);
    console.error(chalk.red(`Erro ao baixar ${fileName}:`), error);
    throw error;
  }
}

// Função para extrair um arquivo ZIP
async function extractFile(fileName: string): Promise<void> {
  const filePath = path.join(config.downloadDir, fileName);
  const extractPath = path.join(config.extractDir, fileName.replace('.zip', ''));
  
  // Verifica se o diretório de extração já existe
  if (fs.existsSync(extractPath) && fs.readdirSync(extractPath).length > 0) {
    console.log(chalk.yellow(`Diretório ${extractPath} já existe e não está vazio. Pulando extração.`));
    return;
  }
  
  fs.ensureDirSync(extractPath);
  
  const spinner = ora(`Extraindo ${fileName}...`).start();
  
  try {
    await extract(filePath, { dir: extractPath });
    spinner.succeed(`Extração de ${fileName} concluída`);
  } catch (error) {
    spinner.fail(`Erro na extração de ${fileName}`);
    console.error(chalk.red(`Erro ao extrair ${fileName}:`), error);
    throw error;
  }
}

// Função principal
async function main(): Promise<void> {
  console.log(chalk.blue('=== CNPJ Downloader ==='));
  console.log(chalk.gray(`Source: ${config.baseUrl}`));
  console.log(chalk.gray(`Download directory: ${config.downloadDir}`));
  console.log(chalk.gray(`Extract directory: ${config.extractDir}`));
  console.log('');
  
  // Limita o número de downloads simultâneos
  const limit = pLimit(config.concurrency);
  
  // Baixa todos os arquivos
  console.log(chalk.blue('Iniciando downloads...'));
  await Promise.all(
    config.files.map(file => limit(() => downloadFile(file)))
  );
  
  // Extrai todos os arquivos
  console.log(chalk.blue('Iniciando extrações...'));
  await Promise.all(
    config.files.map(file => extractFile(file))
  );
  
  console.log(chalk.green('Processo concluído com sucesso!'));
}

// Configura o CLI
const program = new Command();

program
  .name('cnpj-downloader')
  .description('Ferramenta para download de arquivos da Receita Federal')
  .version('1.0.0')
  .option('-d, --download-only', 'Apenas baixa os arquivos sem extrair')
  .option('-e, --extract-only', 'Apenas extrai os arquivos já baixados')
  .option('-f, --file <fileName>', 'Baixa apenas um arquivo específico')
  .option('-c, --concurrency <number>', 'Número de downloads simultâneos', '2')
  .action(async (options) => {
    try {
      // Atualiza a configuração com base nas opções
      if (options.concurrency) {
        config.concurrency = parseInt(options.concurrency, 10);
      }
      
      if (options.file) {
        config.files = [options.file];
      }
      
      if (options.downloadOnly) {
        // Apenas baixa os arquivos
        console.log(chalk.blue('Modo: apenas download'));
        const limit = pLimit(config.concurrency);
        await Promise.all(
          config.files.map(file => limit(() => downloadFile(file)))
        );
      } else if (options.extractOnly) {
        // Apenas extrai os arquivos
        console.log(chalk.blue('Modo: apenas extração'));
        await Promise.all(
          config.files.map(file => extractFile(file))
        );
      } else {
        // Executa o processo completo
        await main();
      }
    } catch (error) {
      console.error(chalk.red('Erro durante a execução:'), error);
      process.exit(1);
    }
  });

// Executa o programa
program.parse(process.argv);

// Se for importado como módulo, exporta as funções
export {
  downloadFile,
  extractFile,
  config
};
