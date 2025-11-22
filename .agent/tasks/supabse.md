Supabase Backend Implementation for BaseCRM
Migrate the BaseCRM application from client-side state management to a fully integrated Supabase backend with authentication, multi-tenant organization support, and pure JSONB schema for maximum flexibility. All database operations will be performed using Supabase MCP tools for direct management.

User Review Required
IMPORTANT

Pure JSONB Schema Design: Simplified from the hybrid approach:

All row data stored in a single JSONB column (data) with GIN indexing
Column definitions stored in tables.columns as JSONB array
No column mapping complexity: Direct storage of column_id → value pairs
Flexible and performant: PostgreSQL JSONB with GIN indexes provides excellent query performance
Schema validation: Server-side Postgres trigger validates data against table column schema
IMPORTANT

Supabase MCP Integration: All database operations via MCP tools:

mcp2_apply_migration: Create and apply migrations directly (no manual SQL files)
mcp2_generate_typescript_types: Auto-generate types from database schema
mcp2_get_advisors: Automated security and performance checks
mcp2_execute_sql: Run DDL operations for functions, triggers, indexes
WARNING

Breaking Change: This implementation will transition from local state to Supabase persistence:

Existing mock data in

constants.ts
will need migration or re-creation
Users will need to create accounts to access their data
Current session state will not persist without authentication
IMPORTANT

Token-Based Invitations: Complete invitation system for team collaboration:

Email-based invitations with unique tokens
Invitations work for both existing and new users
Configurable roles (owner, admin, member, viewer)
Expiration handling for security
IMPORTANT

Optimized RLS Policies: Performance-first security:

Helper function user_organizations() caches org membership
Avoids nested subqueries in every RLS check
Uses SECURITY DEFINER for efficient permission checks
Data isolation enforced at database level
Proposed Changes
All database operations will be performed using Supabase MCP tools instead of manual migration files. The implementation is organized into: Database Migrations (via MCP), Backend Services, and Frontend Integration.

Phase 1: Database Schema via Supabase MCP
All migrations will be applied via mcp2_apply_migration tool for direct database management.

Migration 1: Organizations & Members
Via: mcp2_apply_migration(project_id, "create_organizations", sql)

Core multi-tenant structure:

-- Organizations table
CREATE TABLE organizations (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
name TEXT NOT NULL,
description TEXT,
owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Organization members
CREATE TABLE org_members (
org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
joined_at TIMESTAMPTZ DEFAULT NOW(),
PRIMARY KEY (org_id, user_id)
);
-- Indexes
CREATE INDEX idx_org_members_user_id ON org_members(user_id);
CREATE INDEX idx_org_members_org_id ON org_members(org_id);
-- RLS Helper Function (Performance Optimization)
CREATE OR REPLACE FUNCTION user_organizations(user_uuid UUID)
RETURNS SETOF UUID AS $$
SELECT org_id FROM org_members WHERE user_id = user_uuid;

$$
LANGUAGE sql STABLE SECURITY DEFINER;
-- RLS Policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view their orgs" ON organizations FOR SELECT
    USING (id IN (SELECT user_organizations(auth.uid())));
CREATE POLICY "Users create orgs" ON organizations FOR INSERT
    WITH CHECK (auth.uid() = owner_id);
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view their memberships" ON org_members FOR SELECT
    USING (user_id = auth.uid() OR org_id IN (SELECT user_organizations(auth.uid())));
Migration 2: Organization Invitations
Via: mcp2_apply_migration(project_id, "create_org_invitations", sql)

Token-based invitation system:

CREATE TABLE org_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
    token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    invited_by UUID REFERENCES auth.users(id),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    CONSTRAINT unique_pending_invite UNIQUE (org_id, email)
);
CREATE INDEX idx_org_invitations_token ON org_invitations(token);
CREATE INDEX idx_org_invitations_email ON org_invitations(email);
ALTER TABLE org_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members view invitations" ON org_invitations FOR SELECT
    USING (org_id IN (SELECT user_organizations(auth.uid())));
