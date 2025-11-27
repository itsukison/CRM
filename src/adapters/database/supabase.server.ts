import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Create a Supabase client for server-side use in API routes.
 * This client will use the access token from cookies for authentication.
 */
export async function createServerSupabaseClient() {
    const cookieStore = await cookies();
    
    // Get the access token from cookies
    const accessToken = cookieStore.get('sb-access-token')?.value;
    const refreshToken = cookieStore.get('sb-refresh-token')?.value;
    
    // Also check for the combined auth token cookie that Supabase uses
    const authCookie = cookieStore.get(`sb-${supabaseUrl.split('//')[1].split('.')[0]}-auth-token`)?.value;
    
    const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false,
        },
        global: {
            headers: accessToken ? {
                Authorization: `Bearer ${accessToken}`,
            } : undefined,
        },
    });

    // If we have the auth cookie, try to set the session
    if (authCookie) {
        try {
            const parsed = JSON.parse(authCookie);
            if (parsed.access_token) {
                await client.auth.setSession({
                    access_token: parsed.access_token,
                    refresh_token: parsed.refresh_token || '',
                });
            }
        } catch (e) {
            // Cookie might not be JSON, ignore
        }
    }

    return client;
}

/**
 * Get the current user from server-side context
 */
export async function getServerUser() {
    const client = await createServerSupabaseClient();
    const { data: { user }, error } = await client.auth.getUser();
    return { user, error };
}

