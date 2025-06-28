"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const express_rate_limit_1 = require("express-rate-limit");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const cnpj_db_1 = require("cnpj-db");
// Rotas
const empresas_1 = __importDefault(require("./routes/empresas"));
const estabelecimentos_1 = __importDefault(require("./routes/estabelecimentos"));
const socios_1 = __importDefault(require("./routes/socios"));
const simples_1 = __importDefault(require("./routes/simples"));
const health_1 = __importDefault(require("./routes/health"));
const swagger_1 = __importDefault(require("./swagger"));
// Carrega as variáveis de ambiente
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
// Configuração
const app = (0, express_1.default)();
const port = process.env.API_PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use((0, compression_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Rate limiting
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // limite por IP
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
// Rotas
app.use('/api/empresas', empresas_1.default);
app.use('/api/estabelecimentos', estabelecimentos_1.default);
app.use('/api/socios', socios_1.default);
app.use('/api/simples', simples_1.default);
app.use('/api/health', health_1.default);
// Documentação Swagger
app.use('/api/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
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
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Erro interno do servidor' });
});
// Inicia o servidor
const server = app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    // Testa a conexão com o banco de dados
    cnpj_db_1.prisma.$connect()
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
        await cnpj_db_1.prisma.$disconnect();
        console.log('Servidor encerrado');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    console.log('SIGINT recebido. Encerrando servidor...');
    server.close(async () => {
        await cnpj_db_1.prisma.$disconnect();
        console.log('Servidor encerrado');
        process.exit(0);
    });
});
exports.default = app;
//# sourceMappingURL=index.js.map