CREATE POLICY "Org admins create invitations" ON org_invitations FOR INSERT
    WITH CHECK (
        org_id IN (
            SELECT org_id FROM org_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );
Migration 3: Tables Metadata with Pure JSONB Columns
Via: mcp2_apply_migration(project_id, "create_tables", sql)

Dynamic table definitions with column schema:

CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    columns JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Columns JSONB structure: [{ id, name, type, required, order }]
COMMENT ON COLUMN tables.columns IS 'Array of column definitions: [{ id: string, name: string, type: text|number|url|email|date|tag, required: boolean, order: number }]';
CREATE INDEX idx_tables_org_id ON tables(org_id);
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view org tables" ON tables FOR SELECT
    USING (org_id IN (SELECT user_organizations(auth.uid())));
CREATE POLICY "Users create org tables" ON tables FOR INSERT
    WITH CHECK (org_id IN (SELECT user_organizations(auth.uid())));
CREATE POLICY "Users update org tables" ON tables FOR UPDATE
    USING (org_id IN (SELECT user_organizations(auth.uid())));
CREATE POLICY "Users delete org tables" ON tables FOR DELETE
    USING (org_id IN (SELECT user_organizations(auth.uid())));
Migration 4: Table Rows with Pure JSONB Data
Via: mcp2_apply_migration(project_id, "create_table_rows", sql)

Pure JSONB storage for maximum flexibility:

CREATE TABLE table_rows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID REFERENCES tables(id) ON DELETE CASCADE,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Data JSONB structure: { column_id → value }
COMMENT ON COLUMN table_rows.data IS 'Row data as JSONB object mapping column IDs to values: { col_id_1: value1, col_id_2: value2, ... }';
-- Performance Indexes
CREATE INDEX idx_table_rows_table_id ON table_rows(table_id);
CREATE INDEX idx_table_rows_data ON table_rows USING GIN (data);
CREATE INDEX idx_table_rows_table_created ON table_rows(table_id, created_at DESC);
-- RLS Policies (via table → org membership)
ALTER TABLE table_rows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view org rows" ON table_rows FOR SELECT
    USING (table_id IN (
        SELECT id FROM tables WHERE org_id IN (SELECT user_organizations(auth.uid()))
    ));
CREATE POLICY "Users insert org rows" ON table_rows FOR INSERT
    WITH CHECK (table_id IN (
        SELECT id FROM tables WHERE org_id IN (SELECT user_organizations(auth.uid()))
    ));
CREATE POLICY "Users update org rows" ON table_rows FOR UPDATE
    USING (table_id IN (
        SELECT id FROM tables WHERE org_id IN (SELECT user_organizations(auth.uid()))
    ));
CREATE POLICY "Users delete org rows" ON table_rows FOR DELETE
    USING (table_id IN (
        SELECT id FROM tables WHERE org_id IN (SELECT user_organizations(auth.uid()))
    ));
Migration 5: Server-Side Data Validation Trigger
Via: mcp2_apply_migration(project_id, "create_validation_trigger", sql)

Validate row data against table column schema:

CREATE OR REPLACE FUNCTION validate_row_data()
RETURNS TRIGGER AS
$$

DECLARE
table_columns JSONB;
col JSONB;
col_id TEXT;
col_type TEXT;
col_required BOOLEAN;
data_value JSONB;
BEGIN
-- Get column definitions for this table
SELECT columns INTO table_columns FROM tables WHERE id = NEW.table_id;

    -- Validate each required column exists
    FOR col IN SELECT * FROM jsonb_array_elements(table_columns)
    LOOP
        col_id := col->>'id';
        col_type := col->>'type';
        col_required := COALESCE((col->>'required')::boolean, false);

        data_value := NEW.data->col_id;

        -- Check required fields
        IF col_required AND (data_value IS NULL OR data_value = 'null'::jsonb) THEN
            RAISE EXCEPTION 'Required column % is missing', col->>'name';
        END IF;

        -- Type validation
        IF data_value IS NOT NULL AND data_value != 'null'::jsonb THEN
            CASE col_type
                WHEN 'number' THEN
                    IF jsonb_typeof(data_value) NOT IN ('number', 'string') THEN
                        RAISE EXCEPTION 'Column % must be a number', col->>'name';
                    END IF;
                WHEN 'text', 'url', 'email', 'tag' THEN
                    IF jsonb_typeof(data_value) != 'string' THEN
                        RAISE EXCEPTION 'Column % must be a string', col->>'name';
                    END IF;
                WHEN 'date' THEN
                    IF jsonb_typeof(data_value) != 'string' THEN
                        RAISE EXCEPTION 'Column % must be a date string', col->>'name';
                    END IF;
            END CASE;
        END IF;
    END LOOP;

    RETURN NEW;

END;

$$
LANGUAGE plpgsql;
CREATE TRIGGER validate_row_before_write
    BEFORE INSERT OR UPDATE ON table_rows
    FOR EACH ROW EXECUTE FUNCTION validate_row_data();
Type Generation
Via: mcp2_generate_typescript_types(project_id)

Auto-generate TypeScript types from the database schema for type-safe frontend development.

Phase 2: Backend Services Layer
[COMPLETED]

lib/supabase.ts
Supabase client configuration:

import { createClient } from '@supabase/supabase-js';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
[COMPLETED]

services/authService.ts
Authentication with auto-organization creation:

signUp(email, password, name): Create account + default organization
signIn(email, password): Authenticate user
signOut(): End session
getCurrentUser(): Get authenticated user
onAuthStateChange(callback): Subscribe to auth changes
[COMPLETED]

services/organizationService.ts
Organization and membership management:

createOrganization(name, description): Create workspace
getUserOrganizations(): List user's organizations with member count
updateOrganization(orgId, updates): Update org metadata
deleteOrganization(orgId): Remove organization (owner only)
getOrgMembers(orgId): List members with roles
updateMemberRole(orgId, userId, role): Change permissions
removeMember(orgId, userId): Remove user from org
[COMPLETED]

services/invitationService.ts
Token-based invitation system:

createInvitation(orgId, email, role): Generate invite token
getOrgInvitations(orgId): List pending invitations
acceptInvitation(token): Accept invite and join org
revokeInvitation(inviteId): Cancel invitation
validateInvitationToken(token): Check if token is valid
[COMPLETED]

services/tableService.ts
Table management with JSONB column schema:

createTable(orgId, name, description, columns): Create with column definitions
getTables(orgId): List all tables in organization
getTable(tableId): Get table with column schema
updateTable(tableId, updates): Update metadata or columns
deleteTable(tableId): Remove table
Column schema utilities for frontend
[COMPLETED]

services/rowService.ts
Row operations with pure JSONB:

createRow(tableId, data): Insert record (data is { column_id → value })
getRows(tableId): Fetch all rows with JSONB data
updateRow(rowId, data): Update record
deleteRow(rowId): Remove single record
deleteRows(rowIds): Bulk delete
Transform utilities between frontend format and JSONB
[COMPLETED]

services/realtimeService.ts
Real-time collaboration subscriptions:

export function subscribeToTableRows(
    tableId: string,
    callback: (payload: any) => void
) {
    return supabase
        .channel(`table_rows:${tableId}`)
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'table_rows',
            filter: `table_id=eq.${tableId}`
        }, callback)
        .subscribe();
}
export function subscribeToTables(
    orgId: string,
    callback: (payload: any) => void
) {
    return supabase
        .channel(`tables:${orgId}`)
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'tables',
            filter: `org_id=eq.${orgId}`
        }, callback)
        .subscribe();
}
Phase 3: Frontend Integration
[MODIFY]

