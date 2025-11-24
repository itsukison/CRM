# BaseCRM-Next Architecture

*Last Updated: 2025-11-24*  
*Version: 1.0 (Post-Refactoring)*

## Overview

BaseCRM-Next is an AI-powered CRM with spreadsheet-like table management, built on Next.js and Supabase. The application provides dynamic table creation, AI data generation, contact enrichment, and natural language chat interface for data manipulation.

---

## Tech Stack

### Frontend
- **Framework**: Next.js 16.0.3 (Turbopack, App Router)
- **Language**: TypeScript (strict mode)
- **UI**: React 18+ with shadcn/ui primitives
- **Styling**: Vanilla CSS
- **State**: React Context (AuthContext, TablesContext)

### Backend
- **Database**: Supabase (PostgreSQL + Auth + Realtime)
- **Schema**: JSONB for dynamic table columns
- **Auth**: Supabase Auth (email/password)
- **Real-time**: Supabase Realtime subscriptions

### AI & Services
- **AI**: Google Gemini (`gemini-3-pro-preview`, `gemini-2.5-flash`)
- **Data Import**: XLSX.js (Excel/CSV)
- **Search**: Fuse.js (fuzzy matching)
- **Notifications**: Sonner (toast)

---

## Architecture

### Directory Structure

```
basecrm-next/
├── app/                          # Next.js App Router (routes)
│   ├── dashboard/               # Dashboard + table routes
│   ├── signin/, signup/         # Auth pages
│   └── org-setup/               # Organization setup
│
├── src/                         # Source code (organized by layer)
│   ├── core/                   # Domain models & utilities (no dependencies)
│   │   ├── models/            # TypeScript types & interfaces
│   │   └── utils/             # Pure utility functions
│   │
│   ├── services/               # Business logic orchestration
│   │   ├── auth/              # Authentication service
│   │   ├── table/             # Table & row services
│   │   ├── organization/      # Org & invitation services
│   │   └── ai/               # AI enrichment service
│   │
│   ├── adapters/              # External system integrations
│   │   ├── database/         # Supabase client & realtime
│   │   ├── ai/               # Gemini AI client
│   │   └── external/         # Company data scraping
│   │
│   ├── features/              # Feature modules (UI + logic)
│   │   ├── landing/          # Landing page
│   │   ├── dashboard/        # Dashboard page
│   │   ├── table/            # Table spreadsheet view
│   │   │   ├── components/
│   │   │   │   ├── TableAI/       # AI generation & enrichment
│   │   │   │   └── TableImport/   # Excel/CSV import
│   │   │   └── TablePage.tsx
│   │   └── graphics/         # 3D graphics components
│   │
│   └── ui/                    # Shared UI components
│       ├── primitives/       # shadcn/ui components
│       └── icons/           # Icon components
│
├── components/                # Legacy components (gradually migrating)
│   ├── auth/                 # Auth UI components
│   ├── org/                  # Organization UI
│   ├── ChatWidget.tsx        # AI chat widget
│   ├── TableView.tsx         # Main table grid (2245 lines)
│   └── ...
│
├── contexts/                  # React contexts
│   ├── AuthContext.tsx       # Auth & org state
│   └── TablesContext.tsx     # Tables list state
│
├── services/                  # Legacy services (being migrated to src/services/)
├── config/                    # App configuration & constants
├── types/                     # Generated database types
└── lib/                       # Utilities

```

### Path Aliases (tsconfig.json)

```typescript
@/*          → ./              // Root
@/types      → ./src/core/models
@/core/*     → ./src/core/*
@/services/* → ./services/*    // Legacy location
@/adapters/* → ./src/adapters/*
@/features/* → ./src/features/*
@/ui/*       → ./src/ui/*
@/config/*   → ./config/*
```

---

## Database Schema

### Core Tables

#### `organizations`
Multi-tenant workspaces with owner

```sql
id          UUID PRIMARY KEY
name        TEXT NOT NULL
description TEXT
owner_id    UUID REFERENCES auth.users
created_at  TIMESTAMPTZ
updated_at  TIMESTAMPTZ
```

#### `org_members`
Organization membership with roles

```sql
org_id     UUID REFERENCES organizations
user_id    UUID REFERENCES auth.users
role       TEXT CHECK (role IN ('owner','admin','member','viewer'))
joined_at  TIMESTAMPTZ
PRIMARY KEY (org_id, user_id)
```

#### `invitations`
Organization invite tokens (7-day expiry)

```sql
id           UUID PRIMARY KEY
org_id       UUID REFERENCES organizations
email        TEXT NOT NULL
role         TEXT
token        TEXT UNIQUE
created_by   UUID REFERENCES auth.users
expires_at   TIMESTAMPTZ
accepted_at  TIMESTAMPTZ
```

#### `tables`
Dynamic table definitions with JSONB schema

```sql
id          UUID PRIMARY KEY
org_id      UUID REFERENCES organizations
name        TEXT NOT NULL
description TEXT
columns     JSONB NOT NULL  -- Array of ColumnDefinition
created_at  TIMESTAMPTZ
updated_at  TIMESTAMPTZ
```

