import * as fs from 'fs-extra';
import * as path from 'path';
import * as iconv from 'iconv-lite';
import chalk from 'chalk';
import pLimit from 'p-limit';
import { createReadStream } from 'fs';
import { ProcessingStats } from 'cnpj-types';
import { CNPJProcessor } from 'cnpj-core';

// Interfaces para os layouts de arquivos da Receita Federal
export interface RFBFileLayout {
  name: string;
  encoding: string;
  delimiter: string;
  columns: RFBColumn[];
}

export interface RFBColumn {
  name: string;
  start: number;
  end: number;
  type: 'string' | 'number' | 'date';
  format?: string;
}

// Layouts dos arquivos da Receita Federal
export const layouts: Record<string, RFBFileLayout> = {
  empresas: {
    name: 'Empresas',
    encoding: 'latin1',
    delimiter: ';',
    columns: [
      { name: 'cnpjBase', start: 0, end: 8, type: 'string' },
      { name: 'razaoSocial', start: 8, end: 168, type: 'string' },
      { name: 'naturezaJuridica', start: 168, end: 172, type: 'string' },
      { name: 'qualificacaoResponsavel', start: 172, end: 174, type: 'string' },
      { name: 'capitalSocial', start: 174, end: 189, type: 'number' },
      { name: 'porte', start: 189, end: 190, type: 'string' },
      { name: 'enteFederativo', start: 190, end: 290, type: 'string' }
    ]
  },
  estabelecimentos: {
    name: 'Estabelecimentos',
    encoding: 'latin1',
    delimiter: ';',
    columns: [
      { name: 'cnpjBase', start: 0, end: 8, type: 'string' },
      { name: 'cnpjOrdem', start: 8, end: 12, type: 'string' },
      { name: 'cnpjDV', start: 12, end: 14, type: 'string' },
      { name: 'identificadorMatrizFilial', start: 14, end: 15, type: 'string' },
      { name: 'nomeFantasia', start: 15, end: 55, type: 'string' },
      { name: 'situacaoCadastral', start: 55, end: 56, type: 'string' },
      { name: 'dataSituacaoCadastral', start: 56, end: 64, type: 'date', format: 'YYYYMMDD' },
      { name: 'motivoSituacaoCadastral', start: 64, end: 66, type: 'string' },
      { name: 'nomeCidadeExterior', start: 66, end: 156, type: 'string' },
      { name: 'paisExterior', start: 156, end: 158, type: 'string' },
      { name: 'dataInicioAtividade', start: 158, end: 166, type: 'date', format: 'YYYYMMDD' },
      { name: 'cnaePrincipal', start: 166, end: 173, type: 'string' },
      { name: 'cnaeSecundario', start: 173, end: 535, type: 'string' },
      { name: 'tipoLogradouro', start: 535, end: 555, type: 'string' },
      { name: 'logradouro', start: 555, end: 605, type: 'string' },
      { name: 'numero', start: 605, end: 611, type: 'string' },
      { name: 'complemento', start: 611, end: 631, type: 'string' },
      { name: 'bairro', start: 631, end: 691, type: 'string' },
      { name: 'cep', start: 691, end: 699, type: 'string' },
      { name: 'uf', start: 699, end: 701, type: 'string' },
      { name: 'municipio', start: 701, end: 705, type: 'string' },
      { name: 'ddd1', start: 705, end: 709, type: 'string' },
      { name: 'telefone1', start: 709, end: 718, type: 'string' },
      { name: 'ddd2', start: 718, end: 722, type: 'string' },
      { name: 'telefone2', start: 722, end: 731, type: 'string' },
      { name: 'dddFax', start: 731, end: 735, type: 'string' },
      { name: 'fax', start: 735, end: 744, type: 'string' },
      { name: 'email', start: 744, end: 884, type: 'string' },
      { name: 'situacaoEspecial', start: 884, end: 904, type: 'string' },
      { name: 'dataSituacaoEspecial', start: 904, end: 912, type: 'date', format: 'YYYYMMDD' }
    ]
  },
  socios: {
    name: 'Socios',
    encoding: 'latin1',
    delimiter: ';',
    columns: [
      { name: 'cnpjBase', start: 0, end: 8, type: 'string' },
      { name: 'identificadorSocio', start: 8, end: 9, type: 'string' },
      { name: 'nomeSocio', start: 9, end: 149, type: 'string' },
      { name: 'cpfCnpjSocio', start: 149, end: 163, type: 'string' },
      { name: 'qualificacaoSocio', start: 163, end: 165, type: 'string' },
      { name: 'dataEntradaSociedade', start: 165, end: 173, type: 'date', format: 'YYYYMMDD' },
      { name: 'pais', start: 173, end: 175, type: 'string' },
      { name: 'representanteLegal', start: 175, end: 315, type: 'string' },
      { name: 'nomeRepresentante', start: 315, end: 455, type: 'string' },
      { name: 'qualificacaoRepresentante', start: 455, end: 457, type: 'string' },
      { name: 'faixaEtaria', start: 457, end: 458, type: 'string' }
    ]
  },
  simples: {
    name: 'Simples',
    encoding: 'latin1',
    delimiter: ';',
    columns: [
      { name: 'cnpjBase', start: 0, end: 8, type: 'string' },
      { name: 'optanteSimples', start: 8, end: 9, type: 'string' },
      { name: 'dataOpcaoSimples', start: 9, end: 17, type: 'date', format: 'YYYYMMDD' },
      { name: 'dataExclusaoSimples', start: 17, end: 25, type: 'date', format: 'YYYYMMDD' },
      { name: 'optanteMEI', start: 25, end: 26, type: 'string' },
      { name: 'dataOpcaoMEI', start: 26, end: 34, type: 'date', format: 'YYYYMMDD' },
      { name: 'dataExclusaoMEI', start: 34, end: 42, type: 'date', format: 'YYYYMMDD' }
    ]
  }
};

