import express from 'express';
import { prisma } from 'cnpj-db';
import { z } from 'zod';
import { CNPJProcessor } from 'cnpj-core';

const router = express.Router();

// Schema de validação para parâmetros de consulta
const listEstabelecimentosSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  nomeFantasia: z.string().optional(),
  situacaoCadastral: z.string().optional(),
  cnaePrincipal: z.string().optional(),
  municipio: z.string().optional(),
  uf: z.string().optional(),
  cnpjBase: z.string().optional()
});

// Rota para listar estabelecimentos
router.get('/', async (req, res) => {
  try {
    // Valida e converte os parâmetros de consulta
    const { page, limit, nomeFantasia, situacaoCadastral, cnaePrincipal, municipio, uf, cnpjBase } = 
      listEstabelecimentosSchema.parse(req.query);
    
    // Calcula o offset para paginação
    const offset = (page - 1) * limit;
    
    // Constrói o filtro
    const where: any = {};
    
    if (nomeFantasia) {
      where.nomeFantasia = {
        contains: nomeFantasia,
        mode: 'insensitive'
      };
    }
    
    if (situacaoCadastral) {
      where.situacaoCadastral = situacaoCadastral;
    }
    
    if (cnaePrincipal) {
      where.cnaePrincipal = cnaePrincipal;
    }
    
    if (municipio) {
      where.municipio = municipio;
    }
    
    if (uf) {
      where.uf = uf;
    }
    
    if (cnpjBase) {
      where.cnpjBase = cnpjBase;
    }
    
    // Consulta os estabelecimentos
    const [estabelecimentos, total] = await Promise.all([
      prisma.estabelecimento.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: {
          nomeFantasia: 'asc'
        },
        include: {
          cnaesSecundarios: true
        }
      }),
      prisma.estabelecimento.count({ where })
    ]);
    
    // Calcula o total de páginas
    const pages = Math.ceil(total / limit);
    
    // Retorna os resultados
    res.json({
      data: estabelecimentos,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    });
  } catch (error) {
    console.error('Erro ao listar estabelecimentos:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Parâmetros inválidos', details: error.errors });
    }
    
    res.status(500).json({ error: 'Erro ao listar estabelecimentos' });
  }
});

// Rota para obter um estabelecimento pelo CNPJ
router.get('/:cnpj', async (req, res) => {
  try {
    const { cnpj } = req.params;
    
    // Valida o CNPJ
    if (!CNPJProcessor.isValid(cnpj)) {
      return res.status(400).json({ error: 'CNPJ inválido' });
    }
    
    // Formata o CNPJ
    const cnpjFormatado = CNPJProcessor.format(cnpj);
    
    // Consulta o estabelecimento
    const estabelecimento = await prisma.estabelecimento.findUnique({
      where: { cnpj: cnpjFormatado },
      include: {
        empresa: true,
        cnaesSecundarios: true
      }
    });
    
    if (!estabelecimento) {
      return res.status(404).json({ error: 'Estabelecimento não encontrado' });
    }
    
    // Retorna os resultados
    res.json(estabelecimento);
  } catch (error) {
    console.error('Erro ao obter estabelecimento:', error);
    res.status(500).json({ error: 'Erro ao obter estabelecimento' });
  }
});

// Rota para buscar estabelecimentos por CNAE
router.get('/cnae/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    // Valida e converte os parâmetros
    const pageNum = parseInt(page as string, 10);
    const limitNum = Math.min(parseInt(limit as string, 10), 100);
    const offset = (pageNum - 1) * limitNum;
    
    // Busca estabelecimentos com CNAE principal ou secundário
    const [estabelecimentosPrincipal, estabelecimentosSecundario, totalPrincipal, totalSecundario] = await Promise.all([
      // Estabelecimentos com CNAE principal
      prisma.estabelecimento.findMany({
        where: { cnaePrincipal: codigo },
        skip: offset,
        take: limitNum
      }),
      
      // Estabelecimentos com CNAE secundário
      prisma.estabelecimento.findMany({
        where: {
          cnaesSecundarios: {
            some: { codigo }
          }
        },
        skip: offset,
        take: limitNum,
        include: {
          cnaesSecundarios: {
            where: { codigo }
          }
        }
      }),
      
      // Total de estabelecimentos com CNAE principal
      prisma.estabelecimento.count({
        where: { cnaePrincipal: codigo }
      }),
      
      // Total de estabelecimentos com CNAE secundário
      prisma.estabelecimento.count({
        where: {
          cnaesSecundarios: {
            some: { codigo }
          }
        }
      })
    ]);
    
    // Combina os resultados
    const estabelecimentos = [
      ...estabelecimentosPrincipal.map(e => ({ ...e, tipoAtividade: 'principal' })),
      ...estabelecimentosSecundario.map(e => ({ ...e, tipoAtividade: 'secundaria' }))
    ];
    
    const total = totalPrincipal + totalSecundario;
    const pages = Math.ceil(total / limitNum);
    
    // Retorna os resultados
    res.json({
      data: estabelecimentos,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages
      },
      summary: {
        totalPrincipal,
        totalSecundario
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estabelecimentos por CNAE:', error);
    res.status(500).json({ error: 'Erro ao buscar estabelecimentos por CNAE' });
  }
});

export default router;
