import express from 'express';
import { prisma } from 'cnpj-db';
import { z } from 'zod';
import { CNPJProcessor } from 'cnpj-core';

const router = express.Router();

// Schema de validação para parâmetros de consulta
const listEmpresasSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  razaoSocial: z.string().optional(),
  naturezaJuridica: z.string().optional(),
  porte: z.string().optional(),
  cnpjBase: z.string().optional()
});

// Rota para listar empresas
router.get('/', async (req, res) => {
  try {
    // Valida e converte os parâmetros de consulta
    const { page, limit, razaoSocial, naturezaJuridica, porte, cnpjBase } = listEmpresasSchema.parse(req.query);
    
    // Calcula o offset para paginação
    const offset = (page - 1) * limit;
    
    // Constrói o filtro
    const where: any = {};
    
    if (razaoSocial) {
      where.razaoSocial = {
        contains: razaoSocial,
        mode: 'insensitive'
      };
    }
    
    if (naturezaJuridica) {
      where.naturezaJuridica = naturezaJuridica;
    }
    
    if (porte) {
      where.porte = porte;
    }
    
    if (cnpjBase) {
      where.cnpjBase = cnpjBase;
    }
    
    // Consulta as empresas
    const [empresas, total] = await Promise.all([
      prisma.empresa.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: {
          razaoSocial: 'asc'
        }
      }),
      prisma.empresa.count({ where })
    ]);
    
    // Calcula o total de páginas
    const pages = Math.ceil(total / limit);
    
    // Retorna os resultados
    res.json({
      data: empresas,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    });
  } catch (error) {
    console.error('Erro ao listar empresas:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Parâmetros inválidos', details: error.errors });
    }
    
    res.status(500).json({ error: 'Erro ao listar empresas' });
  }
});

// Rota para obter uma empresa pelo CNPJ base
router.get('/:cnpjBase', async (req, res) => {
  try {
    const { cnpjBase } = req.params;
    
    // Valida o CNPJ base
    if (!cnpjBase || cnpjBase.length !== 8) {
      return res.status(400).json({ error: 'CNPJ base inválido' });
    }
    
    // Consulta a empresa
    const empresa = await prisma.empresa.findUnique({
      where: { cnpjBase },
      include: {
        estabelecimentos: true,
        socios: true,
        simplesNacional: true
      }
    });
    
    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }
    
    // Retorna os resultados
    res.json(empresa);
  } catch (error) {
    console.error('Erro ao obter empresa:', error);
    res.status(500).json({ error: 'Erro ao obter empresa' });
  }
});

// Rota para buscar empresa por CNPJ completo
router.get('/cnpj/:cnpj', async (req, res) => {
  try {
    const { cnpj } = req.params;
    
    // Valida o CNPJ
    if (!CNPJProcessor.isValid(cnpj)) {
      return res.status(400).json({ error: 'CNPJ inválido' });
    }
    
    // Extrai o CNPJ base
    const cnpjBase = CNPJProcessor.extractBase(cnpj);
    
    // Consulta a empresa
    const empresa = await prisma.empresa.findUnique({
      where: { cnpjBase },
      include: {
        estabelecimentos: {
          where: { cnpj: CNPJProcessor.format(cnpj) }
        },
        socios: true,
        simplesNacional: true
      }
    });
    
    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }
    
    // Retorna os resultados
    res.json(empresa);
  } catch (error) {
    console.error('Erro ao obter empresa por CNPJ:', error);
    res.status(500).json({ error: 'Erro ao obter empresa por CNPJ' });
  }
});

export default router;
