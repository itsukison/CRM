import { Row, Column } from '@/types';

export const evaluateFormula = (expression: string, row: Row, columns: Column[]) => {
    try {
        // Remove the leading '='
        const cleanExpr = expression.substring(1);

        // Replace [Column Name] references with values
        // Regex looks for square brackets: [Price]
        const parsedExpr = cleanExpr.replace(/\[([^\]]+)\]/g, (match, colTitle) => {
            const col = columns.find(c => c.title === colTitle);
            if (!col) return '0';
            const val = row[col.id];
            // If value is empty or null, treat as 0 for math, or empty string for text
            if (val === undefined || val === null || val === '') return '0';
            // If it's a number, return it. If string, quote it.
            return isNaN(Number(val)) ? `"${val}"` : val;
        });

        // Safety check: only allow basic math and comparisons
        // This is a basic implementation. In production, use a safe math parser library.
        // eslint-disable-next-line no-new-func
        const result = new Function(`return (${parsedExpr})`)();
        return result;
    } catch (e) {
        return '#ERROR';
    }
};
