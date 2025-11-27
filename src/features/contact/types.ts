// Email Template types
export interface EmailTemplate {
    id: string;
    org_id: string;
    name: string;
    subject: string;
    body: string;
    variables: string[];
    created_at: string | null;
    updated_at: string | null;
}

export interface EmailTemplateInput {
    name: string;
    subject: string;
    body: string;
    variables?: string[];
}

// Email Activity types
export type EmailStatus = 'success' | 'error' | 'pending';

export interface EmailActivity {
    id: string;
    org_id: string;
    user_id: string;
    template_id: string | null;
    template_name: string | null;
    recipient_email: string;
    subject: string | null;
    status: EmailStatus;
    error_message: string | null;
    sent_at: string | null;
}

// Gmail Connection types
export interface GmailConnection {
    id: string;
    user_id: string;
    email: string;
    expires_at: string;
    created_at: string | null;
}

export interface GmailConnectionStatus {
    connected: boolean;
    email?: string;
    expiresAt?: string;
}

// Variable mapping for email sending
export interface VariableMapping {
    variable: string;
    columnId: string;
}

// Email send request
export interface SendEmailRequest {
    templateId: string;
    recipients: {
        email: string;
        variables: Record<string, string>;
    }[];
}

// Tab type for Contact page
export type ContactTab = 'templates' | 'activity';

