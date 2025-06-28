import * as fs from 'fs-extra';
import * as path from 'path';
import * as dotenv from 'dotenv';
import chalk from 'chalk';
import ora from 'ora';
import { prisma } from 'cnpj-db';
import { RFBProcessor, layouts } from 'cnpj-processor';
import { ProcessingStats } from 'cnpj-types';

// Carrega as variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Configuração
const config = {
  extractDir: process.env.RFB_EXTRACT_DIR || path.resolve(__dirname, '../../../data/extracted'),
  concurrency: parseInt(process.env.ETL_CONCURRENCY || '4', 10)
};

/**
 * Classe para orquestração do ETL de dados da Receita Federal
 */
export class CNPJEtl {
  private processor: RFBProcessor;
  
  constructor() {
    this.processor = new RFBProcessor(config.concurrency);
  }
  
  /**
   * Executa o ETL completo
   */
  public async runFullEtl(): Promise<void> {
    console.log(chalk.blue('=== CNPJ ETL - Processo Completo ==='));
    
    try {
      // Conecta ao banco de dados
      await prisma.$connect();
      
      // Executa os ETLs em sequência
      await this.processEmpresas();
      await this.processEstabelecimentos();
      await this.processSocios();
      await this.processSimples();
      
      console.log(chalk.green('ETL completo finalizado com sucesso!'));
    } catch (error) {
      console.error(chalk.red('Erro durante o ETL:'), error);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }
  
  /**
   * Processa o arquivo de empresas
   */
  public async processEmpresas(): Promise<ProcessingStats> {
    console.log(chalk.blue('=== Processando Empresas ==='));
    
    const filePath = path.join(config.extractDir, 'Empresas', 'K3241.K03200Y0.D30513.EMPRECSV');
    const layout = layouts.empresas;
    
    const stats = await this.processor.processFile(filePath, layout, async (record) => {
      try {
        // Cria ou atualiza a empresa no banco de dados
        await prisma.empresa.upsert({
          where: {
            cnpjBase: record.cnpjBase
          },
          update: {
            razaoSocial: record.razaoSocial,
            naturezaJuridica: record.naturezaJuridica,
            qualificacaoResponsavel: record.qualificacaoResponsavel,
            capitalSocial: record.capitalSocial,
            porte: record.porte,
            enteFederativo: record.enteFederativo
          },
          create: {
            cnpjBase: record.cnpjBase,
            razaoSocial: record.razaoSocial,
            naturezaJuridica: record.naturezaJuridica,
            qualificacaoResponsavel: record.qualificacaoResponsavel,
            capitalSocial: record.capitalSocial,
            porte: record.porte,
            enteFederativo: record.enteFederativo
          }
        });
        
        return true;
      } catch (error) {
        console.error(chalk.red(`Erro ao processar empresa ${record.cnpjBase}:`), error);
        return false;
      }
    });
    
    // Registra a importação
    await this.registerImport('empresas', 'K3241.K03200Y0.D30513.EMPRECSV', stats);
    
    return stats;
  }
  
  /**
   * Processa o arquivo de estabelecimentos
   */
  public async processEstabelecimentos(): Promise<ProcessingStats> {
    console.log(chalk.blue('=== Processando Estabelecimentos ==='));
    
    const filePath = path.join(config.extractDir, 'Estabelecimentos', 'K3241.K03200Y0.D30513.ESTABELE');
    const layout = layouts.estabelecimentos;
    
    const stats = await this.processor.processFile(filePath, layout, async (record) => {
      try {
        // Monta o CNPJ completo
        const cnpj = RFBProcessor.buildCNPJ(record.cnpjBase, record.cnpjOrdem, record.cnpjDV);
        
        // Processa CNAEs secundários
        const cnaesSecundarios = RFBProcessor.processSecondaryActivities(record.cnaeSecundario);
        
        // Cria ou atualiza o estabelecimento no banco de dados
        const estabelecimento = await prisma.estabelecimento.upsert({
          where: {
            cnpj: cnpj
          },
          update: {
            cnpjBase: record.cnpjBase,
            nomeFantasia: record.nomeFantasia,
            situacaoCadastral: record.situacaoCadastral,
            dataSituacaoCadastral: record.dataSituacaoCadastral,
            motivoSituacaoCadastral: record.motivoSituacaoCadastral,
            dataInicioAtividade: record.dataInicioAtividade,
            cnaePrincipal: record.cnaePrincipal,
            logradouro: record.logradouro,
            numero: record.numero,
            complemento: record.complemento,
            bairro: record.bairro,
            cep: record.cep,
            municipio: record.municipio,
            uf: record.uf,
            telefone1: record.ddd1 ? `${record.ddd1}${record.telefone1}` : null,
            telefone2: record.ddd2 ? `${record.ddd2}${record.telefone2}` : null,
            email: record.email
          },
          create: {
            cnpj: cnpj,
            cnpjBase: record.cnpjBase,
            nomeFantasia: record.nomeFantasia,
            situacaoCadastral: record.situacaoCadastral,
            dataSituacaoCadastral: record.dataSituacaoCadastral,
            motivoSituacaoCadastral: record.motivoSituacaoCadastral,
            dataInicioAtividade: record.dataInicioAtividade,
            cnaePrincipal: record.cnaePrincipal,
            logradouro: record.logradouro,
            numero: record.numero,
            complemento: record.complemento,
            bairro: record.bairro,
            cep: record.cep,
            municipio: record.municipio,
            uf: record.uf,
            telefone1: record.ddd1 ? `${record.ddd1}${record.telefone1}` : null,
            telefone2: record.ddd2 ? `${record.ddd2}${record.telefone2}` : null,
            email: record.email
          }
        });
        
        // Remove CNAEs secundários existentes
        await prisma.cnaeSecundario.deleteMany({
          where: {
            estabelecimentoId: estabelecimento.id
          }
        });
        
        // Adiciona CNAEs secundários
        if (cnaesSecundarios.length > 0) {
          await prisma.cnaeSecundario.createMany({
            data: cnaesSecundarios.map(cnae => ({
              estabelecimentoId: estabelecimento.id,
              codigo: cnae
            }))
          });
        }
        
        return true;
      } catch (error) {
        console.error(chalk.red(`Erro ao processar estabelecimento ${record.cnpjBase}${record.cnpjOrdem}${record.cnpjDV}:`), error);
        return false;
      }
    });
    
    // Registra a importação
    await this.registerImport('estabelecimentos', 'K3241.K03200Y0.D30513.ESTABELE', stats);
    
    return stats;
  }
  
  /**
   * Processa o arquivo de sócios
   */
  public async processSocios(): Promise<ProcessingStats> {
    console.log(chalk.blue('=== Processando Sócios ==='));
    
    const filePath = path.join(config.extractDir, 'Socios', 'K3241.K03200Y0.D30513.SOCIOCSV');
    const layout = layouts.socios;
    
    const stats = await this.processor.processFile(filePath, layout, async (record) => {
      try {
        // Cria ou atualiza o sócio no banco de dados
        await prisma.socio.upsert({
          where: {
            id: `${record.cnpjBase}-${record.cpfCnpjSocio}`.hashCode() // Cria um ID único
          },
          update: {
            cnpjBase: record.cnpjBase,
            identificador: record.cpfCnpjSocio,
            nome: record.nomeSocio,
            qualificacao: record.qualificacaoSocio,
            dataEntrada: record.dataEntradaSociedade,
            pais: record.pais,
            representanteLegal: record.nomeRepresentante,
            identificadorRepresentante: record.representanteLegal
          },
          create: {
            cnpjBase: record.cnpjBase,
            identificador: record.cpfCnpjSocio,
            nome: record.nomeSocio,
            qualificacao: record.qualificacaoSocio,
            dataEntrada: record.dataEntradaSociedade,
            pais: record.pais,
            representanteLegal: record.nomeRepresentante,
            identificadorRepresentante: record.representanteLegal
          }
        });
        
        return true;
      } catch (error) {
        console.error(chalk.red(`Erro ao processar sócio ${record.cnpjBase}-${record.cpfCnpjSocio}:`), error);
        return false;
      }
    });
    
    // Registra a importação
    await this.registerImport('socios', 'K3241.K03200Y0.D30513.SOCIOCSV', stats);
    
    return stats;
  }
  
  /**
   * Processa o arquivo do Simples Nacional
   */
  public async processSimples(): Promise<ProcessingStats> {
    console.log(chalk.blue('=== Processando Simples Nacional ==='));
    
    const filePath = path.join(config.extractDir, 'Simples', 'K3241.K03200Y0.D30513.SIMPLES.CSV');
    const layout = layouts.simples;
    
    const stats = await this.processor.processFile(filePath, layout, async (record) => {
      try {
        // Cria ou atualiza o registro do Simples Nacional no banco de dados
        await prisma.simplesNacional.upsert({
          where: {
            cnpjBase: record.cnpjBase
          },
          update: {
            optante: record.optanteSimples === 'S',
            dataOpcao: record.dataOpcaoSimples,
            dataExclusao: record.dataExclusaoSimples,
            optanteMEI: record.optanteMEI === 'S'
          },
          create: {
            cnpjBase: record.cnpjBase,
            optante: record.optanteSimples === 'S',
            dataOpcao: record.dataOpcaoSimples,
            dataExclusao: record.dataExclusaoSimples,
            optanteMEI: record.optanteMEI === 'S'
          }
        });
        
        return true;
      } catch (error) {
        console.error(chalk.red(`Erro ao processar Simples Nacional ${record.cnpjBase}:`), error);
        return false;
      }
    });
    
    // Registra a importação
    await this.registerImport('simples', 'K3241.K03200Y0.D30513.SIMPLES.CSV', stats);
    
    return stats;
  }
  
  /**
   * Registra uma importação no banco de dados
   */
  private async registerImport(
    tipoArquivo: string,
    nomeArquivo: string,
    stats: ProcessingStats
  ): Promise<void> {
    await prisma.importacaoRFB.create({
      data: {
        tipoArquivo,
        nomeArquivo,
        dataImportacao: new Date(),
        registrosProcessados: stats.totalProcessed,
        registrosSucesso: stats.totalSuccess,
        registrosErro: stats.totalErrors,
        tempoProcessamento: stats.elapsedTimeMs || 0
      }
    });
  }
}

export default CNPJEtl;