**Column Schema (JSONB)**:
```typescript
{
  id: string                // Unique column ID
  name: string             // Column display name
  type: 'text' | 'number' | 'url' | 'email' | 'date' | 'tag'
  required: boolean
  order: number           // Display order
  description?: string
  textOverflow?: 'wrap' | 'clip' | 'visible'  // Default: 'clip'
}
```

#### `table_rows`
Row data stored as pure JSONB

```sql
id         UUID PRIMARY KEY
table_id   UUID REFERENCES tables
data       JSONB NOT NULL  -- Dynamic key-value pairs
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

**Data Format**:
```typescript
{
  "col_abc123": "Company Name",
  "col_def456": 42,
  "col_ghi789": "https://example.com"
}
```

### Security (Row-Level Security)

All tables have RLS policies:
- **Organizations**: Members can read, owners can delete
- **Tables**: Org members can CRUD
- **Rows**: Inherited via table → org relationship
- Optimized with `user_organizations()` helper function

---

## Key Features

### 1. Authentication & Organizations

**Flow**: Email/password → Supabase Auth → AuthContext → Protected routes

**Features**:
- Multi-tenant organizations
- Role-based access (owner, admin, member, viewer)
- Token-based invitations (7-day expiry)
- Organization switching
- RLS-enforced data isolation

### 2. Dynamic Tables

**Flow**: Create table → Define columns (JSONB) → Add rows → Real-time sync

**Features**:
- **Excel-like Interface**: Spreadsheet grid with 50 default rows, 10 default columns (A-J)
- **Dynamic Schema**: Column definitions stored as JSONB (no schema migrations)
- **Column Types**: text, number, url, email, date, tag
- **Formula Support**: Client-side evaluation (e.g., `=A1+B1`)
- **Import/Export**: Excel (.xlsx) and CSV support with fuzzy column matching
- **Filtering**: Multi-column filters with AND/OR logic
- **Sorting**: Multi-level sorting
- **Selection**: Single cell, range (Shift+click), row selection
- **Text Overflow**: wrap, clip (default), visible modes
- **Real-time**: Supabase subscriptions for live updates

### 3. AI Features

#### 3.1 AI Data Generation
**Model**: `gemini-3-pro-preview` with `thinking_level: 'low'`

**Flow**: User prompt → Gemini → Generated rows → Preview → Insert

**Features**:
- Generate multiple rows from natural language prompt
- Column selection for targeted generation
- Preview before committing
- Context-aware generation

#### 3.2 Contact Enrichment
**Model**: `gemini-2.5-flash` (faster, cheaper)

**Flow**: Company name → Web scraping → Gemini extraction → Cell data

**Features**:
- Multi-phase enrichment (discovery, extraction, financial)
- Batch processing for selected rows
- Progress tracking with phase indicators
- Fields: CEO name, email, description, employees, funding

#### 3.3 AI Chat Agent
**Model**: `gemini-3-pro-preview`

**Flow**: Natural language → Intent analysis → Tool execution → Response

**Capabilities**:
- Filter data by criteria
- Sort columns
- Calculate aggregates (max, min, mean, sum, count)
- Trigger enrichment
- Generate new rows

**Modes**:
- **Ask**: Read-only queries
- **Agent**: Can modify data

### 4. Real-time Sync

**Service**: `src/adapters/database/realtime.adapter.ts`

**Flow**: Supabase channel → INSERT/UPDATE/DELETE events → State updates

**Features**:
- Live table row updates across clients
- Organization updates
- Table metadata changes

---

## Data Flow

### Layered Architecture

```
┌─────────────────────────────────────┐
│  UI Layer (React Components)        │
│  - Features, Pages, Components      │
└──────────────┬──────────────────────┘
               │ Props & Callbacks
┌──────────────▼──────────────────────┐
│  Services Layer (Business Logic)    │
│  - Validation, Orchestration        │
└──────────────┬──────────────────────┘
               │ Data Transfer Objects
┌──────────────▼──────────────────────┐
│  Adapters Layer (External Systems)  │
│  - Supabase, Gemini, Web Scraping   │
└──────────────┬──────────────────────┘
               │ Raw API Responses
┌──────────────▼──────────────────────┐
│  Core Layer (Domain Models)         │
│  - Types, Utilities, Validation     │
└─────────────────────────────────────┘
```

**Dependency Rule**: One-way flow (top → down), no reverse dependencies

---

## State Management

### React Contexts

#### AuthContext
```typescript
{
  user: User | null
  org: Organization | null
  orgs: Organization[]
  loading: boolean
  signIn: (email, password) => Promise<void>
  signUp: (email, password) => Promise<void>
  signOut: () => Promise<void>
  switchOrganization: (orgId: string) => Promise<void>
}
```

#### TablesContext
```typescript
{
  tables: TableData[]
  loading: boolean
  createTable: (data) => Promise<TableData>
  deleteTable: (id) => Promise<void>
  refreshTables: () => Promise<void>
}
```

### Local State Patterns

- **Table State**: `useState<TableData>` in TablePage, syncs to Supabase on changes
- **Selection**: `Set<string>` for rowIds and cellIds
- **Filters/Sorts**: Array state passed to TableView
- **Chat History**: Array of messages in ChatWidget

---

## API Integration

### Supabase Client

**Location**: `src/adapters/database/supabase.client.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
)
```

### Gemini AI Client

**Location**: `src/adapters/ai/gemini.client.ts`

```typescript
import { GoogleGenAI } from "@google/genai"

