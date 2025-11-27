import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
    try {
        const userId = request.nextUrl.searchParams.get('userId');
        
        if (!userId) {
            return NextResponse.json({ connected: false }, { status: 200 });
        }

        const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

        // Get Gmail connection
        const { data: connection, error: connectionError } = await supabase
            .from('gmail_connections')
            .select('email, expires_at')
            .eq('user_id', userId)
            .single();

        if (connectionError || !connection) {
            return NextResponse.json({ connected: false }, { status: 200 });
        }

        // Check if token is expired
        const isExpired = new Date(connection.expires_at) < new Date();

        return NextResponse.json({
            connected: !isExpired,
            email: connection.email,
            expiresAt: connection.expires_at,
        });
    } catch (err) {
        console.error('Error checking Gmail status:', err);
        return NextResponse.json(
            { connected: false, error: 'Failed to check status' },
            { status: 500 }
        );
    }
}
