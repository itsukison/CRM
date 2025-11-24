/**
 * Converts a column index to Excel-style column letter (A, B, C, ..., Z, AA, AB, ...)
 * @param colIndex - Zero-based column index
 * @returns Column letter (e.g., 0 -> 'A', 25 -> 'Z', 26 -> 'AA')
 */
export function getColumnLetter(colIndex: number): string {
    let letter = '';
    while (colIndex >= 0) {
        letter = String.fromCharCode((colIndex % 26) + 65) + letter;
        colIndex = Math.floor(colIndex / 26) - 1;
    }
    return letter;
}

/**
 * Checks if a column appears to be a placeholder/empty column
 * @param col - Column to check
 * @returns true if column seems to be an auto-generated placeholder
 */
export function isPlaceholderColumn(col: { title: string; description?: string }): boolean {
    const title = (col.title || '').trim();
    const isAutoColumnNumber = /^Column \d+$/i.test(title);
    const isAutoColumnLetter = /^Column [A-Z]+$/i.test(title);
    const hasNoDescription = !col.description || col.description.trim() === '';

    // Treat unnamed or auto-generated "Column X" / "Column A" style headers as placeholders
    if (!title) return true;
    if ((isAutoColumnNumber || isAutoColumnLetter) && hasNoDescription) return true;

    return false;
}
