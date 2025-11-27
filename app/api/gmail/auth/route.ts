import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL + '/api/gmail/callback';

const SCOPES = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/userinfo.email',
];

export async function GET(request: NextRequest) {
    if (!GOOGLE_CLIENT_ID) {
        return NextResponse.json(
            { error: 'Google OAuth not configured' },
            { status: 500 }
        );
    }

    // Get user ID from query param (passed from client)
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
        return NextResponse.json(
            { error: 'User ID required' },
            { status: 400 }
        );
    }

    // Generate state for CSRF protection (include userId)
    const stateData = {
        csrf: crypto.randomUUID(),
        userId,
    };
    const state = Buffer.from(JSON.stringify(stateData)).toString('base64');
    
    // Store CSRF token in cookie for verification
    const cookieStore = await cookies();
    cookieStore.set('gmail_oauth_csrf', stateData.csrf, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 10, // 10 minutes
    });

    // Build OAuth URL
    const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: GOOGLE_REDIRECT_URI,
        response_type: 'code',
        scope: SCOPES.join(' '),
        access_type: 'offline',
        prompt: 'consent',
        state,
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    return NextResponse.redirect(authUrl);
}

