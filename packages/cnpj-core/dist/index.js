"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CNPJProcessor = void 0;
/**
 * Classe para processamento e validação de CNPJ
 */
class CNPJProcessor {
    /**
     * Formata um CNPJ adicionando pontuação
     * @param cnpj CNPJ sem formatação (apenas números)
     * @returns CNPJ formatado (XX.XXX.XXX/XXXX-XX)
     */
    static format(cnpj) {
        // Remove caracteres não numéricos
        const cleanCNPJ = cnpj.replace(/\D/g, '');
        // Verifica se tem 14 dígitos
        if (cleanCNPJ.length !== 14) {
            return cnpj; // Retorna o original se não tiver 14 dígitos
        }
        // Aplica a máscara XX.XXX.XXX/XXXX-XX
        return cleanCNPJ.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    }
    /**
     * Remove a formatação de um CNPJ
     * @param cnpj CNPJ formatado
     * @returns CNPJ apenas com números
     */
    static unformat(cnpj) {
        return cnpj.replace(/\D/g, '');
    }
    /**
     * Valida um CNPJ
     * @param cnpj CNPJ a ser validado (com ou sem formatação)
     * @returns Objeto com resultado da validação
     */
    static validate(cnpj) {
        const errors = [];
        // Remove caracteres não numéricos
        const cleanCNPJ = cnpj.replace(/\D/g, '');
        // Verifica se tem 14 dígitos
        if (cleanCNPJ.length !== 14) {
            errors.push('CNPJ deve ter exatamente 14 dígitos');
            return { isValid: false, errors };
        }
        // Verifica se todos os dígitos são iguais
        if (/^(\d)\1+$/.test(cleanCNPJ)) {
            errors.push('CNPJ não pode ter todos os dígitos iguais');
            return { isValid: false, errors };
        }
        // Valida os dígitos verificadores
        const digits = cleanCNPJ.split('').map(Number);
        const firstDigit = this.calculateCheckDigit(digits.slice(0, 12), this.WEIGHTS_FIRST);
        const secondDigit = this.calculateCheckDigit(digits.slice(0, 13), this.WEIGHTS_SECOND);
        const isValid = digits[12] === firstDigit && digits[13] === secondDigit;
        if (!isValid) {
            errors.push('Dígitos verificadores inválidos');
        }
        return { isValid, errors };
    }
    /**
     * Calcula dígito verificador para validação de CNPJ
     * @param digits Array de dígitos do CNPJ
     * @param weights Array de pesos para cálculo
     * @returns Dígito verificador calculado
     */
    static calculateCheckDigit(digits, weights) {
        const sum = digits.reduce((acc, digit, index) => acc + digit * weights[index], 0);
        const remainder = sum % 11;
        return remainder < 2 ? 0 : 11 - remainder;
    }
    /**
     * Separa o CNPJ em seus componentes
     * @param cnpj CNPJ (com ou sem formatação)
     * @returns Objeto com os componentes do CNPJ
     */
    static getComponents(cnpj) {
        const cleanCNPJ = cnpj.replace(/\D/g, '');
        return {
            base: cleanCNPJ.substring(0, 8),
            ordem: cleanCNPJ.substring(8, 12),
            verificador: cleanCNPJ.substring(12, 14)
        };
    }
    /**
     * Obtém a base do CNPJ (primeiros 8 dígitos)
     * @param cnpj CNPJ (com ou sem formatação)
     * @returns Base do CNPJ
     */
    static getBase(cnpj) {
        return this.getComponents(cnpj).base;
    }
    /**
     * Verifica se dois CNPJs pertencem à mesma empresa (mesma base)
     * @param cnpj1 Primeiro CNPJ
     * @param cnpj2 Segundo CNPJ
     * @returns true se pertencerem à mesma empresa
     */
    static isSameCompany(cnpj1, cnpj2) {
        return this.getBase(cnpj1) === this.getBase(cnpj2);
    }
    /**
     * Gera um CNPJ aleatório válido (para testes)
     * @returns CNPJ válido
     */
    static generateRandom() {
        // Gera 12 dígitos aleatórios
        const digits = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10));
        // Calcula os dígitos verificadores
        const firstDigit = this.calculateCheckDigit(digits, this.WEIGHTS_FIRST);
        digits.push(firstDigit);
        const secondDigit = this.calculateCheckDigit(digits, this.WEIGHTS_SECOND);
        digits.push(secondDigit);
        // Converte para string e formata
        const cnpj = digits.join('');
        return this.format(cnpj);
    }
}
exports.CNPJProcessor = CNPJProcessor;
// Pesos para cálculo do primeiro dígito verificador
CNPJProcessor.WEIGHTS_FIRST = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
// Pesos para cálculo do segundo dígito verificador
CNPJProcessor.WEIGHTS_SECOND = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
//# sourceMappingURL=index.js.map