types.ts
Add backend-related types and column definition:

// Column Definition for JSONB schema
export interface ColumnDefinition {
    id: string;
    name: string;
    type: 'text' | 'number' | 'url' | 'email' | 'date' | 'tag';
    description?: string;
    required?: boolean;
    order: number;
    textOverflow?: TextOverflowMode;
}
// User and organization types
export interface User {
    id: string;
    email: string;
}
export interface Organization {
    id: string;
    name: string;
    description?: string;
    owner_id: string;
    created_at: string;
}
export interface OrgMember {
    org_id: string;
    user_id: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
    joined_at: string;
}
export interface Invitation {
    id: string;
    org_id: string;
    email: string;
    role: string;
    token: string;
    expires_at: string;
    invited_by: string;
}
// Update existing types
export interface TableData {
    id: string;
    org_id: string; // Added
    name: string;
    description: string;
    columns: ColumnDefinition[]; // Changed from Column[]
    rows: Row[];
    created_at?: string;
    updated_at?: string;
}
[COMPLETED]

contexts/AuthContext.tsx
Authentication and organization context:

Manage user state and current organization
Provide auth methods throughout app
Handle organization switching
Persist selected organization in localStorage
[COMPLETED]

components/auth/SignInPage.tsx
Sign in UI following STYLE_GUIDE.md:

