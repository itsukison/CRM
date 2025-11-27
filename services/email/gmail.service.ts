import type { EmailTemplate, VariableMapping } from '@/features/contact/types';

export interface SendEmailParams {
    to: string;
    subject: string;
    body: string;
    templateId?: string;
    templateName?: string;
    orgId: string;
    userId: string;
}

export interface SendEmailResult {
    success: boolean;
    error?: string;
}

export interface BulkSendProgress {
    total: number;
    completed: number;
    successful: number;
    failed: number;
    currentEmail?: string;
}

/**
 * Replace template variables with actual values
 */
export function replaceVariables(
    text: string,
    mappings: VariableMapping[],
    rowData: Record<string, unknown>
): string {
    let result = text;
    
    for (const mapping of mappings) {
        const regex = new RegExp(`\\{${mapping.variable}\\}`, 'g');
        const value = String(rowData[mapping.columnId] ?? '');
        result = result.replace(regex, value);
    }
    
    return result;
}

/**
 * Send a single email
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
    try {
        const response = await fetch('/api/gmail/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            const data = await response.json();
            return {
                success: false,
                error: data.error || 'Failed to send email',
            };
        }

        return { success: true };
    } catch (err) {
        console.error('Send email error:', err);
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Unknown error',
        };
    }
}

/**
 * Send bulk emails with progress callback
 */
export async function sendBulkEmails(
    template: EmailTemplate,
    recipients: Array<{
        email: string;
        rowData: Record<string, unknown>;
    }>,
    mappings: VariableMapping[],
    orgId: string,
    userId: string,
    onProgress?: (progress: BulkSendProgress) => void
): Promise<{ successful: number; failed: number; errors: string[] }> {
    const results = {
        successful: 0,
        failed: 0,
        errors: [] as string[],
    };

    for (let i = 0; i < recipients.length; i++) {
        const recipient = recipients[i];
        
        // Update progress
        onProgress?.({
            total: recipients.length,
            completed: i,
            successful: results.successful,
            failed: results.failed,
            currentEmail: recipient.email,
        });

        // Replace variables in subject and body
        const subject = replaceVariables(template.subject, mappings, recipient.rowData);
        const body = replaceVariables(template.body, mappings, recipient.rowData);

        // Send email
        const result = await sendEmail({
            to: recipient.email,
            subject,
            body,
            templateId: template.id,
            templateName: template.name,
            orgId,
            userId,
        });

        if (result.success) {
            results.successful++;
        } else {
            results.failed++;
            results.errors.push(`${recipient.email}: ${result.error}`);
        }

        // Small delay to avoid rate limiting
        if (i < recipients.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 200));
        }
    }

    // Final progress update
    onProgress?.({
        total: recipients.length,
        completed: recipients.length,
        successful: results.successful,
        failed: results.failed,
    });

    return results;
}

/**
 * Check Gmail connection status
 */
export async function checkGmailConnection(): Promise<{
    connected: boolean;
    email?: string;
}> {
    try {
        const response = await fetch('/api/gmail/status');
        const data = await response.json();
        return data;
    } catch {
        return { connected: false };
    }
}

/**
 * Detect email columns from table columns
 */
export function detectEmailColumns(columns: Array<{ id: string; name: string; type: string }>): Array<{ id: string; name: string }> {
    const emailPatterns = /email|e-mail|mail|メール/i;
    
    return columns.filter((col) => {
        // Check column type first
        if (col.type === 'mail' || col.type === 'email') {
            return true;
        }
        // Check column name
        return emailPatterns.test(col.name);
    }).map((col) => ({
        id: col.id,
        name: col.name,
    }));
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

