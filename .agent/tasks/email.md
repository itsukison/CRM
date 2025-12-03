You just implemented this feature where user can create an AI generated table from the @CRM/app/dashboard  page, with some default columns. However, there are a couple columns that are not generating ideail results.
1) It should follow the data generation flow from @tool

AI Email Agent Feature
Phase 1: Database Schema (Supabase MCP)
Create three new tables via Supabase MCP:

email_templates

id, org_id, name, subject, body, variables (JSONB array), created_at, updated_at
email_activity

id, org_id, user_id, template_id, recipient_email, status (success/error), error_message, sent_at
gmail_connections

id, user_id, email, access_token (encrypted), refresh_token (encrypted), expires_at, created_at
Phase 2: Contact Page Structure
Create src/features/contact/ with:

ContactPage.tsx - Main page with tab navigation (Templates / Activity)

Clean terminal aesthetic following styling.md
Sharp edges (2-4px radius), grayscale + blue accents
JetBrains Mono for data display
Templates Tab Components:

TemplateList.tsx - Grid of template cards with name, subject preview
TemplateEditor.tsx - Modal for create/edit with:
Template name input
Subject field with variable insertion
Body textarea (rich text optional, start simple)
Variable manager: display detected {variable} patterns + custom variable input
Save/Cancel actions
Activity Tab Components:

ActivityTable.tsx - Sortable table showing email history
Columns: Recipient, Template, Status (color-coded), Timestamp
Status badges: Green (#66C800) for success, Red (#FC401F) for error
Phase 3: Gmail OAuth Integration
API Routes (app/api/gmail/):

auth/route.ts - Initiates OAuth flow, redirects to Google
callback/route.ts - Handles OAuth callback, stores tokens in Supabase
send/route.ts - Sends email via Gmail API with token refresh logic
status/route.ts - Returns connection status for current user
Services (src/services/email/):

gmail.service.ts - Token management, Gmail API wrapper
email-template.service.ts - CRUD for templates
email-activity.service.ts - Logging and retrieval
Security:

Encrypt tokens before storing in Supabase
Automatic token refresh on expiry
Scoped to gmail.send only
Phase 4: Table Page Email Integration
Context Menu (add to TableCell.tsx):

onContextMenu handler for right-click/two-finger tap
Show "Send Email" option when cell column is email type or name contains "email"/"mail"
Multi-Select Support (modify TableToolbar.tsx):

Add "Send Email" button that appears when email cells are selected
Icon: Mail envelope (add to Icons.tsx)
Row Checkbox Selection:

When rows selected via checkbox, enable "Send Email" in toolbar
Auto-detect email column from selection
Phase 5: Send Email Modal
SendEmailModal.tsx - Core modal component:

Provider Section
Show "Connected as: user@gmail.com" if connected
"Connect Gmail" button if not (triggers OAuth)
Connection status indicator (green dot)
Template Selection
Dropdown of available templates
Preview of selected template
Email Column Detection
Auto-detect by column type "mail" or name pattern
If multiple candidates, show selector
Variable Mapping UI
List all {variables} from template
Dropdown to map each to a table column
Real-time preview for first selected row
Recipients Preview
Show count: "Sending to X recipients"
Expandable list of emails
Actions
"Send" button (Blue #0000FF - primary action)
"Cancel" button (grayscale)
Validation:

All rows must have valid email
All template variables must be mapped
Phase 6: Email Sending Logic
Bulk Send Handler:

Process emails sequentially with rate limiting
Show progress indicator (terminal-style: [████░░░░░░] 4/10)
Log each send to email_activity
Handle errors gracefully, continue batch
Post-Send:

Toast notification with summary
Auto-refresh Activity tab if open
Key Files to Create/Modify
New Files:

app/dashboard/contact/page.tsx
src/features/contact/ContactPage.tsx
src/features/contact/components/TemplateList.tsx
src/features/contact/components/TemplateEditor.tsx
src/features/contact/components/ActivityTable.tsx
src/features/contact/components/SendEmailModal.tsx
src/features/contact/hooks/useTemplates.ts
src/features/contact/hooks/useEmailActivity.ts
src/features/contact/hooks/useGmailConnection.ts
src/services/email/gmail.service.ts
src/services/email/template.service.ts
src/services/email/activity.service.ts
app/api/gmail/auth/route.ts
app/api/gmail/callback/route.ts
app/api/gmail/send/route.ts
app/api/gmail/status/route.ts
Modify:

components/Sidebar.tsx - Add Contact nav item with mail icon
components/Icons.tsx - Add IconMail, IconSend
components/table/ui/TableCell.tsx - Add context menu
components/table/ui/TableToolbar.tsx - Add Send Email button
types/database.types.ts - Add new table types
Styling Guidelines (from styling.md)
Colors: Grayscale foundation + Blue (#0000FF) for primary actions only
Typography: Inter for UI, JetBrains Mono for data/emails
Borders: Sharp edges, 2-4px radius max, #DEE1E7 border color
Status Colors: Green #66C800 (success), Red #FC401F (error)
No gradients: Solid colors only
Terminal aesthetic: Monospace progress indicators, blocky layouts