Base design system (grayscale + blue)
Email/password form with validation
Error handling with clear messages
Link to sign up and password reset
[COMPLETED]

components/auth/SignUpPage.tsx
Sign up UI following STYLE_GUIDE.md:

Registration form with org name
Password strength indicator
Auto-create default organization on signup
Redirect to dashboard after creation
[COMPLETED]

pages/InvitationAcceptPage.tsx
Handle invitation token acceptance:

Parse token from URL
Display organization and role information
Handle both authenticated and anonymous users
Join organization and redirect to dashboard
[COMPLETED]

components/OrganizationSwitcher.tsx
Organization selection dropdown:

List all user organizations
Show current organization
Switch between organizations
Link to organization settings
[COMPLETED]

pages/OrganizationSettingsPage.tsx
Manage organization:

Update org name and description
List members with roles
Create and manage invitations
Remove members (admin/owner only)
[COMPLETED]

App.tsx
Wrap with authentication:

Add AuthProvider wrapper
Add route protection for dashboard
Add invitation acceptance route
Handle auth loading state
[COMPLETED]

pages/DashboardLayout.tsx
Load from Supabase:

Fetch tables from current organization
Add OrganizationSwitcher component
Subscribe to table changes via real-time
Handle organization switching
[COMPLETED]

pages/DashboardPage.tsx
Connect to Supabase:

Display tables from current organization
Show organization statistics
Add organization settings link
Removed Mock Data (INITIAL_TABLES)
[COMPLETED]

components/TableView.tsx
Sync with pure JSONB backend:

Update all CRUD to use rowService
Handle JSONB data format (column_id → value)
Add real-time subscriptions for collaborative editing
Implement optimistic updates for UX
Validate data against column schema before submission
[COMPLETED]

components/TableCreator.tsx
Create tables in Supabase:

Use ColumnDefinition type for schema
Call tableService.createTable with JSONB columns
Pass current organization ID
Handle creation errors gracefully
[COMPLETED]

.env
Update environment variables:

Change REACT_APP_* to VITE_* (Vite convention)
Keep existing Supabase URL and key
[COMPLETED]

.env.example
Document required environment variables for new developers.

[COMPLETED]

package.json
Add Supabase dependency:

"dependencies": {
    "@supabase/supabase-js": "^2.39.0"
}
Verification Plan
Database Verification via Supabase MCP
After applying all migrations, use Supabase MCP tools to verify:

Via: mcp2_list_tables(project_id)

 Verify all tables exist: organizations, org_members, org_invitations, tables, table_rows
