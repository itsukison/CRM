<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# BaseCRM Next

An AI-powered CRM designed to revolutionize how you manage and enrich company data. Built with modern web technologies and integrated with Google's Gemini AI.

## � App Overview

BaseCRM Next is a modern, AI-first Customer Relationship Management tool designed to streamline the process of building and managing company databases. Unlike traditional CRMs that require manual data entry, BaseCRM leverages Google's Gemini AI to:
1.  **Generate Data**: Create target lists from scratch using natural language prompts.
2.  **Enrich Data**: Automatically research and fill in missing company details like revenue, CEO, and headquarters.
3.  **Manage Data**: Provide a high-performance, Excel-like interface for organizing and editing data.

## 🗺️ Pages & Routing

### Public
- **`/` (Landing Page)**: Product showcase, features overview, and pricing.
- **`/signin` & `/signup`**: Authentication pages powered by Supabase.

### Onboarding
- **`/org-setup`**: Initial setup flow for creating a new organization after signup.

### Dashboard (Protected)
- **`/dashboard`**: The command center. View recent tables, activity, and quick stats.
- **`/dashboard/create`**: Create a new table. Options to start blank, import from Excel/CSV, or generate via AI.
- **`/dashboard/tables/[tableId]`**: The core **Table View**.
    - **Spreadsheet Interface**: High-performance grid with virtualization.
    - **AI Tools**: Access "Data Enrichment" and "AI Generation" panels.
    - **Column Management**: Add, edit, resize, and reorder columns.
    - **Row Actions**: Context menus for quick edits and organization.
- **`/dashboard/status-tracking`**: Kanban-style view to track deal stages and pipeline status.
- **`/dashboard/contact`**: Support and contact form.

## 🚀 Key Features

### 🧠 AI-Powered Intelligence
- **Data Enrichment**: Select specific columns (e.g., "CEO", "Revenue") and let Gemini AI research and fill them for selected rows.
- **AI Data Generation**: Generate entire lists of companies based on prompts like "Top 50 AI startups in San Francisco".

### 📊 Advanced Table Interface
- **Excel-like Experience**:
    - **Keyboard Navigation**: Arrow keys, Enter to edit, Tab to move.
    - **Selection**: Shift+Click for multi-row selection, Drag for cell ranges.
    - **Visuals**: "Excel-style" outer border highlighting for selected groups.
- **Smart Columns**: Support for Text, Number, Tag, URL, Date, and Email types.
- **Data Import**: Drag-and-drop import for `.xlsx` and `.csv` files.

### 🛡️ Secure & Scalable
- **Authentication**: Secure user management via Supabase Auth.
- **Real-time Database**: Powered by Supabase (PostgreSQL).

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Primitives**: [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend / DB**: [Supabase](https://supabase.com/)
- **AI Model**: [Google Gemini](https://deepmind.google/technologies/gemini/) (`@google/genai`)
- **Utilities**: `dnd-kit` (Drag & Drop), `xlsx` (Spreadsheet processing), `sonner` (Toasts)

## 🔄 User Flow

1.  **Landing Page**: Discover the platform's capabilities and sign up/login.
2.  **Dashboard**: Access your workspace and manage multiple tables.
3.  **Table Creation**:
    - Start from scratch.
    - Import existing data.
    - Generate a new dataset using AI.
4.  **Data Management**:
    - Edit cells inline.
    - Sort and filter to organize data.
    - Use "Data Enrichment" to fill gaps.
    - Export data or send emails directly from the interface.

## 🏃‍♂️ Run Locally

**Prerequisites:** Node.js 18+

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Setup:**
    Create a `.env.local` file with your keys:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
    GEMINI_API_KEY=your_gemini_key
    ```

3.  **Run the app:**
    ```bash
    npm run dev
    ```
