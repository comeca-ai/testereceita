import { PrismaClient } from '@prisma/client';

// Exporta o cliente Prisma para ser usado em outros pacotes
export const prisma = new PrismaClient();

// Função para testar a conexão com o banco de dados
export async function testConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    console.log('Conexão com o banco de dados estabelecida com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Função para criar a migração inicial
export async function createInitialMigration(): Promise<void> {
  // Esta função é apenas um placeholder
  // As migrações são gerenciadas pelo CLI do Prisma
  console.log('Use o comando "prisma migrate deploy" para aplicar as migrações');
}

// Exporta tipos do Prisma para uso em outros pacotes
export * from '@prisma/client';
