// Organization model
export interface Organization {
    id: string;
    name: string;
    description?: string;
    owner_id: string;
    created_at: string;
    updated_at?: string;
}

// Organization member model
export interface OrgMember {
    org_id: string;
    user_id: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
    joined_at: string;
}

// Organization invitation model
export interface Invitation {
    id: string;
    org_id: string;
    email: string;
    role: string;
    token: string;
    expires_at: string;
    invited_by?: string;
    created_at: string;
    accepted_at?: string;
}
