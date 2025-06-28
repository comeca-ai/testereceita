#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { CNPJEtl } from './index';

const program = new Command();
const etl = new CNPJEtl();

program
  .name('cnpj-etl')
  .description('Ferramenta de ETL para dados da Receita Federal')
  .version('1.0.0');

program
  .command('full')
  .description('Executa o ETL completo')
  .action(async () => {
    try {
      console.log(chalk.blue('Iniciando ETL completo...'));
      await etl.runFullEtl();
      console.log(chalk.green('ETL completo finalizado com sucesso!'));
    } catch (error) {
      console.error(chalk.red('Erro durante o ETL:'), error);
      process.exit(1);
    }
  });

program
  .command('empresas')
  .description('Processa apenas o arquivo de empresas')
  .action(async () => {
    try {
      console.log(chalk.blue('Processando empresas...'));
      const stats = await etl.processEmpresas();
      console.log(chalk.green(`Processamento de empresas concluído: ${stats.totalSuccess} registros processados com sucesso`));
    } catch (error) {
      console.error(chalk.red('Erro durante o processamento de empresas:'), error);
      process.exit(1);
    }
  });

program
  .command('estabelecimentos')
  .description('Processa apenas o arquivo de estabelecimentos')
  .action(async () => {
    try {
      console.log(chalk.blue('Processando estabelecimentos...'));
      const stats = await etl.processEstabelecimentos();
      console.log(chalk.green(`Processamento de estabelecimentos concluído: ${stats.totalSuccess} registros processados com sucesso`));
    } catch (error) {
      console.error(chalk.red('Erro durante o processamento de estabelecimentos:'), error);
      process.exit(1);
    }
  });

program
  .command('socios')
  .description('Processa apenas o arquivo de sócios')
  .action(async () => {
    try {
      console.log(chalk.blue('Processando sócios...'));
      const stats = await etl.processSocios();
      console.log(chalk.green(`Processamento de sócios concluído: ${stats.totalSuccess} registros processados com sucesso`));
    } catch (error) {
      console.error(chalk.red('Erro durante o processamento de sócios:'), error);
      process.exit(1);
    }
  });

program
  .command('simples')
  .description('Processa apenas o arquivo do Simples Nacional')
  .action(async () => {
    try {
      console.log(chalk.blue('Processando Simples Nacional...'));
      const stats = await etl.processSimples();
      console.log(chalk.green(`Processamento do Simples Nacional concluído: ${stats.totalSuccess} registros processados com sucesso`));
    } catch (error) {
      console.error(chalk.red('Erro durante o processamento do Simples Nacional:'), error);
      process.exit(1);
    }
  });

program.parse(process.argv);
