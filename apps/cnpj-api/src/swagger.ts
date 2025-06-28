export default {
  openapi: '3.0.0',
  info: {
    title: 'API de Consulta de CNPJ',
    version: '1.0.0',
    description: 'API para consulta de dados de CNPJ da Receita Federal',
    contact: {
      name: 'Suporte',
      email: 'suporte@exemplo.com'
    }
  },
  servers: [
    {
      url: '/api',
      description: 'API Server'
    }
  ],
  tags: [
    {
      name: 'Empresas',
      description: 'Operações relacionadas a empresas'
    },
    {
      name: 'Estabelecimentos',
      description: 'Operações relacionadas a estabelecimentos'
    },
    {
      name: 'Sócios',
      description: 'Operações relacionadas a sócios'
    },
    {
      name: 'Simples Nacional',
      description: 'Operações relacionadas ao Simples Nacional'
    },
    {
      name: 'Saúde',
      description: 'Verificação de saúde da API'
    }
  ],
  paths: {
    '/empresas': {
      get: {
        tags: ['Empresas'],
        summary: 'Lista empresas',
        description: 'Retorna uma lista paginada de empresas',
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: 'Número da página',
            schema: {
              type: 'integer',
              default: 1
            }
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Número de registros por página',
            schema: {
              type: 'integer',
              default: 10
            }
          },
          {
            name: 'razaoSocial',
            in: 'query',
            description: 'Filtro por razão social (busca parcial)',
            schema: {
              type: 'string'
            }
          },
          {
            name: 'naturezaJuridica',
            in: 'query',
            description: 'Filtro por natureza jurídica',
            schema: {
              type: 'string'
            }
          },
          {
            name: 'porte',
            in: 'query',
            description: 'Filtro por porte da empresa',
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Lista de empresas',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Empresa'
                      }
                    },
                    pagination: {
                      $ref: '#/components/schemas/Pagination'
                    }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/empresas/{cnpjBase}': {
      get: {
        tags: ['Empresas'],
        summary: 'Obtém uma empresa',
        description: 'Retorna os dados de uma empresa pelo CNPJ base',
        parameters: [
          {
            name: 'cnpjBase',
            in: 'path',
            description: 'CNPJ base (8 primeiros dígitos)',
            required: true,
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Dados da empresa',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/EmpresaDetalhada'
                }
              }
            }
          },
          '404': {
            description: 'Empresa não encontrada',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '500': {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/estabelecimentos': {
      get: {
        tags: ['Estabelecimentos'],
        summary: 'Lista estabelecimentos',
        description: 'Retorna uma lista paginada de estabelecimentos',
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: 'Número da página',
            schema: {
              type: 'integer',
              default: 1
            }
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Número de registros por página',
            schema: {
              type: 'integer',
              default: 10
            }
          },
          {
            name: 'nomeFantasia',
            in: 'query',
            description: 'Filtro por nome fantasia (busca parcial)',
            schema: {
              type: 'string'
            }
          },
          {
            name: 'situacaoCadastral',
            in: 'query',
            description: 'Filtro por situação cadastral',
            schema: {
              type: 'string'
            }
          },
          {
            name: 'cnaePrincipal',
            in: 'query',
            description: 'Filtro por CNAE principal',
            schema: {
              type: 'string'
            }
          },
          {
            name: 'municipio',
            in: 'query',
            description: 'Filtro por município',
            schema: {
              type: 'string'
            }
          },
          {
            name: 'uf',
            in: 'query',
            description: 'Filtro por UF',
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Lista de estabelecimentos',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Estabelecimento'
                      }
                    },
                    pagination: {
                      $ref: '#/components/schemas/Pagination'
                    }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/estabelecimentos/{cnpj}': {
      get: {
        tags: ['Estabelecimentos'],
        summary: 'Obtém um estabelecimento',
        description: 'Retorna os dados de um estabelecimento pelo CNPJ',
        parameters: [
          {
            name: 'cnpj',
            in: 'path',
            description: 'CNPJ completo (14 dígitos)',
            required: true,
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Dados do estabelecimento',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/EstabelecimentoDetalhado'
                }
              }
            }
          },
          '404': {
            description: 'Estabelecimento não encontrado',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '500': {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/socios': {
      get: {
        tags: ['Sócios'],
        summary: 'Lista sócios',
        description: 'Retorna uma lista paginada de sócios',
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: 'Número da página',
            schema: {
              type: 'integer',
              default: 1
            }
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Número de registros por página',
            schema: {
              type: 'integer',
              default: 10
            }
          },
          {
            name: 'nome',
            in: 'query',
            description: 'Filtro por nome do sócio (busca parcial)',
            schema: {
              type: 'string'
            }
          },
          {
            name: 'cnpjBase',
            in: 'query',
            description: 'Filtro por CNPJ base da empresa',
            schema: {
              type: 'string'
            }
          },
          {
            name: 'qualificacao',
            in: 'query',
            description: 'Filtro por qualificação do sócio',
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Lista de sócios',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Socio'
                      }
                    },
                    pagination: {
                      $ref: '#/components/schemas/Pagination'
                    }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/simples/{cnpjBase}': {
      get: {
        tags: ['Simples Nacional'],
        summary: 'Obtém dados do Simples Nacional',
        description: 'Retorna os dados do Simples Nacional de uma empresa pelo CNPJ base',
        parameters: [
          {
            name: 'cnpjBase',
            in: 'path',
            description: 'CNPJ base (8 primeiros dígitos)',
            required: true,
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Dados do Simples Nacional',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SimplesNacional'
                }
              }
            }
          },
          '404': {
            description: 'Dados do Simples Nacional não encontrados',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '500': {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/health': {
      get: {
        tags: ['Saúde'],
        summary: 'Verifica a saúde da API',
        description: 'Retorna o status da API e do banco de dados',
        responses: {
          '200': {
            description: 'API saudável',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      example: 'ok'
                    },
                    version: {
                      type: 'string',
                      example: '1.0.0'
                    },
                    database: {
                      type: 'string',
                      example: 'connected'
                    },
                    uptime: {
                      type: 'number',
                      example: 3600
                    }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Empresa: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1
          },
          cnpjBase: {
            type: 'string',
            example: '12345678'
          },
          razaoSocial: {
            type: 'string',
            example: 'EMPRESA EXEMPLO LTDA'
          },
          naturezaJuridica: {
            type: 'string',
            example: '2062'
          },
          qualificacaoResponsavel: {
            type: 'string',
            example: '49'
          },
          capitalSocial: {
            type: 'number',
            example: 100000
          },
          porte: {
            type: 'string',
            example: '2'
          },
          enteFederativo: {
            type: 'string',
            example: null
          }
        }
      },
      EmpresaDetalhada: {
        allOf: [
          {
            $ref: '#/components/schemas/Empresa'
          },
          {
            type: 'object',
            properties: {
              estabelecimentos: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/Estabelecimento'
                }
              },
              socios: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/Socio'
                }
              },
              simplesNacional: {
                $ref: '#/components/schemas/SimplesNacional'
              }
            }
          }
        ]
      },
      Estabelecimento: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1
          },
          cnpj: {
            type: 'string',
            example: '12345678000199'
          },
          cnpjBase: {
            type: 'string',
            example: '12345678'
          },
          nomeFantasia: {
            type: 'string',
            example: 'NOME FANTASIA EXEMPLO'
          },
          situacaoCadastral: {
            type: 'string',
            example: '2'
          },
          dataSituacaoCadastral: {
            type: 'string',
            format: 'date-time',
            example: '2020-01-01T00:00:00.000Z'
          },
          motivoSituacaoCadastral: {
            type: 'string',
            example: '0'
          },
          dataInicioAtividade: {
            type: 'string',
            format: 'date-time',
            example: '2010-01-01T00:00:00.000Z'
          },
          cnaePrincipal: {
            type: 'string',
            example: '6202300'
          },
          logradouro: {
            type: 'string',
            example: 'RUA EXEMPLO'
          },
          numero: {
            type: 'string',
            example: '123'
          },
          complemento: {
            type: 'string',
            example: 'SALA 1'
          },
          bairro: {
            type: 'string',
            example: 'CENTRO'
          },
          cep: {
            type: 'string',
            example: '12345678'
          },
          municipio: {
            type: 'string',
            example: '1234'
          },
          uf: {
            type: 'string',
            example: 'SP'
          },
          telefone1: {
            type: 'string',
            example: '1123456789'
          },
          telefone2: {
            type: 'string',
            example: '1198765432'
          },
          email: {
            type: 'string',
            example: 'contato@exemplo.com'
          }
        }
      },
      EstabelecimentoDetalhado: {
        allOf: [
          {
            $ref: '#/components/schemas/Estabelecimento'
          },
          {
            type: 'object',
            properties: {
              empresa: {
                $ref: '#/components/schemas/Empresa'
              },
              cnaesSecundarios: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'integer',
                      example: 1
                    },
                    codigo: {
                      type: 'string',
                      example: '6201500'
                    }
                  }
                }
              }
            }
          }
        ]
      },
      Socio: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1
          },
          cnpjBase: {
            type: 'string',
            example: '12345678'
          },
          identificador: {
            type: 'string',
            example: '12345678901'
          },
          nome: {
            type: 'string',
            example: 'NOME DO SOCIO'
          },
          qualificacao: {
            type: 'string',
            example: '49'
          },
          dataEntrada: {
            type: 'string',
            format: 'date-time',
            example: '2010-01-01T00:00:00.000Z'
          },
          pais: {
            type: 'string',
            example: 'BR'
          },
          representanteLegal: {
            type: 'string',
            example: 'NOME DO REPRESENTANTE'
          },
          identificadorRepresentante: {
            type: 'string',
            example: '12345678901'
          }
        }
      },
      SimplesNacional: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1
          },
          cnpjBase: {
            type: 'string',
            example: '12345678'
          },
          optante: {
            type: 'boolean',
            example: true
          },
          dataOpcao: {
            type: 'string',
            format: 'date-time',
            example: '2015-01-01T00:00:00.000Z'
          },
          dataExclusao: {
            type: 'string',
            format: 'date-time',
            example: null
          },
          optanteMEI: {
            type: 'boolean',
            example: false
          }
        }
      },
      Pagination: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            example: 1
          },
          limit: {
            type: 'integer',
            example: 10
          },
          total: {
            type: 'integer',
            example: 100
          },
          pages: {
            type: 'integer',
            example: 10
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Mensagem de erro'
          }
        }
      }
    }
  }
};
