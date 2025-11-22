# Database Schema Documentation

## Overview
BaseCRM uses Supabase PostgreSQL with pure JSONB storage for maximum flexibility in dynamic table structures.

## Tables

### `organizations`
- **Purpose**: Multi-tenant workspaces
- **Columns**:
  - `id` (UUID, PK): Organization identifier
  - `name` (TEXT): Organization name
  - `description` (TEXT, nullable): Organization description
  - `owner_id` (UUID, FK → auth.users): Owner user ID
  - `created_at`, `updated_at` (TIMESTAMPTZ): Timestamps

### `org_members`
- **Purpose**: Organization membership and roles
- **Columns**:
  - `org_id` (UUID, FK → organizations, PK): Organization ID
  - `user_id` (UUID, FK → auth.users, PK): User ID
  - `role` (TEXT): 'owner' | 'admin' | 'member' | 'viewer'
  - `joined_at` (TIMESTAMPTZ): Join timestamp

### `org_invitations`
- **Purpose**: Token-based organization invitations
- **Columns**:
  - `id` (UUID, PK): Invitation ID
  - `org_id` (UUID, FK → organizations): Target organization
  - `email` (TEXT): Invited email
  - `role` (TEXT): Invited role
  - `token` (TEXT, UNIQUE): Random invitation token
  - `invited_by` (UUID, FK → auth.users): Inviter user ID
  - `expires_at` (TIMESTAMPTZ): Expiration (default: 7 days)
  - `created_at`, `accepted_at` (TIMESTAMPTZ): Timestamps

### `tables`
- **Purpose**: Dynamic table metadata with JSONB column definitions
- **Columns**:
  - `id` (UUID, PK): Table identifier
  - `org_id` (UUID, FK → organizations): Organization ID
  - `name` (TEXT): Table name
  - `description` (TEXT, nullable): Table description
  - `columns` (JSONB): Column definitions array
  - `created_at`, `updated_at` (TIMESTAMPTZ): Timestamps

**Column Definition Structure** (JSONB):
```typescript
[
  {
    id: string,          // Unique column ID
    name: string,        // Column display name
    type: 'text' | 'number' | 'url' | 'email' | 'date' | 'tag',
    required: boolean,   // Is this field required?
    order: number,       // Display order
    description: string, // Optional description
    textOverflow: 'wrap' | 'clip' | 'visible' // Display mode
  }
]
```

### `table_rows`
- **Purpose**: Row data storage with pure JSONB
- **Columns**:
  - `id` (UUID, PK): Row identifier  
  - `table_id` (UUID, FK → tables): Parent table ID
  - `data` (JSONB): Row data as key-value pairs
  - `created_at`, `updated_at` (TIMESTAMPTZ): Timestamps

**Data Structure** (JSONB):
```typescript
{
  "column_id_1": "value1",
  "column_id_2": 42,
  "column_id_3": "https://example.com",
  ...
}
```

## Functions

### `user_organizations(user_uuid UUID) RETURNS SETOF UUID`
- **Purpose**: Performance-optimized RLS helper
- **Returns**: Set of organization IDs the user is a member of
- **Security**: SECURITY DEFINER for efficient caching

### `validate_row_data() RETURNS TRIGGER`
- **Purpose**: Server-side validation of row data against table schema
- **Validates**:
  - Required fields are present
  - Data types match column definitions
  - Values are properly formatted

### `update_updated_at() RETURNS TRIGGER`
- **Purpose**: Auto-update `updated_at` timestamps
- **Applied to**: organizations, tables, table_rows

## Row Level Security (RLS)

All tables have RLS enabled with optimized policies using the `user_organizations()` helper function.

### Organizations
- **SELECT**: Users can view orgs they're members of
- **INSERT**: Users can create orgs (become owner)
- **UPDATE**: Members can update their orgs
- **DELETE**: Only owners can delete orgs

### Org Members
- **SELECT**: Users see their own memberships + members of their orgs
- **INSERT/UPDATE/DELETE**: Admins and owners can manage members

### Org Invitations
- **SELECT**: Org members can view invitations
- **INSERT/DELETE**: Admins and owners can create/revoke invitations

### Tables
- **ALL**: Users can perform all operations on tables in their organizations

### Table Rows
- **ALL**: Users can perform all operations on rows in their org's tables (via table → org relationship)

## Indexes

Performance indexes for common queries:
- `idx_org_members_user_id`: Fast user → orgs lookup
- `idx_org_members_org_id`: Fast org → members lookup
- `idx_org_invitations_token`: Fast token validation
- `idx_org_invitations_email`: Fast email lookup
- `idx_tables_org_id`: Fast org → tables lookup
- `idx_table_rows_table_id`: Fast table → rows lookup
- `idx_table_rows_data` (GIN): Fast JSONB queries
- `idx_table_rows_table_created`: Sorted row retrieval

## Migrations Applied

1. `create_organizations_and_members`: Core multi-tenant structure
2. `create_org_invitations`: Token-based invitation system
3. `create_tables_metadata`: Dynamic table definitions
4. `create_table_rows_jsonb`: Pure JSONB row storage
5. `create_validation_trigger`: Server-side validation

## Key Design Decisions

1. **Pure JSONB Storage**: All row data stored as JSONB for maximum flexibility without schema migrations
2. **GIN Indexing**: JSONB columns use GIN indexes for efficient queries
3. **Optimized RLS**: Helper function `user_organizations()` reduces nested subqueries
4. **Server-Side Validation**: Postgres trigger validates data before insertion
5. **Token-Based Invites**: Secure invitation system supporting both new and existing users
