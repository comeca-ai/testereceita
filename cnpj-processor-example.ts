
// packages/cnpj-core/src/index.ts
export interface CNPJValidationResult {
  isValid: boolean;
  cnpj: string;
  formatted: string;
  errors: string[];
}

export interface CNPJComponents {
  base: string;        // First 8 digits
  order: string;       // Digits 9-12 (establishment)
  verifier: string;    // Last 2 digits
}

/**
 * CNPJ validation and formatting utilities
 * Based on RFB algorithm: https://pt.wikipedia.org/wiki/CNPJ
 */
export class CNPJProcessor {
  private static readonly WEIGHTS_FIRST = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  private static readonly WEIGHTS_SECOND = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  /**
   * Validates CNPJ using RFB algorithm
   */
  static validate(cnpj: string): CNPJValidationResult {
    const errors: string[] = [];

    // Remove formatting
    const cleanCNPJ = cnpj.replace(/[^\d]/g, '');

    // Check length
    if (cleanCNPJ.length !== 14) {
      errors.push('CNPJ deve ter exatamente 14 dígitos');
    }

    // Check for repeated digits
    if (/^(\d)\1{13}$/.test(cleanCNPJ)) {
      errors.push('CNPJ não pode ter todos os dígitos iguais');
    }

    if (errors.length > 0) {
      return {
        isValid: false,
        cnpj: cleanCNPJ,
        formatted: this.format(cleanCNPJ),
        errors
      };
    }

    // Validate check digits
    const digits = cleanCNPJ.split('').map(Number);
    const firstDigit = this.calculateCheckDigit(digits.slice(0, 12), this.WEIGHTS_FIRST);
    const secondDigit = this.calculateCheckDigit(digits.slice(0, 13), this.WEIGHTS_SECOND);

    const isValid = digits[12] === firstDigit && digits[13] === secondDigit;

    if (!isValid) {
      errors.push('Dígitos verificadores inválidos');
    }

    return {
      isValid,
      cnpj: cleanCNPJ,
      formatted: this.format(cleanCNPJ),
      errors
    };
  }

