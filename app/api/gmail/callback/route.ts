import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL + '/api/gmail/callback';

// Use service role key for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface TokenResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
}

interface UserInfo {
    email: string;
}

interface StateData {
    csrf: string;
    userId: string;
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    const cookieStore = await cookies();
    const storedCsrf = cookieStore.get('gmail_oauth_csrf')?.value;

    // Clear CSRF cookie
    cookieStore.delete('gmail_oauth_csrf');

    // Handle errors
    if (error) {
        console.error('OAuth error:', error);
        return NextResponse.redirect(
            new URL('/dashboard/contact?error=oauth_denied', request.url)
        );
    }

    // Parse and verify state
    let stateData: StateData;
    try {
        stateData = JSON.parse(Buffer.from(state || '', 'base64').toString());
    } catch {
        console.error('Invalid state format');
        return NextResponse.redirect(
            new URL('/dashboard/contact?error=invalid_state', request.url)
        );
    }

    // Verify CSRF token
    if (!stateData.csrf || stateData.csrf !== storedCsrf) {
        console.error('CSRF mismatch');
        return NextResponse.redirect(
            new URL('/dashboard/contact?error=invalid_state', request.url)
        );
    }

    if (!stateData.userId) {
        console.error('No user ID in state');
        return NextResponse.redirect(
            new URL('/dashboard/contact?error=invalid_state', request.url)
        );
    }

    if (!code) {
        return NextResponse.redirect(
            new URL('/dashboard/contact?error=no_code', request.url)
        );
    }

    try {
        // Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: GOOGLE_CLIENT_ID!,
                client_secret: GOOGLE_CLIENT_SECRET!,
                code,
                grant_type: 'authorization_code',
                redirect_uri: GOOGLE_REDIRECT_URI,
            }),
        });

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.text();
            console.error('Token exchange failed:', errorData);
            throw new Error('Failed to exchange code for tokens');
        }

        const tokens: TokenResponse = await tokenResponse.json();

        // Get user email from Google
        const userInfoResponse = await fetch(
            'https://www.googleapis.com/oauth2/v2/userinfo',
            {
                headers: {
                    Authorization: `Bearer ${tokens.access_token}`,
                },
            }
        );

        if (!userInfoResponse.ok) {
            throw new Error('Failed to get user info');
        }

        const userInfo: UserInfo = await userInfoResponse.json();

        // Create Supabase client with service role key for database operations
        const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

        // Calculate expiry
        const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

        // Store connection in database (upsert)
        const { error: upsertError } = await supabase
            .from('gmail_connections')
            .upsert(
                {
                    user_id: stateData.userId,
                    email: userInfo.email,
                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token,
                    expires_at: expiresAt,
                    updated_at: new Date().toISOString(),
                },
                {
                    onConflict: 'user_id',
                }
            );

        if (upsertError) {
            console.error('Failed to store connection:', upsertError);
            throw new Error('Failed to store Gmail connection');
        }

        // Redirect back to contact page with success
        return NextResponse.redirect(
            new URL('/dashboard/contact?gmail=connected', request.url)
        );
    } catch (err) {
        console.error('OAuth callback error:', err);
        return NextResponse.redirect(
            new URL('/dashboard/contact?error=oauth_failed', request.url)
        );
    }
}