const client = new GoogleGenAI(process.env.NEXT_PUBLIC_GOOGLE_GENAI_API_KEY!)
const model = client.getGenerativeModel({
  model: "gemini-3-pro-preview",
  generationConfig: { thinking_level: "low" }
})
```

---

## Development Rules

### Code Organization
- **Max file size**: 300 lines (soft limit)
- **Max functions per file**: 8
- **Single responsibility**: One purpose per file/module
- **Feature-based folders**: Group by domain, not by type

### Naming Conventions
- **Files**: `kebab-case.ts` or `PascalCase.tsx` (components)
- **Components**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `SCREAMING_SNAKE_CASE`
- **Types/Interfaces**: `PascalCase`

### Import Order
1. React, Next.js
2. External libraries
3. Internal services/adapters
4. Internal components
5. Types
6. Constants

### TypeScript Rules
- Strict mode enabled
- Avoid `any` (use `unknown` if needed)
- Explicit return types for exported functions
- Use object destructuring

---

## Environment Variables

### Required

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# Google Gemini AI
NEXT_PUBLIC_GOOGLE_GENAI_API_KEY=AIzaSyxxx...
```

---

## Build & Deployment

### Development
```bash
npm install
npm run dev  # http://localhost:3000
```

### Production
```bash
npm run build
npm start
```

### Database

**Local**:
```bash
supabase start
supabase db reset
```

**Production**: Migrations via Supabase dashboard

---

## Known Issues

### Critical
1. **TableView.tsx is 2,245 lines** - violates single responsibility, hard to maintain
2. **No error boundaries** - crashes propagate to root
3. **Type safety gaps** - JSONB data uses `any`

### Medium
4. **No test coverage** - zero test files
5. **Performance** - no virtualization for large datasets (1000+ rows)
6. **Formula security** - client-side eval is injection risk

### Low
7. **Missing documentation** - JSDoc needed for complex functions
8. **Accessibility** - keyboard navigation incomplete

---

## Security

### Implemented ✅
- Supabase Auth with JWT
- Row-Level Security (RLS) on all tables
- Role-based access control
- Environment variable secrets
- API rate limiting (via Supabase)

### Missing ⚠️
- Input sanitization (XSS risk in AI content)
- CSRF protection
- Rate limiting on Gemini API (cost risk)
- Formula validation (injection risk)

---

## Performance Considerations

### Current Bottlenecks
1. **Full grid re-renders** on any cell change
2. **No virtualization** - all rows rendered (50+ by default)
3. **Sequential AI processing** - one row at a time

### Optimization Opportunities
- Virtual scrolling (react-window/tanstack-virtual)
- Memoization (React.memo, useMemo)
- Debounced filter/sort
- Optimistic UI updates
- Batch AI requests

---

## Future Enhancements

### Short-term
- [ ] Add unit tests (Vitest + React Testing Library)
- [ ] Implement virtual scrolling for tables
- [ ] Add Zod validation for runtime type safety
- [ ] Create error boundaries

### Medium-term
- [ ] Extract TableView into smaller components
- [ ] Add E2E tests (Playwright)
- [ ] Implement WebSocket for collaborative editing
- [ ] Add mobile responsive design

### Long-term
- [ ] Advanced AI features (forecasting, insights)
- [ ] Plugin system for extensibility
- [ ] White-label customization
- [ ] API for integrations

---

## Resources

### Documentation
- `.agent/tasks/PROJECT_RESTRUCTURE.md` - Refactoring history (Phases 1-7 complete)
- `.agent/system/DATABASE_SCHEMA.md` - Full database schema
- `.agent/rule.md` - Architecture principles

### External
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Gemini API](https://ai.google.dev/docs)
- [shadcn/ui](https://ui.shadcn.com)

---

## Changelog

### 2025-11-24 (v1.0)
- ✅ Completed Phases 1-7 restructuring
- ✅ Organized services into domain folders
- ✅ Extracted UI primitives to `src/ui/primitives/`
- ✅ Created feature modules (`src/features/`)
- ✅ Added path aliases for clean imports
- ✅ Removed all backwards-compatible re-exports
- ✅ Fixed table rendering issues (className template literals)
- ✅ Fixed cell selection (ID format mismatch)

### 2025-11-23
- Initial architecture documentation
- Identified refactoring needs

---

**Maintained By**: Development Team  
**Review Frequency**: After major features or refactoring  
**Last Reviewed**: 2025-11-24
