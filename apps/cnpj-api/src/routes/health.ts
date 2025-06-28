import express from 'express';
import { prisma } from 'cnpj-db';

const router = express.Router();

// Rota para verificar a saúde da API
router.get('/', async (req, res) => {
  try {
    // Verifica a conexão com o banco de dados
    await prisma.$queryRaw`SELECT 1`;
    
    // Retorna informações de saúde
    res.json({
      status: 'ok',
      version: '1.0.0',
      database: 'connected',
      uptime: process.uptime()
    });
  } catch (error) {
    console.error('Erro ao verificar saúde da API:', error);
    
    res.status(500).json({
      status: 'error',
      version: '1.0.0',
      database: 'disconnected',
      uptime: process.uptime(),
      error: 'Erro ao conectar ao banco de dados'
    });
  }
});

export default router;
