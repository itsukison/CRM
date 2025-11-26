import { Row, Column } from '@/types';

// Helper to get column letter from index (A, B, C, etc.)
const getColumnLetter = (index: number): string => {
    let letter = '';
    let num = index;
    while (num >= 0) {
        letter = String.fromCharCode(65 + (num % 26)) + letter;
        num = Math.floor(num / 26) - 1;
    }
    return letter;
};

export const evaluateFormula = (expression: string, row: Row, columns: Column[], allRows?: Row[]) => {
    try {
        // Remove the leading '='
        let cleanExpr = expression.substring(1).trim();

        // Handle common spreadsheet functions
        // SUM([Column]) or SUM(A:A) - sum all values in a column
        cleanExpr = cleanExpr.replace(/SUM\(\[([^\]]+)\]\)/gi, (match, colTitle) => {
            if (!allRows) return '0';
            const col = columns.find(c => c.title === colTitle);
            if (!col) return '0';
            const sum = allRows.reduce((acc, r) => {
                const val = Number(r[col.id]);
                return acc + (isNaN(val) ? 0 : val);
            }, 0);
            return String(sum);
        });

        // AVERAGE([Column])
        cleanExpr = cleanExpr.replace(/AVERAGE\(\[([^\]]+)\]\)/gi, (match, colTitle) => {
            if (!allRows) return '0';
            const col = columns.find(c => c.title === colTitle);
            if (!col) return '0';
            const values = allRows.map(r => Number(r[col.id])).filter(v => !isNaN(v));
            const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
            return String(avg);
        });

        // COUNT([Column])
        cleanExpr = cleanExpr.replace(/COUNT\(\[([^\]]+)\]\)/gi, (match, colTitle) => {
            if (!allRows) return '0';
            const col = columns.find(c => c.title === colTitle);
            if (!col) return '0';
            const count = allRows.filter(r => {
                const val = r[col.id];
                return val !== undefined && val !== null && val !== '';
            }).length;
            return String(count);
        });

        // MIN([Column])
        cleanExpr = cleanExpr.replace(/MIN\(\[([^\]]+)\]\)/gi, (match, colTitle) => {
            if (!allRows) return '0';
            const col = columns.find(c => c.title === colTitle);
            if (!col) return '0';
            const values = allRows.map(r => Number(r[col.id])).filter(v => !isNaN(v));
            return values.length > 0 ? String(Math.min(...values)) : '0';
        });

        // MAX([Column])
        cleanExpr = cleanExpr.replace(/MAX\(\[([^\]]+)\]\)/gi, (match, colTitle) => {
            if (!allRows) return '0';
            const col = columns.find(c => c.title === colTitle);
            if (!col) return '0';
            const values = allRows.map(r => Number(r[col.id])).filter(v => !isNaN(v));
            return values.length > 0 ? String(Math.max(...values)) : '0';
        });

        // IF(condition, trueValue, falseValue)
        // Simple pattern matching - this is basic and won't handle nested IFs
        const ifMatch = cleanExpr.match(/IF\(([^,]+),([^,]+),([^)]+)\)/i);
        if (ifMatch) {
            const condition = ifMatch[1].trim();
            const trueVal = ifMatch[2].trim();
            const falseVal = ifMatch[3].trim();

            // Evaluate condition (will be evaluated later with Function constructor)
            cleanExpr = cleanExpr.replace(ifMatch[0], `(${condition}) ? ${trueVal} : ${falseVal}`);
        }

        // Replace [Column Name] references with values from the current row
        cleanExpr = cleanExpr.replace(/\[([^\]]+)\]/g, (match, colTitle) => {
            const col = columns.find(c => c.title === colTitle);
            if (!col) return '0';
            const val = row[col.id];
            // If value is empty or null, treat as 0 for math
            if (val === undefined || val === null || val === '') return '0';
            // If it's a number, return it. If string, quote it.
            return isNaN(Number(val)) ? `"${val}"` : String(val);
        });

        // Safety check: only allow basic math and comparisons
        // This is a basic implementation. In production, use a safe math parser library.
        // eslint-disable-next-line no-new-func
        const result = new Function(`return (${cleanExpr})`)();
        return result;
    } catch (e) {
        return '#ERROR';
    }
};
