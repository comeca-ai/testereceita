"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cnpj_db_1 = require("cnpj-db");
const zod_1 = require("zod");
const cnpj_core_1 = require("cnpj-core");
const router = express_1.default.Router();
// Schema de validação para parâmetros de consulta
const listEmpresasSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(10),
    razaoSocial: zod_1.z.string().optional(),
    naturezaJuridica: zod_1.z.string().optional(),
    porte: zod_1.z.string().optional(),
    cnpjBase: zod_1.z.string().optional()
});
// Rota para listar empresas
router.get('/', async (req, res) => {
    try {
        // Valida e converte os parâmetros de consulta
        const { page, limit, razaoSocial, naturezaJuridica, porte, cnpjBase } = listEmpresasSchema.parse(req.query);
        // Calcula o offset para paginação
        const offset = (page - 1) * limit;
        // Constrói o filtro
        const where = {};
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
            cnpj_db_1.prisma.empresa.findMany({
                where,
                skip: offset,
                take: limit,
                orderBy: {
                    razaoSocial: 'asc'
                }
            }),
            cnpj_db_1.prisma.empresa.count({ where })
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
    }
    catch (error) {
        console.error('Erro ao listar empresas:', error);
        if (error instanceof zod_1.z.ZodError) {
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
        const empresa = await cnpj_db_1.prisma.empresa.findUnique({
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
    }
    catch (error) {
        console.error('Erro ao obter empresa:', error);
        res.status(500).json({ error: 'Erro ao obter empresa' });
    }
});
// Rota para buscar empresa por CNPJ completo
router.get('/cnpj/:cnpj', async (req, res) => {
    try {
        const { cnpj } = req.params;
        // Valida o CNPJ
        if (!cnpj_core_1.CNPJProcessor.isValid(cnpj)) {
            return res.status(400).json({ error: 'CNPJ inválido' });
        }
        // Extrai o CNPJ base
        const cnpjBase = cnpj_core_1.CNPJProcessor.extractBase(cnpj);
        // Consulta a empresa
        const empresa = await cnpj_db_1.prisma.empresa.findUnique({
            where: { cnpjBase },
            include: {
                estabelecimentos: {
                    where: { cnpj: cnpj_core_1.CNPJProcessor.format(cnpj) }
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
    }
    catch (error) {
        console.error('Erro ao obter empresa por CNPJ:', error);
        res.status(500).json({ error: 'Erro ao obter empresa por CNPJ' });
    }
});
exports.default = router;
//# sourceMappingURL=empresas.js.map