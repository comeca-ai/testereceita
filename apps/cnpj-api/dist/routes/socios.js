"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cnpj_db_1 = require("cnpj-db");
const zod_1 = require("zod");
const router = express_1.default.Router();
// Schema de validação para parâmetros de consulta
const listSociosSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(10),
    nome: zod_1.z.string().optional(),
    cnpjBase: zod_1.z.string().optional(),
    qualificacao: zod_1.z.string().optional(),
    identificador: zod_1.z.string().optional()
});
// Rota para listar sócios
router.get('/', async (req, res) => {
    try {
        // Valida e converte os parâmetros de consulta
        const { page, limit, nome, cnpjBase, qualificacao, identificador } = listSociosSchema.parse(req.query);
        // Calcula o offset para paginação
        const offset = (page - 1) * limit;
        // Constrói o filtro
        const where = {};
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
            cnpj_db_1.prisma.socio.findMany({
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
            cnpj_db_1.prisma.socio.count({ where })
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
    }
    catch (error) {
        console.error('Erro ao listar sócios:', error);
        if (error instanceof zod_1.z.ZodError) {
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
        const socios = await cnpj_db_1.prisma.socio.findMany({
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
    }
    catch (error) {
        console.error('Erro ao obter sócios da empresa:', error);
        res.status(500).json({ error: 'Erro ao obter sócios da empresa' });
    }
});
// Rota para obter empresas de um sócio pelo identificador (CPF/CNPJ)
router.get('/identificador/:identificador', async (req, res) => {
    try {
        const { identificador } = req.params;
        // Consulta os registros de sócio
        const registrosSocio = await cnpj_db_1.prisma.socio.findMany({
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
    }
    catch (error) {
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
        const socio = await cnpj_db_1.prisma.socio.findUnique({
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
    }
    catch (error) {
        console.error('Erro ao obter sócio:', error);
        res.status(500).json({ error: 'Erro ao obter sócio' });
    }
});
exports.default = router;
//# sourceMappingURL=socios.js.map