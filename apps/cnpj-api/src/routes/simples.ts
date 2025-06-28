import express from 'express';
import { prisma } from 'cnpj-db';
import { CNPJProcessor } from 'cnpj-core';

const router = express.Router();

// Rota para obter dados do Simples Nacional pelo CNPJ base
router.get('/:cnpjBase', async (req, res) => {
  try {
    const { cnpjBase } = req.params;
    
    // Valida o CNPJ base
    if (!cnpjBase || cnpjBase.length !== 8) {
      return res.status(400).json({ error: 'CNPJ base inválido' });
    }
    
    // Consulta os dados do Simples Nacional
    const simplesNacional = await prisma.simplesNacional.findUnique({
      where: { cnpjBase },
      include: {
        empresa: {
          select: {
            razaoSocial: true,
            porte: true
          }
        }
      }
    });
    
    if (!simplesNacional) {
      return res.status(404).json({ error: 'Dados do Simples Nacional não encontrados' });
    }
    
    // Retorna os resultados
    res.json(simplesNacional);
  } catch (error) {
    console.error('Erro ao obter dados do Simples Nacional:', error);
    res.status(500).json({ error: 'Erro ao obter dados do Simples Nacional' });
  }
});

// Rota para obter dados do Simples Nacional pelo CNPJ completo
router.get('/cnpj/:cnpj', async (req, res) => {
  try {
    const { cnpj } = req.params;
    
    // Valida o CNPJ
    if (!CNPJProcessor.isValid(cnpj)) {
      return res.status(400).json({ error: 'CNPJ inválido' });
    }
    
    // Extrai o CNPJ base
    const cnpjBase = CNPJProcessor.extractBase(cnpj);
    
    // Consulta os dados do Simples Nacional
    const simplesNacional = await prisma.simplesNacional.findUnique({
      where: { cnpjBase },
      include: {
        empresa: {
          select: {
            razaoSocial: true,
            porte: true
          }
        }
      }
    });
    
    if (!simplesNacional) {
      return res.status(404).json({ error: 'Dados do Simples Nacional não encontrados' });
    }
    
    // Retorna os resultados
    res.json(simplesNacional);
  } catch (error) {
    console.error('Erro ao obter dados do Simples Nacional:', error);
    res.status(500).json({ error: 'Erro ao obter dados do Simples Nacional' });
  }
});

// Rota para listar empresas optantes pelo Simples Nacional
router.get('/', async (req, res) => {
  try {
    const { page = '1', limit = '10', optanteMEI } = req.query;
    
    // Valida e converte os parâmetros
    const pageNum = parseInt(page as string, 10);
    const limitNum = Math.min(parseInt(limit as string, 10), 100);
    const offset = (pageNum - 1) * limitNum;
    
    // Constrói o filtro
    const where: any = {
      optante: true
    };
    
    if (optanteMEI !== undefined) {
      where.optanteMEI = optanteMEI === 'true';
    }
    
    // Consulta as empresas optantes
    const [simplesNacional, total] = await Promise.all([
      prisma.simplesNacional.findMany({
        where,
        skip: offset,
        take: limitNum,
        include: {
          empresa: {
            select: {
              razaoSocial: true,
              porte: true,
              naturezaJuridica: true
            }
          }
        },
        orderBy: {
          dataOpcao: 'desc'
        }
      }),
      prisma.simplesNacional.count({ where })
    ]);
    
    // Calcula o total de páginas
    const pages = Math.ceil(total / limitNum);
    
    // Retorna os resultados
    res.json({
      data: simplesNacional,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages
      }
    });
  } catch (error) {
    console.error('Erro ao listar empresas optantes pelo Simples Nacional:', error);
    res.status(500).json({ error: 'Erro ao listar empresas optantes pelo Simples Nacional' });
  }
});

export default router;
