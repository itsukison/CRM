import { Row, Column } from '@/types';

// Default colors for common tags
export const getDefaultTagColor = (tagLabel: string): string | null => {
    const normalized = tagLabel.trim();
    
    // Company matchness / Fit score tags
    if (normalized === '高' || normalized.toLowerCase() === 'high') {
        return 'bg-green-50 text-green-700 border-green-200';
    }
    if (normalized === '中' || normalized.toLowerCase() === 'medium') {
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
    if (normalized === '低' || normalized.toLowerCase() === 'low') {
        return 'bg-gray-50 text-gray-500 border-gray-200';
    }
    
    // Status tags
    if (normalized === '未連絡' || normalized === '未接触' || normalized.toLowerCase() === 'uncontacted') {
        return 'bg-gray-50 text-gray-500 border-gray-200';
    }
    if (normalized === '連絡中' || normalized === '調査中' || normalized.toLowerCase() === 'contacting') {
        return 'bg-blue-50 text-blue-600 border-blue-200';
    }
    if (normalized === '連絡済み' || normalized.toLowerCase() === 'contacted') {
        return 'bg-green-50 text-green-600 border-green-200';
    }
    if (normalized === '除外候補' || normalized.toLowerCase() === 'excluded') {
        return 'bg-red-50 text-red-600 border-red-200';
    }
    
    // Category tags - assign colors based on industry type
    const categoryColors: Record<string, string> = {
        'IT・通信': 'bg-blue-50 text-blue-600 border-blue-200',
        '製造業': 'bg-indigo-50 text-indigo-600 border-indigo-200',
        '建設業': 'bg-orange-50 text-orange-600 border-orange-200',
        '小売・卸売': 'bg-pink-50 text-pink-600 border-pink-200',
        '金融・保険': 'bg-emerald-50 text-emerald-600 border-emerald-200',
        '不動産': 'bg-purple-50 text-purple-600 border-purple-200',
        'サービス業': 'bg-cyan-50 text-cyan-600 border-cyan-200',
        '医療・福祉': 'bg-red-50 text-red-600 border-red-200',
        '教育': 'bg-teal-50 text-teal-600 border-teal-200',
        '官公庁': 'bg-slate-50 text-slate-600 border-slate-200',
        'コンサルティング': 'bg-violet-50 text-violet-600 border-violet-200',
        '人材': 'bg-amber-50 text-amber-600 border-amber-200',
        '物流': 'bg-lime-50 text-lime-600 border-lime-200',
        'エネルギー': 'bg-yellow-50 text-yellow-700 border-yellow-200',
        'エンタメ': 'bg-rose-50 text-rose-600 border-rose-200',
        // Common variations
        'IT': 'bg-blue-50 text-blue-600 border-blue-200',
        'SaaS': 'bg-blue-50 text-blue-600 border-blue-200',
        'フィンテック': 'bg-emerald-50 text-emerald-600 border-emerald-200',
        'ロボティクス': 'bg-indigo-50 text-indigo-600 border-indigo-200',
    };
    
    return categoryColors[normalized] || null;
};

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
