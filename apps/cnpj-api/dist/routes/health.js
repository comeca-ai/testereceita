"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cnpj_db_1 = require("cnpj-db");
const router = express_1.default.Router();
// Rota para verificar a saúde da API
router.get('/', async (req, res) => {
    try {
        // Verifica a conexão com o banco de dados
        await cnpj_db_1.prisma.$queryRaw `SELECT 1`;
        // Retorna informações de saúde
        res.json({
            status: 'ok',
            version: '1.0.0',
            database: 'connected',
            uptime: process.uptime()
        });
    }
    catch (error) {
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
exports.default = router;
//# sourceMappingURL=health.js.map