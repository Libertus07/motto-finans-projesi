import { describe, it, expect } from 'vitest';
import { formatCurrency } from '../helpers';

describe('Helpers', () => {
    describe('formatCurrency', () => {
        it('formats number correctly with currency symbol', () => {
            expect(formatCurrency(123.45)).toBe('123,45');
        });

        it('handles zero correctly', () => {
            expect(formatCurrency(0)).toBe('0,00');
        });

        it('handles large numbers', () => {
            expect(formatCurrency(1000)).toBe('1.000,00');
        });
    });
});
