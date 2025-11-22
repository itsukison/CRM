'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, onAuthStateChange, signIn, signOut, signUp } from '../services/authService';
import { getUserOrganizations } from '../services/organizationService';
import type { User, Organization } from '../types';

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
        const { data: { subscription } } = onAuthStateChange((newUser) => {
            setUser(newUser);
            if (newUser) {
                loadOrganizations();
            } else {
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

            if (orgs.length > 0) {
                // Restore previously selected org from localStorage
                const savedOrgId = localStorage.getItem('currentOrganizationId');
                const savedOrg = savedOrgId ? orgs.find(o => o.id === savedOrgId) : null;

                setCurrentOrganizationState(savedOrg || orgs[0]);
            } else {
                // User has no organizations
                setCurrentOrganizationState(null);
                localStorage.removeItem('currentOrganizationId');
            }
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
