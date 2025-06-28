import express from 'express';
import { prisma } from 'cnpj-db';
import { z } from 'zod';

const router = express.Router();

// Schema de validação para parâmetros de consulta
const listSociosSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  nome: z.string().optional(),
  cnpjBase: z.string().optional(),
  qualificacao: z.string().optional(),
  identificador: z.string().optional()
});

// Rota para listar sócios
router.get('/', async (req, res) => {
  try {
    // Valida e converte os parâmetros de consulta
    const { page, limit, nome, cnpjBase, qualificacao, identificador } = 
      listSociosSchema.parse(req.query);
    
    // Calcula o offset para paginação
    const offset = (page - 1) * limit;
    
    // Constrói o filtro
    const where: any = {};
    
    if (nome) {
      where.nome = {
        contains: nome,
        mode: 'insensitive'
      };
    }
    
    if (cnpjBase) {
      where.cnpjBase = cnpjBase;
    }
    
    if (qualificacao) {
      where.qualificacao = qualificacao;
    }
    
    if (identificador) {
      where.identificador = identificador;
    }
    
    // Consulta os sócios
    const [socios, total] = await Promise.all([
      prisma.socio.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: {
          nome: 'asc'
        },
        include: {
          empresa: {
            select: {
              razaoSocial: true,
              naturezaJuridica: true,
              porte: true
            }
          }
        }
      }),
      prisma.socio.count({ where })
    ]);
    
    // Calcula o total de páginas
    const pages = Math.ceil(total / limit);
    
    // Retorna os resultados
    res.json({
      data: socios,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    });
  } catch (error) {
    console.error('Erro ao listar sócios:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Parâmetros inválidos', details: error.errors });
    }
    
    res.status(500).json({ error: 'Erro ao listar sócios' });
  }
});

// Rota para obter sócios de uma empresa pelo CNPJ base
router.get('/empresa/:cnpjBase', async (req, res) => {
  try {
    const { cnpjBase } = req.params;
    
    // Valida o CNPJ base
    if (!cnpjBase || cnpjBase.length !== 8) {
      return res.status(400).json({ error: 'CNPJ base inválido' });
    }
    
    // Consulta os sócios
    const socios = await prisma.socio.findMany({
      where: { cnpjBase },
      orderBy: {
        dataEntrada: 'desc'
      },
      include: {
        empresa: {
          select: {
            razaoSocial: true
          }
        }
      }
    });
    
    if (socios.length === 0) {
      return res.status(404).json({ error: 'Nenhum sócio encontrado para esta empresa' });
    }
    
    // Retorna os resultados
    res.json(socios);
  } catch (error) {
    console.error('Erro ao obter sócios da empresa:', error);
    res.status(500).json({ error: 'Erro ao obter sócios da empresa' });
  }
});

// Rota para obter empresas de um sócio pelo identificador (CPF/CNPJ)
router.get('/identificador/:identificador', async (req, res) => {
  try {
    const { identificador } = req.params;
    
    // Consulta os registros de sócio
    const registrosSocio = await prisma.socio.findMany({
      where: { identificador },
      include: {
        empresa: {
          include: {
            estabelecimentos: {
              where: {
                situacaoCadastral: '2' // Ativa
              },
              take: 1
            }
          }
        }
      }
    });
    
    if (registrosSocio.length === 0) {
      return res.status(404).json({ error: 'Nenhuma empresa encontrada para este sócio' });
    }
    
    // Formata os resultados
    const empresas = registrosSocio.map(registro => ({
      cnpjBase: registro.cnpjBase,
      razaoSocial: registro.empresa.razaoSocial,
      qualificacaoSocio: registro.qualificacao,
      dataEntrada: registro.dataEntrada,
      estabelecimentoPrincipal: registro.empresa.estabelecimentos[0] || null
    }));
    
    // Retorna os resultados
    res.json(empresas);
  } catch (error) {
    console.error('Erro ao obter empresas do sócio:', error);
    res.status(500).json({ error: 'Erro ao obter empresas do sócio' });
  }
});

// Rota para obter um sócio específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const socioId = parseInt(id, 10);
    
    if (isNaN(socioId)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    
    // Consulta o sócio
    const socio = await prisma.socio.findUnique({
      where: { id: socioId },
      include: {
        empresa: true
      }
    });
    
    if (!socio) {
      return res.status(404).json({ error: 'Sócio não encontrado' });
    }
    
    // Retorna os resultados
    res.json(socio);
  } catch (error) {
    console.error('Erro ao obter sócio:', error);
    res.status(500).json({ error: 'Erro ao obter sócio' });
  }
});

export default router;
