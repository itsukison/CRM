import { supabase } from '../lib/supabase';
import type { User } from '../types';

export interface AuthResponse {
    user: User | null;
    error: Error | null;
}

/**
 * Sign up a new user
 */
export async function signUp(
    email: string,
    password: string
): Promise<AuthResponse> {
    try {
        // Create the user account (no email confirmation required)
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('No user data returned');

        return {
            user: {
                id: authData.user.id,
                email: authData.user.email!,
            },
            error: null,
        };
    } catch (error) {
        return {
            user: null,
            error: error as Error,
        };
    }
}

/**
 * Sign in an existing user
 */
export async function signIn(email: string, password: string): Promise<AuthResponse> {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        if (!data.user) throw new Error('No user data returned');

        return {
            user: {
                id: data.user.id,
                email: data.user.email!,
            },
            error: null,
        };
    } catch (error) {
        return {
            user: null,
            error: error as Error,
        };
    }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error: Error | null }> {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
}

/**
 * Get the currently authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        return {
            id: user.id,
            email: user.email!,
        };
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

/**
 * Subscribe to authentication state changes
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
            callback({
                id: session.user.id,
                email: session.user.email!,
            });
        } else {
            callback(null);
        }
    });
}
