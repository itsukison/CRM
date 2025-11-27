import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface SendEmailRequest {
    to: string;
    subject: string;
    body: string;
    templateId?: string;
    templateName?: string;
    orgId: string;
    userId: string;
}

interface TokenRefreshResponse {
    access_token: string;
    expires_in: number;
}

async function refreshAccessToken(refreshToken: string): Promise<TokenRefreshResponse | null> {
    try {
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: GOOGLE_CLIENT_ID!,
                client_secret: GOOGLE_CLIENT_SECRET!,
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
            }),
        });

        if (!response.ok) {
            console.error('Token refresh failed:', await response.text());
            return null;
        }

        return response.json();
    } catch (err) {
        console.error('Token refresh error:', err);
        return null;
    }
}

function createEmailMessage(to: string, subject: string, body: string, from: string): string {
    // Create RFC 2822 compliant message
    const message = [
        `From: ${from}`,
        `To: ${to}`,
        `Subject: ${subject}`,
        'Content-Type: text/plain; charset=utf-8',
        '',
        body,
    ].join('\r\n');

    // Base64 URL encode
    return Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export async function POST(request: NextRequest) {
    try {
        // Get request body
        const reqBody: SendEmailRequest = await request.json();
        const { to, subject, body: emailBody, templateId, templateName, orgId, userId } = reqBody;

        if (!to || !subject || !emailBody || !orgId || !userId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

        // Get Gmail connection
        const { data: connection, error: connectionError } = await supabase
            .from('gmail_connections')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (connectionError || !connection) {
            return NextResponse.json(
                { error: 'Gmail not connected' },
                { status: 400 }
            );
        }

        let accessToken = connection.access_token;

        // Check if token needs refresh
        if (new Date(connection.expires_at) < new Date()) {
            const refreshResult = await refreshAccessToken(connection.refresh_token);
            
            if (!refreshResult) {
                // Log activity as error
                await supabase.from('email_activity').insert({
                    org_id: orgId,
                    user_id: userId,
                    template_id: templateId,
                    template_name: templateName,
                    recipient_email: to,
                    subject,
                    status: 'error',
                    error_message: 'Gmail token expired. Please reconnect.',
                });

                return NextResponse.json(
                    { error: 'Gmail token expired. Please reconnect.' },
                    { status: 401 }
                );
            }

            accessToken = refreshResult.access_token;

            // Update stored token
            await supabase
                .from('gmail_connections')
                .update({
                    access_token: accessToken,
                    expires_at: new Date(Date.now() + refreshResult.expires_in * 1000).toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', userId);
        }

        // Create and send email via Gmail API
        const rawMessage = createEmailMessage(to, subject, emailBody, connection.email);

        const sendResponse = await fetch(
            'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ raw: rawMessage }),
            }
        );

        if (!sendResponse.ok) {
            const errorData = await sendResponse.json();
            console.error('Gmail send failed:', errorData);

            // Log activity as error
            await supabase.from('email_activity').insert({
                org_id: orgId,
                user_id: userId,
                template_id: templateId,
                template_name: templateName,
                recipient_email: to,
                subject,
                status: 'error',
                error_message: errorData.error?.message || 'Failed to send email',
            });

            return NextResponse.json(
                { error: errorData.error?.message || 'Failed to send email' },
                { status: 500 }
            );
        }

        // Log successful activity
        await supabase.from('email_activity').insert({
            org_id: orgId,
            user_id: userId,
            template_id: templateId,
            template_name: templateName,
            recipient_email: to,
            subject,
            status: 'success',
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Send email error:', err);
        return NextResponse.json(
            { error: 'Failed to send email' },
            { status: 500 }
        );
    }
}