/**
 * Classe para processamento de arquivos da Receita Federal
 */
export class RFBProcessor {
  private concurrency: number;
  
  constructor(concurrency = 4) {
    this.concurrency = concurrency;
  }
  
  /**
   * Processa um arquivo da Receita Federal
   * @param filePath Caminho para o arquivo
   * @param layout Layout do arquivo
   * @param processor Função para processar cada linha
   * @returns Estatísticas de processamento
   */
  public async processFile(
    filePath: string,
    layout: RFBFileLayout,
    processor: (record: Record<string, any>) => Promise<boolean>
  ): Promise<ProcessingStats> {
    console.log(chalk.blue(`Processando arquivo ${path.basename(filePath)}...`));
    
    const stats: ProcessingStats = {
      totalProcessed: 0,
      totalSuccess: 0,
      totalErrors: 0,
      startTime: new Date()
    };
    
    // Verifica se o arquivo existe
    if (!fs.existsSync(filePath)) {
      throw new Error(`Arquivo não encontrado: ${filePath}`);
    }
    
    // Cria um stream de leitura
    const fileStream = createReadStream(filePath);
    const decoder = iconv.decodeStream(layout.encoding);
    
    // Processa o arquivo linha por linha
    const limit = pLimit(this.concurrency);
    const promises: Promise<void>[] = [];
    
    return new Promise((resolve, reject) => {
      let buffer = '';
      
      fileStream.pipe(decoder)
        .on('data', (chunk: string) => {
          buffer += chunk;
          
          // Processa linhas completas
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            if (line.trim() === '') continue;
            
            stats.totalProcessed++;
            
            // Processa a linha
            const promise = limit(async () => {
              try {
                const record = this.parseLine(line, layout);
                const success = await processor(record);
                
                if (success) {
                  stats.totalSuccess++;
                } else {
                  stats.totalErrors++;
                }
              } catch (error) {
                console.error(chalk.red(`Erro ao processar linha: ${error}`));
                stats.totalErrors++;
              }
            });
            
            promises.push(promise);
            
            // Log de progresso a cada 100.000 registros
            if (stats.totalProcessed % 100000 === 0) {
              console.log(chalk.gray(`Processados ${stats.totalProcessed.toLocaleString()} registros...`));
            }
          }
        })
        .on('end', async () => {
          // Processa o buffer restante
          if (buffer.trim() !== '') {
            stats.totalProcessed++;
            
            try {
              const record = this.parseLine(buffer, layout);
              const success = await processor(record);
              
              if (success) {
                stats.totalSuccess++;
              } else {
                stats.totalErrors++;
              }
            } catch (error) {
              console.error(chalk.red(`Erro ao processar linha: ${error}`));
              stats.totalErrors++;
            }
          }
          
          // Aguarda todas as promessas
          try {
            await Promise.all(promises);
            
            // Calcula o tempo de processamento
            stats.endTime = new Date();
            stats.elapsedTimeMs = stats.endTime.getTime() - stats.startTime.getTime();
            
            console.log(chalk.green(`Processamento concluído em ${(stats.elapsedTimeMs / 1000).toFixed(2)}s`));
            console.log(chalk.green(`Total de registros: ${stats.totalProcessed.toLocaleString()}`));
            console.log(chalk.green(`Sucessos: ${stats.totalSuccess.toLocaleString()}`));
            console.log(chalk.green(`Erros: ${stats.totalErrors.toLocaleString()}`));
            
            resolve(stats);
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }
  
  /**
   * Converte uma linha do arquivo para um objeto
   * @param line Linha do arquivo
   * @param layout Layout do arquivo
   * @returns Objeto com os dados da linha
   */
  private parseLine(line: string, layout: RFBFileLayout): Record<string, any> {
    const record: Record<string, any> = {};
    
    for (const column of layout.columns) {
      const value = line.substring(column.start, column.end).trim();
      
      // Converte o valor para o tipo correto
      switch (column.type) {
        case 'string':
          record[column.name] = value;
          break;
        
        case 'number':
          record[column.name] = value === '' ? null : parseFloat(value);
          break;
        
        case 'date':
          if (value === '' || value === '00000000') {
            record[column.name] = null;
          } else {
            // Converte para Date conforme o formato
            if (column.format === 'YYYYMMDD') {
              const year = parseInt(value.substring(0, 4));
              const month = parseInt(value.substring(4, 6)) - 1; // Mês em JS é 0-indexed
              const day = parseInt(value.substring(6, 8));
              record[column.name] = new Date(year, month, day);
            } else {
              record[column.name] = new Date(value);
            }
          }
          break;
      }
    }
    
    return record;
  }
  
  /**
   * Processa CNAEs secundários de um estabelecimento
   * @param cnaeString String com CNAEs secundários
   * @returns Array de CNAEs secundários
   */
  public static processSecondaryActivities(cnaeString: string): string[] {
    if (!cnaeString || cnaeString.trim() === '') {
      return [];
    }
    
    // CNAEs são separados por vírgula e possuem 7 dígitos
    return cnaeString
      .split(',')
      .map(cnae => cnae.trim())
      .filter(cnae => cnae.length === 7);
  }
  
  /**
   * Monta um CNPJ completo a partir de suas partes
   * @param base Base do CNPJ (8 dígitos)
   * @param ordem Ordem do CNPJ (4 dígitos)
   * @param dv Dígitos verificadores (2 dígitos)
   * @returns CNPJ completo formatado
   */
  public static buildCNPJ(base: string, ordem: string, dv: string): string {
    const cnpj = `${base}${ordem}${dv}`;
    return CNPJProcessor.format(cnpj);
  }
}

export default RFBProcessor;
