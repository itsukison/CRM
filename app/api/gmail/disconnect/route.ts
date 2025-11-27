import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const userId = body.userId;

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID required' },
                { status: 400 }
            );
        }

        const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

        // Delete Gmail connection
        const { error: deleteError } = await supabase
            .from('gmail_connections')
            .delete()
            .eq('user_id', userId);

        if (deleteError) {
            console.error('Failed to delete connection:', deleteError);
            return NextResponse.json(
                { error: 'Failed to disconnect Gmail' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Disconnect error:', err);
        return NextResponse.json(
            { error: 'Failed to disconnect Gmail' },
            { status: 500 }
        );
    }
}
