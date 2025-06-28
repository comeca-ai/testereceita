declare const _default: {
    openapi: string;
    info: {
        title: string;
        version: string;
        description: string;
        contact: {
            name: string;
            email: string;
        };
    };
    servers: {
        url: string;
        description: string;
    }[];
    tags: {
        name: string;
        description: string;
    }[];
    paths: {
        '/empresas': {
            get: {
                tags: string[];
                summary: string;
                description: string;
                parameters: ({
                    name: string;
                    in: string;
                    description: string;
                    schema: {
                        type: string;
                        default: number;
                    };
                } | {
                    name: string;
                    in: string;
                    description: string;
                    schema: {
                        type: string;
                        default?: undefined;
                    };
                })[];
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    type: string;
                                    properties: {
                                        data: {
                                            type: string;
                                            items: {
                                                $ref: string;
                                            };
                                        };
                                        pagination: {
                                            $ref: string;
                                        };
                                    };
                                };
                            };
                        };
                    };
                    '500': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        '/empresas/{cnpjBase}': {
            get: {
                tags: string[];
                summary: string;
                description: string;
                parameters: {
                    name: string;
                    in: string;
                    description: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    '404': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    '500': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        '/estabelecimentos': {
            get: {
                tags: string[];
                summary: string;
                description: string;
                parameters: ({
                    name: string;
                    in: string;
                    description: string;
                    schema: {
                        type: string;
                        default: number;
                    };
                } | {
                    name: string;
                    in: string;
                    description: string;
                    schema: {
                        type: string;
                        default?: undefined;
                    };
                })[];
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    type: string;
                                    properties: {
                                        data: {
                                            type: string;
                                            items: {
                                                $ref: string;
                                            };
                                        };
                                        pagination: {
                                            $ref: string;
                                        };
                                    };
                                };
                            };
                        };
                    };
                    '500': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        '/estabelecimentos/{cnpj}': {
            get: {
                tags: string[];
                summary: string;
                description: string;
                parameters: {
                    name: string;
                    in: string;
                    description: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    '404': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    '500': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        '/socios': {
            get: {
                tags: string[];
                summary: string;
                description: string;
                parameters: ({
                    name: string;
                    in: string;
                    description: string;
                    schema: {
                        type: string;
                        default: number;
                    };
                } | {
                    name: string;
                    in: string;
                    description: string;
                    schema: {
                        type: string;
                        default?: undefined;
                    };
                })[];
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    type: string;
                                    properties: {
                                        data: {
                                            type: string;
                                            items: {
                                                $ref: string;
                                            };
                                        };
                                        pagination: {
                                            $ref: string;
                                        };
                                    };
                                };
                            };
                        };
                    };
                    '500': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        '/simples/{cnpjBase}': {
            get: {
                tags: string[];
                summary: string;
                description: string;
                parameters: {
                    name: string;
                    in: string;
                    description: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    '404': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    '500': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        '/health': {
            get: {
                tags: string[];
                summary: string;
                description: string;
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    type: string;
                                    properties: {
                                        status: {
                                            type: string;
                                            example: string;
                                        };
                                        version: {
                                            type: string;
                                            example: string;
                                        };
                                        database: {
                                            type: string;
                                            example: string;
                                        };
                                        uptime: {
                                            type: string;
                                            example: number;
                                        };
                                    };
                                };
                            };
                        };
                    };
                    '500': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
    };
    components: {
        schemas: {
            Empresa: {
                type: string;
                properties: {
                    id: {
                        type: string;
                        example: number;
                    };
                    cnpjBase: {
                        type: string;
                        example: string;
                    };
                    razaoSocial: {
                        type: string;
                        example: string;
                    };
                    naturezaJuridica: {
                        type: string;
                        example: string;
                    };
                    qualificacaoResponsavel: {
                        type: string;
                        example: string;
                    };
                    capitalSocial: {
                        type: string;
                        example: number;
                    };
                    porte: {
                        type: string;
                        example: string;
                    };
                    enteFederativo: {
                        type: string;
                        example: null;
                    };
                };
            };
            EmpresaDetalhada: {
                allOf: ({
                    $ref: string;
                    type?: undefined;
                    properties?: undefined;
                } | {
                    type: string;
                    properties: {
                        estabelecimentos: {
                            type: string;
                            items: {
                                $ref: string;
                            };
                        };
                        socios: {
                            type: string;
                            items: {
                                $ref: string;
                            };
                        };
                        simplesNacional: {
                            $ref: string;
                        };
                    };
                    $ref?: undefined;
                })[];
            };
            Estabelecimento: {
                type: string;
                properties: {
                    id: {
                        type: string;
                        example: number;
                    };
                    cnpj: {
                        type: string;
                        example: string;
                    };
                    cnpjBase: {
                        type: string;
                        example: string;
                    };
                    nomeFantasia: {
                        type: string;
                        example: string;
                    };
                    situacaoCadastral: {
                        type: string;
                        example: string;
                    };
                    dataSituacaoCadastral: {
                        type: string;
                        format: string;
                        example: string;
                    };
                    motivoSituacaoCadastral: {
                        type: string;
                        example: string;
                    };
                    dataInicioAtividade: {
                        type: string;
                        format: string;
                        example: string;
                    };
                    cnaePrincipal: {
                        type: string;
                        example: string;
                    };
                    logradouro: {
                        type: string;
                        example: string;
                    };
                    numero: {
                        type: string;
                        example: string;
                    };
                    complemento: {
                        type: string;
                        example: string;
                    };
                    bairro: {
                        type: string;
                        example: string;
                    };
                    cep: {
                        type: string;
                        example: string;
                    };
                    municipio: {
                        type: string;
                        example: string;
                    };
                    uf: {
                        type: string;
                        example: string;
                    };
                    telefone1: {
                        type: string;
                        example: string;
                    };
                    telefone2: {
                        type: string;
                        example: string;
                    };
                    email: {
                        type: string;
                        example: string;
                    };
                };
            };
            EstabelecimentoDetalhado: {
                allOf: ({
                    $ref: string;
                    type?: undefined;
                    properties?: undefined;
                } | {
                    type: string;
                    properties: {
                        empresa: {
                            $ref: string;
                        };
                        cnaesSecundarios: {
                            type: string;
                            items: {
                                type: string;
                                properties: {
                                    id: {
                                        type: string;
                                        example: number;
                                    };
                                    codigo: {
                                        type: string;
                                        example: string;
                                    };
                                };
                            };
                        };
                    };
                    $ref?: undefined;
                })[];
            };
            Socio: {
                type: string;
                properties: {
                    id: {
                        type: string;
                        example: number;
                    };
                    cnpjBase: {
                        type: string;
                        example: string;
                    };
                    identificador: {
                        type: string;
                        example: string;
                    };
                    nome: {
                        type: string;
                        example: string;
                    };
                    qualificacao: {
                        type: string;
                        example: string;
                    };
                    dataEntrada: {
                        type: string;
                        format: string;
                        example: string;
                    };
                    pais: {
                        type: string;
                        example: string;
                    };
                    representanteLegal: {
                        type: string;
                        example: string;
                    };
                    identificadorRepresentante: {
                        type: string;
                        example: string;
                    };
                };
            };
            SimplesNacional: {
                type: string;
                properties: {
                    id: {
                        type: string;
                        example: number;
                    };
                    cnpjBase: {
                        type: string;
                        example: string;
                    };
                    optante: {
                        type: string;
                        example: boolean;
                    };
                    dataOpcao: {
                        type: string;
                        format: string;
                        example: string;
                    };
                    dataExclusao: {
                        type: string;
                        format: string;
                        example: null;
                    };
                    optanteMEI: {
                        type: string;
                        example: boolean;
                    };
                };
            };
            Pagination: {
                type: string;
                properties: {
                    page: {
                        type: string;
                        example: number;
                    };
                    limit: {
                        type: string;
                        example: number;
                    };
                    total: {
                        type: string;
                        example: number;
                    };
                    pages: {
                        type: string;
                        example: number;
                    };
                };
            };
            Error: {
                type: string;
                properties: {
                    error: {
                        type: string;
                        example: string;
                    };
                };
            };
        };
    };
};
export default _default;
//# sourceMappingURL=swagger.d.ts.map