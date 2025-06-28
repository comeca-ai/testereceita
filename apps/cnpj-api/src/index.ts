import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { rateLimit } from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { prisma } from 'cnpj-db';

// Rotas
import empresasRouter from './routes/empresas';
import estabelecimentosRouter from './routes/estabelecimentos';
import sociosRouter from './routes/socios';
import simplesRouter from './routes/simples';
import healthRouter from './routes/health';
import swaggerDocument from './swagger';

// Carrega as variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Configuração
const app = express();
const port = process.env.API_PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite por IP
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Rotas
app.use('/api/empresas', empresasRouter);
app.use('/api/estabelecimentos', estabelecimentosRouter);
app.use('/api/socios', sociosRouter);
app.use('/api/simples', simplesRouter);
app.use('/api/health', healthRouter);

// Documentação Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rota padrão
app.get('/', (req, res) => {
  res.json({
    message: 'API de consulta de dados de CNPJ',
    version: '1.0.0',
    docs: '/api/docs'
  });
});

// Tratamento de erros
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Inicia o servidor
const server = app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  
  // Testa a conexão com o banco de dados
  prisma.$connect()
    .then(() => {
      console.log('Conexão com o banco de dados estabelecida');
    })
    .catch((error) => {
      console.error('Erro ao conectar ao banco de dados:', error);
      process.exit(1);
    });
});

// Tratamento de sinais para encerramento adequado
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido. Encerrando servidor...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Servidor encerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT recebido. Encerrando servidor...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Servidor encerrado');
    process.exit(0);
  });
});

export default app;
