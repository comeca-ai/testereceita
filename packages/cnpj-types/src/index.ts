/**
 * Interfaces para dados de CNPJ da Receita Federal
 */

/**
 * Interface para representar um CNPJ completo
 */
export interface CNPJ {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  situacaoCadastral: SituacaoCadastral;
  dataSituacaoCadastral: Date;
  motivoSituacaoCadastral?: string;
  naturezaJuridica: string;
  dataAbertura: Date;
  cnaePrincipal: string;
  cnaeSecundarios?: string[];
  endereco: Endereco;
  contato?: Contato;
  capitalSocial?: number;
  porte?: string;
  socios?: Socio[];
  simples?: DadosSimples;
}

/**
 * Situação cadastral de uma empresa
 */
export enum SituacaoCadastral {
  ATIVA = 'ATIVA',
  BAIXADA = 'BAIXADA',
  INAPTA = 'INAPTA',
  SUSPENSA = 'SUSPENSA',
  NULA = 'NULA'
}

/**
 * Interface para endereço de empresas
 */
export interface Endereco {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cep: string;
  municipio: string;
  uf: string;
}

/**
 * Interface para dados de contato
 */
export interface Contato {
  telefone?: string;
  email?: string;
}

/**
 * Interface para sócios de empresas
 */
export interface Socio {
  nome: string;
  cpfCnpj: string;
  qualificacao: string;
  dataEntrada: Date;
  pais?: string;
  representanteLegal?: string;
  cpfRepresentante?: string;
}

/**
 * Interface para dados do Simples Nacional
 */
export interface DadosSimples {
  optante: boolean;
  dataOpcao?: Date;
  dataExclusao?: Date;
  optanteMEI?: boolean;
}

/**
 * Interface para componentes do CNPJ
 */
export interface CNPJComponents {
  base: string;        // Primeiros 8 dígitos
  ordem: string;       // Dígitos 9-12 (estabelecimento)
  verificador: string; // Últimos 2 dígitos
}

/**
 * Interface para resultado de validação
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Interface para configuração do ETL
 */
export interface ETLConfig {
  rfbBasePath: string;
  tempDbPath?: string;
  batchSize?: number;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Interface para estatísticas de processamento
 */
export interface ProcessingStats {
  totalProcessed: number;
  totalSuccess: number;
  totalErrors: number;
  startTime: Date;
  endTime?: Date;
  elapsedTimeMs?: number;
}

/**
 * Interface para filtros de consulta CNPJ
 */
export interface CNPJQueryFilters {
  cnpj?: string;
  razaoSocial?: string;
  nomeFantasia?: string;
  situacaoCadastral?: SituacaoCadastral;
  uf?: string;
  municipio?: string;
  bairro?: string;
  cnaePrincipal?: string;
  porte?: string;
  dataAberturaInicio?: Date;
  dataAberturaFim?: Date;
  optanteSimples?: boolean;
  optanteMEI?: boolean;
  limit?: number;
  offset?: number;
}
