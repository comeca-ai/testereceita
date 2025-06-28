import { CNPJComponents, ValidationResult } from 'cnpj-types';
/**
 * Classe para processamento e validação de CNPJ
 */
export declare class CNPJProcessor {
    private static readonly WEIGHTS_FIRST;
    private static readonly WEIGHTS_SECOND;
    /**
     * Formata um CNPJ adicionando pontuação
     * @param cnpj CNPJ sem formatação (apenas números)
     * @returns CNPJ formatado (XX.XXX.XXX/XXXX-XX)
     */
    static format(cnpj: string): string;
    /**
     * Remove a formatação de um CNPJ
     * @param cnpj CNPJ formatado
     * @returns CNPJ apenas com números
     */
    static unformat(cnpj: string): string;
    /**
     * Valida um CNPJ
     * @param cnpj CNPJ a ser validado (com ou sem formatação)
     * @returns Objeto com resultado da validação
     */
    static validate(cnpj: string): ValidationResult;
    /**
     * Calcula dígito verificador para validação de CNPJ
     * @param digits Array de dígitos do CNPJ
     * @param weights Array de pesos para cálculo
     * @returns Dígito verificador calculado
     */
    private static calculateCheckDigit;
    /**
     * Separa o CNPJ em seus componentes
     * @param cnpj CNPJ (com ou sem formatação)
     * @returns Objeto com os componentes do CNPJ
     */
    static getComponents(cnpj: string): CNPJComponents;
    /**
     * Obtém a base do CNPJ (primeiros 8 dígitos)
     * @param cnpj CNPJ (com ou sem formatação)
     * @returns Base do CNPJ
     */
    static getBase(cnpj: string): string;
    /**
     * Verifica se dois CNPJs pertencem à mesma empresa (mesma base)
     * @param cnpj1 Primeiro CNPJ
     * @param cnpj2 Segundo CNPJ
     * @returns true se pertencerem à mesma empresa
     */
    static isSameCompany(cnpj1: string, cnpj2: string): boolean;
    /**
     * Gera um CNPJ aleatório válido (para testes)
     * @returns CNPJ válido
     */
    static generateRandom(): string;
}
//# sourceMappingURL=index.d.ts.map