  /**
   * Calculates check digit for CNPJ validation
   */
  private static calculateCheckDigit(digits: number[], weights: number[]): number {
    const sum = digits.reduce((acc, digit, index) => acc + digit * weights[index], 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  }

  /**
   * Formats CNPJ string with dots, slash, and dash
   */
  static format(cnpj: string): string {
    const clean = cnpj.replace(/[^\d]/g, '');

    if (clean.length !== 14) {
      return clean;
    }

    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  /**
   * Extracts CNPJ components
   */
  static parseComponents(cnpj: string): CNPJComponents {
    const clean = cnpj.replace(/[^\d]/g, '');

    return {
      base: clean.slice(0, 8),
      order: clean.slice(8, 12),
      verifier: clean.slice(12, 14)
    };
  }

  /**
   * Gets CNPJ base (first 8 digits) - used for grouping companies
   */
  static getBase(cnpj: string): string {
    return this.parseComponents(cnpj).base;
  }

  /**
   * Checks if CNPJ represents a headquarters (matriz)
   */
  static isHeadquarters(cnpj: string): boolean {
    const components = this.parseComponents(cnpj);
    return components.order === '0001';
  }
}

// packages/cnpj-types/src/index.ts
export interface CompanyData {
  cnpjBase: string;
  corporateName: string;
  legalNature: string;
  responsibleQualification: string;
  shareCapital: number;
  companySize: CompanySize;
  federativeEntity?: string;
}

export interface EstablishmentData {
  cnpjBase: string;
  cnpjOrder: string;
  cnpjVerifier: string;
  fullCnpj: string;
  matrixBranch: MatrixBranch;
  tradeName?: string;
  registrationStatus: RegistrationStatus;
  statusDate?: Date;
  statusReason?: string;
  citySituation?: string;
  situationDate?: Date;
  situationReason?: string;
  startDate?: Date;
  mainCnae?: string;
  secondaryCnaes?: string[];
  address: AddressData;
  contact: ContactData;
  specialSituation?: string;
  specialSituationDate?: Date;
}

export interface AddressData {
  typeOfLogradouro?: string;
  logradouro?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  cep?: string;
  uf?: string;
  municipality?: string;
  municipalityCode?: string;
}

export interface ContactData {
  ddd1?: string;
  phone1?: string;
  ddd2?: string;
  phone2?: string;
  dddFax?: string;
  fax?: string;
  email?: string;
}

export interface PartnerData {
  cnpjBase: string;
  partnerIdentifier: number;
  partnerName: string;
  partnerDocument: string;
  qualificationCode: string;
  entryDate?: Date;
  countryCode?: string;
  legalRepresentative?: string;
  representativeQualification?: string;
  ageRange?: number;
}

export enum CompanySize {
  NOT_INFORMED = '00',
  MICRO = '01',
  SMALL = '03',
  OTHERS = '05'
}

export enum MatrixBranch {
  MATRIX = '1',
  BRANCH = '2'
}

export enum RegistrationStatus {
  NULL = '01',
  ACTIVE = '02',
  SUSPENDED = '03',
  INACTIVE = '04',
  LOW = '08'
}

// packages/cnpj-processor/src/rfb-parser.ts
import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import { Transform } from 'stream';
import { CompanyData, EstablishmentData, PartnerData } from '@cnpj/types';

export interface RFBParseOptions {
  batchSize: number;
  encoding: string;
  skipErrors: boolean;
}

export class RFBFileParser {
  private options: RFBParseOptions;

  constructor(options: Partial<RFBParseOptions> = {}) {
    this.options = {
      batchSize: 10000,
      encoding: 'latin1',
      skipErrors: true,
      ...options
    };
  }

  /**
   * Parse company data from RFB Empresas file
   */
  async parseCompanies(filePath: string): Promise<AsyncIterable<CompanyData[]>> {
    const parser = this.createCompanyParser();
    const stream = createReadStream(filePath, { encoding: this.options.encoding as BufferEncoding });

    return this.createBatchedIterable(stream.pipe(parser));
  }

  /**
   * Parse establishment data from RFB Estabelecimentos file
   */
  async parseEstablishments(filePath: string): Promise<AsyncIterable<EstablishmentData[]>> {
    const parser = this.createEstablishmentParser();
    const stream = createReadStream(filePath, { encoding: this.options.encoding as BufferEncoding });

    return this.createBatchedIterable(stream.pipe(parser));
  }

  /**
   * Parse partner data from RFB Socios file
   */
  async parsePartners(filePath: string): Promise<AsyncIterable<PartnerData[]>> {
    const parser = this.createPartnerParser();
    const stream = createReadStream(filePath, { encoding: this.options.encoding as BufferEncoding });

    return this.createBatchedIterable(stream.pipe(parser));
  }

  private createCompanyParser(): Transform {
    return parse({
      delimiter: ';',
      quote: '"',
      escape: '"',
      columns: [
        'cnpjBase',
        'corporateName', 
        'legalNature',
        'responsibleQualification',
        'shareCapital',
        'companySize',
        'federativeEntity'
      ],
      skip_empty_lines: true,
      relax_quotes: true
    }).pipe(new Transform({
      objectMode: true,
      transform(chunk: any, encoding, callback) {
        try {
          const company: CompanyData = {
            cnpjBase: chunk.cnpjBase?.trim(),
            corporateName: chunk.corporateName?.trim(),
            legalNature: chunk.legalNature?.trim(),
            responsibleQualification: chunk.responsibleQualification?.trim(),
            shareCapital: parseFloat(chunk.shareCapital?.replace(',', '.') || '0'),
            companySize: chunk.companySize?.trim() as CompanySize,
            federativeEntity: chunk.federativeEntity?.trim() || undefined
          };

          callback(null, company);
        } catch (error) {
          if (this.options.skipErrors) {
            callback(); // Skip this record
          } else {
            callback(error);
          }
        }
      }
    }));
  }

  private createEstablishmentParser(): Transform {
    return parse({
      delimiter: ';',
      quote: '"',
      escape: '"',
      columns: [
        'cnpjBase', 'cnpjOrder', 'cnpjVerifier', 'matrixBranch',
        'tradeName', 'registrationStatus', 'statusDate', 'statusReason',
        'citySituation', 'situationDate', 'situationReason', 'startDate',
        'mainCnae', 'secondaryCnaes', 'typeOfLogradouro', 'logradouro',
        'number', 'complement', 'neighborhood', 'cep', 'uf', 'municipalityCode',
        'municipality', 'ddd1', 'phone1', 'ddd2', 'phone2',
        'dddFax', 'fax', 'email', 'specialSituation', 'specialSituationDate'
      ],
      skip_empty_lines: true,
      relax_quotes: true
    }).pipe(new Transform({
      objectMode: true,
      transform(chunk: any, encoding, callback) {
        try {
          const establishment: EstablishmentData = {
            cnpjBase: chunk.cnpjBase?.trim(),
            cnpjOrder: chunk.cnpjOrder?.trim(),
            cnpjVerifier: chunk.cnpjVerifier?.trim(),
            fullCnpj: `${chunk.cnpjBase}${chunk.cnpjOrder}${chunk.cnpjVerifier}`,
            matrixBranch: chunk.matrixBranch?.trim() as MatrixBranch,
            tradeName: chunk.tradeName?.trim() || undefined,
            registrationStatus: chunk.registrationStatus?.trim() as RegistrationStatus,
            statusDate: this.parseDate(chunk.statusDate),
            statusReason: chunk.statusReason?.trim() || undefined,
            citySituation: chunk.citySituation?.trim() || undefined,
            situationDate: this.parseDate(chunk.situationDate),
            situationReason: chunk.situationReason?.trim() || undefined,
            startDate: this.parseDate(chunk.startDate),
            mainCnae: chunk.mainCnae?.trim() || undefined,
            secondaryCnaes: chunk.secondaryCnaes?.split(',').map((c: string) => c.trim()).filter(Boolean) || [],
            address: {
              typeOfLogradouro: chunk.typeOfLogradouro?.trim() || undefined,
              logradouro: chunk.logradouro?.trim() || undefined,
              number: chunk.number?.trim() || undefined,
              complement: chunk.complement?.trim() || undefined,
              neighborhood: chunk.neighborhood?.trim() || undefined,
              cep: chunk.cep?.trim() || undefined,
              uf: chunk.uf?.trim() || undefined,
              municipality: chunk.municipality?.trim() || undefined,
              municipalityCode: chunk.municipalityCode?.trim() || undefined
            },
            contact: {
              ddd1: chunk.ddd1?.trim() || undefined,
              phone1: chunk.phone1?.trim() || undefined,
              ddd2: chunk.ddd2?.trim() || undefined,
              phone2: chunk.phone2?.trim() || undefined,
              dddFax: chunk.dddFax?.trim() || undefined,
              fax: chunk.fax?.trim() || undefined,
              email: chunk.email?.trim() || undefined
            },
            specialSituation: chunk.specialSituation?.trim() || undefined,
            specialSituationDate: this.parseDate(chunk.specialSituationDate)
          };

          callback(null, establishment);
        } catch (error) {
          if (this.options.skipErrors) {
            callback(); // Skip this record
          } else {
            callback(error);
          }
        }
      }
    }));
  }

  private createPartnerParser(): Transform {
    return parse({
      delimiter: ';',
      quote: '"', 
      escape: '"',
      columns: [
        'cnpjBase', 'partnerIdentifier', 'partnerName', 'partnerDocument',
        'qualificationCode', 'entryDate', 'countryCode', 'legalRepresentative',
        'representativeQualification', 'ageRange'
      ],
      skip_empty_lines: true,
      relax_quotes: true
    }).pipe(new Transform({
      objectMode: true,
      transform(chunk: any, encoding, callback) {
        try {
          const partner: PartnerData = {
            cnpjBase: chunk.cnpjBase?.trim(),
            partnerIdentifier: parseInt(chunk.partnerIdentifier) || 0,
            partnerName: chunk.partnerName?.trim(),
            partnerDocument: chunk.partnerDocument?.trim(),
            qualificationCode: chunk.qualificationCode?.trim(),
            entryDate: this.parseDate(chunk.entryDate),
            countryCode: chunk.countryCode?.trim() || undefined,
            legalRepresentative: chunk.legalRepresentative?.trim() || undefined,
            representativeQualification: chunk.representativeQualification?.trim() || undefined,
            ageRange: parseInt(chunk.ageRange) || undefined
          };

          callback(null, partner);
        } catch (error) {
          if (this.options.skipErrors) {
            callback(); // Skip this record
          } else {
            callback(error);
          }
        }
      }
    }));
  }

  private parseDate(dateStr: string): Date | undefined {
    if (!dateStr || dateStr.trim() === '0' || dateStr.trim() === '') {
      return undefined;
    }

    try {
      // RFB date format: YYYYMMDD
      const cleaned = dateStr.trim();
      if (cleaned.length === 8) {
        const year = parseInt(cleaned.substring(0, 4));
        const month = parseInt(cleaned.substring(4, 6)) - 1; // JS months are 0-based
        const day = parseInt(cleaned.substring(6, 8));
        return new Date(year, month, day);
      }
      return undefined;
    } catch {
      return undefined;
    }
  }

  private async* createBatchedIterable<T>(stream: NodeJS.ReadableStream): AsyncIterable<T[]> {
    let batch: T[] = [];

    for await (const item of stream) {
      batch.push(item);

      if (batch.length >= this.options.batchSize) {
        yield batch;
        batch = [];
      }
    }

    if (batch.length > 0) {
      yield batch;
    }
  }
}
