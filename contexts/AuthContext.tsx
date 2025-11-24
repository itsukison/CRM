'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, onAuthStateChange, signIn, signOut, signUp } from '../services/authService';
import { getUserOrganizations } from '../services/organizationService';
import type { User, Organization } from '@/types';

interface AuthContextType {
    user: User | null;
    organizations: Organization[];
    currentOrganization: Organization | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    setCurrentOrganization: (org: Organization) => void;
    refreshOrganizations: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [currentOrganization, setCurrentOrganizationState] = useState<Organization | null>(null);
    const [loading, setLoading] = useState(true);

    // Load user on mount
    useEffect(() => {
        loadUser();

        // Subscribe to auth state changes
        const { data: { subscription } } = onAuthStateChange((event, newUser) => {
            // We only want to react to real sign-in / sign-out transitions.
            // Events like TOKEN_REFRESHED can fire when the tab is refocused,
            // but they should not cause us to reload organizations and tables.
            if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
                setUser(newUser);
                if (newUser) {
                    loadOrganizations();
                }
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setOrganizations([]);
                setCurrentOrganizationState(null);
            }
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    async function loadUser() {
        try {
            setLoading(true);
            const currentUser = await getCurrentUser();
            setUser(currentUser);

            if (currentUser) {
                await loadOrganizations();
            }
        } catch (error) {
            console.error('Error loading user:', error);
            // Set user to null and continue even if there's an error
            setUser(null);
        } finally {
            // Always set loading to false to allow app to render
            setLoading(false);
        }
    }

    async function loadOrganizations() {
        const { organizations: orgs, error } = await getUserOrganizations();
        if (!error) {
            setOrganizations(orgs);

            // Compute the desired current organization based on saved preference
            let nextCurrent: Organization | null = null;
            if (orgs.length > 0) {
                const savedOrgId = localStorage.getItem('currentOrganizationId');
                const savedOrg = savedOrgId ? orgs.find(o => o.id === savedOrgId) : null;
                nextCurrent = savedOrg || orgs[0];
            } else {
                // User has no organizations
                localStorage.removeItem('currentOrganizationId');
            }

            // Only update if the selected organization ID actually changed.
            setCurrentOrganizationState(prev => {
                if (prev?.id === nextCurrent?.id) {
                    return prev;
                }
                return nextCurrent;
            });
        }
    }

    async function refreshOrganizations() {
        await loadOrganizations();
    }

    function setCurrentOrganization(org: Organization) {
        setCurrentOrganizationState(org);
        localStorage.setItem('currentOrganizationId', org.id);
    }

    async function handleSignIn(email: string, password: string) {
        const { error } = await signIn(email, password);
        if (!error) {
            await loadUser();
        }
        return { error };
    }

    async function handleSignUp(email: string, password: string) {
        const { error } = await signUp(email, password);
        if (!error) {
            await loadUser();
        }
        return { error };
    }

    async function handleSignOut() {
        await signOut();
        setUser(null);
        setOrganizations([]);
        setCurrentOrganizationState(null);
        localStorage.removeItem('currentOrganizationId');
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                organizations,
                currentOrganization,
                loading,
                signIn: handleSignIn,
                signUp: handleSignUp,
                signOut: handleSignOut,
                setCurrentOrganization,
                refreshOrganizations,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
