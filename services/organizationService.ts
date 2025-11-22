import { supabase } from '../lib/supabase';
import type { Organization, OrgMember } from '../types';

/**
 * Create a new organization
 */
export async function createOrganization(
    name: string,
    description?: string
): Promise<{ organization: Organization | null; error: Error | null }> {
    try {
        // Get the current user session
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
            console.error('Failed to get user:', userError);
            throw new Error(`認証エラー: ${userError.message}`);
        }
        
        if (!user) {
            throw new Error('ユーザーが認証されていません。再度サインインしてください。');
        }

        console.log('Creating organization with user ID:', user.id);

        // Create the organization
        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .insert({
                name,
                description,
                owner_id: user.id,
            })
            .select()
            .single();

        if (orgError) {
            console.error('Organization creation error:', orgError);
            throw new Error(`組織作成エラー: ${orgError.message}`);
        }

        // Add user as owner in org_members
        const { error: memberError } = await supabase
            .from('org_members')
            .insert({
                org_id: orgData.id,
                user_id: user.id,
                role: 'owner',
            });

        if (memberError) throw memberError;

        return { organization: orgData as Organization, error: null };
    } catch (error) {
        return { organization: null, error: error as Error };
    }
}

/**
 * Get all organizations the current user is a member of
 */
export async function getUserOrganizations(): Promise<{
    organizations: Organization[];
    error: Error | null;
}> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Get all organizations where user is a member
        const { data: memberData, error: memberError } = await supabase
            .from('org_members')
            .select('org_id')
            .eq('user_id', user.id);

        if (memberError) throw memberError;

        const orgIds = memberData.map(m => m.org_id);

        if (orgIds.length === 0) {
            return { organizations: [], error: null };
        }

        // Get organization details
        const { data: orgsData, error: orgsError } = await supabase
            .from('organizations')
            .select('*')
            .in('id', orgIds)
            .order('created_at', { ascending: false });

        if (orgsError) throw orgsError;

        return { organizations: orgsData as Organization[], error: null };
    } catch (error) {
        return { organizations: [], error: error as Error };
    }
}

/**
 * Update organization details
 */
export async function updateOrganization(
    orgId: string,
    updates: { name?: string; description?: string }
): Promise<{ error: Error | null }> {
    try {
        const { error } = await supabase
            .from('organizations')
            .update(updates)
            .eq('id', orgId);

        if (error) throw error;
        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
}

/**
 * Delete an organization (owner only)
 */
export async function deleteOrganization(orgId: string): Promise<{ error: Error | null }> {
    try {
        const { error } = await supabase
            .from('organizations')
            .delete()
            .eq('id', orgId);

        if (error) throw error;
        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
}

/**
 * Get all members of an organization
 */
export async function getOrgMembers(orgId: string): Promise<{
    members: (OrgMember & { email: string })[];
    error: Error | null;
}> {
    try {
        const { data, error } = await supabase
            .from('org_members')
            .select(`
                *,
                user:user_id (
                    email
                )
            `)
            .eq('org_id', orgId);

        if (error) throw error;

        // Transform the data to include email
        const members = data.map(m => ({
            org_id: m.org_id,
            user_id: m.user_id,
            role: m.role as 'owner' | 'admin' | 'member' | 'viewer',
            joined_at: m.joined_at!,
            email: (m as any).user?.email || '',
        }));

        return { members, error: null };
    } catch (error) {
        return { members: [], error: error as Error };
    }
}

/**
 * Update a member's role in an organization
 */
export async function updateMemberRole(
    orgId: string,
    userId: string,
    role: 'owner' | 'admin' | 'member' | 'viewer'
): Promise<{ error: Error | null }> {
    try {
        const { error } = await supabase
            .from('org_members')
            .update({ role })
            .eq('org_id', orgId)
            .eq('user_id', userId);

        if (error) throw error;
        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
}

/**
 * Remove a member from an organization
 */
export async function removeMember(orgId: string, userId: string): Promise<{ error: Error | null }> {
    try {
        const { error } = await supabase
            .from('org_members')
            .delete()
            .eq('org_id', orgId)
            .eq('user_id', userId);

        if (error) throw error;
        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
}