Via: mcp2_execute_sql(project_id, "SELECT ...")

 Check RLS policies are enabled on all tables
 Verify indexes exist (use \d+ table_name in SQL editor)
 Test user_organizations() helper function
 Verify validation trigger is attached to table_rows
Via: mcp2_get_advisors(project_id, 'security')

 Check for security vulnerabilities
 Verify RLS policies are comprehensive
 Check for missing policies or gaps
Via: mcp2_get_advisors(project_id, 'performance')

 Verify indexes are properly utilized
 Check for N+1 query patterns
 Validate JSONB GIN index effectiveness
Manual Verification via Browser
All verification performed through http://localhost:5173

1. Authentication & Organization Setup
 Open application, verify redirect to sign-in page
 Click "Sign Up", create account with email/password and organization name
 Verify successful registration, auto-organization creation, and sign-in
 Verify dashboard loads with new organization
 Sign out and sign in again
 Verify session persists correctly
2. Token-Based Invitation System
 Navigate to organization settings
 Invite a user by email with "member" role
 Copy invitation link/token
 Open link in incognito window
 Verify invitation details display correctly
 Create new account and accept invitation
 Verify new user is added to organization as member
 Test with already-signed-in user accepting invite
 Verify role-based permissions (viewer can't edit, admin can invite)
3. Table Creation with Pure JSONB Schema
 Create table with 5+ columns of mixed types
 Add column with required: true flag
 Submit and verify table appears in dashboard
 Open table and verify all columns display correctly
 Check that column order matches definition order
4. Row Operations with JSONB Data
 Add empty row
 Fill in all column values
 Submit and verify data persists (refresh page)
 Edit multiple cells across different column types
 Verify edits persist correctly
5. Server-Side Validation Testing
 Try to create row with missing required field
 Verify error message appears with column name
 Try to insert text into number field
 Verify type validation error
 Fill all required fields correctly and verify success
6. Dynamic Column Management with JSONB
 Create table with 3 columns
 Add several rows of data
 Add 2 new columns to existing table
 Verify new columns appear in all rows (with empty values)
 Delete one column
 Verify column data is removed from all rows
 Reorder columns
 Verify display order updates without data loss
7. Real-time Collaboration
 Open same table in two browser windows (same user)
 Add row in window 1
 Verify row appears in window 2 without refresh
 Edit cell in window 2
 Verify change reflects in window 1
 Delete row in window 1
 Verify row disappears in window 2
8. Multi-Organization Testing
 Create second organization as same user
 Use organization switcher to switch between orgs
 Create table in org 2
 Verify table only appears when org 2 is selected
 Switch back to org 1
 Verify org 1 tables are shown, org 2 tables hidden
9. RLS Policy Verification
 Create user A, organization Alpha, table T1
 Add rows to T1
 Sign out and create user B
 Verify user B cannot see organization Alpha
 Verify user B cannot access table T1 (even with direct URL)
 Create organization Beta as user B
 Invite user A to organization Beta
 Sign in as user A, accept invitation
 Verify user A can see both Alpha (owner) and Beta (member)
 Verify member role limits (can't invite others in Beta)
10. Advanced Features Integration
 Test filtering on JSONB columns (text contains, number greater than)
 Test sorting on JSONB columns (ascending/descending)
 Test AI data generation (uses existing geminiService)
 Test data enrichment (uses existing geminiService)
 Verify all enrichment features work with JSONB storage
11. Performance & UX
 Create table with 100+ rows
 Verify GIN index enables fast filtering on JSONB data
 Test scroll performance with large datasets
 Verify pagination loads quickly
 Test optimistic updates (edits appear instantly, then sync)
Success Criteria
All manual tests must pass with:

✅ No console errors
✅ Data persists across page refreshes
✅ RLS policies enforce complete data isolation
✅ Server-side validation prevents invalid data
✅ Real-time updates work within 1-2 seconds
✅ Invitation flow works for both new and existing users
✅ All existing features (filters, sorts, AI) work with new backend
$$
