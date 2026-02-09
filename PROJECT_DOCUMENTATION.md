# AI CodeMate - Project Documentation

> Browser-Native AI Development Environment

---

## 📋 Table of Contents

1. [Tech Stack Overview](#tech-stack-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Project Structure](#project-structure)
4. [Core Features](#core-features)
5. [Component Reference](#component-reference)
6. [Hooks Reference](#hooks-reference)
7. [Database Schema](#database-schema)
8. [API Routes](#api-routes)
9. [Authentication Flow](#authentication-flow)
10. [Future Roadmap](#future-roadmap)

---

## Tech Stack Overview

### Frontend

| Technology        | Version | Purpose                         |
| ----------------- | ------- | ------------------------------- |
| **Next.js**       | 14.2.3  | React framework with App Router |
| **React**         | 18.3.1  | UI library                      |
| **TypeScript**    | 5.4.5   | Type safety                     |
| **Tailwind CSS**  | 3.4.3   | Utility-first styling           |
| **Monaco Editor** | 4.6.0   | VS Code-like code editor        |

### Backend

| Technology       | Version | Purpose                       |
| ---------------- | ------- | ----------------------------- |
| **Supabase**     | 2.89.0  | PostgreSQL database + Auth    |
| **Supabase SSR** | 0.8.0   | Server-side rendering support |
| **bcryptjs**     | 3.0.3   | Password hashing              |
| **Zod**          | 4.2.1   | Schema validation             |

### Developer Experience

| Technology           | Purpose                    |
| -------------------- | -------------------------- |
| **ESLint**           | Code linting               |
| **Tailwind Plugins** | Forms, Typography, Animate |
| **Lucide React**     | Icon library               |
| **Sonner**           | Toast notifications        |

---

## Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        A[Next.js App Router] --> B[Editor Page]
        A --> C[Auth Pages]
        A --> D[Landing Page]
    end

    subgraph "Component Layer"
        B --> E[EditorHeader]
        B --> F[EditorSidebar]
        B --> G[EditorPane - Monaco]
        B --> H[PreviewPane - iframe]
        B --> I[TerminalPane - AI Commands]
        B --> J[RightSidebar - AI Assistant]
        B --> K[EditorFooter]
    end

    subgraph "State Management - React Context"
        L[useAuth] --> M[AuthProvider]
        N[useRepository] --> O[RepositoryProvider]
        P[useDiagnostics] --> Q[DiagnosticsProvider]
        R[useAICommands] --> S[AICommandsProvider]
        T[useActivityLog] --> U[ActivityLogProvider]
        V[usePreview] --> G
    end

    subgraph "External Services"
        W[Supabase Auth]
        X[Supabase Database]
        Y[GitHub API]
    end

    M --> W
    O --> Y
    B --> X
```

---

## Data Flow Diagram

```mermaid
flowchart LR
    subgraph "User Actions"
        U1[Select File] --> R1[Repository Hook]
        U2[Edit Code] --> E1[Editor Pane]
        U3[AI Command] --> A1[AI Commands Hook]
    end

    subgraph "Processing"
        R1 --> |Fetch| GH[GitHub API]
        E1 --> |Validate| D1[Diagnostics Hook]
        E1 --> |Transform| P1[Preview Hook]
        A1 --> |Process| AI[AI Backend]
    end

    subgraph "Output"
        GH --> FM[File Manager]
        D1 --> FT[Footer Stats]
        P1 --> PV[Live Preview]
        AI --> RP[AI Response]
    end
```

---

## Project Structure

```
ai-codemate/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API routes
│   │   │   └── auth/             # Auth endpoints
│   │   ├── editor/               # Main editor page
│   │   │   └── page.tsx          # Editor entry point
│   │   ├── login/                # Login page
│   │   ├── signup/               # Signup page
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Home/redirect
│   │   ├── providers.tsx         # Global providers
│   │   └── globals.css           # Global styles
│   │
│   ├── components/
│   │   ├── editor/               # Editor components
│   │   │   ├── EditorHeader.tsx  # Top toolbar
│   │   │   ├── EditorSidebar.tsx # File explorer
│   │   │   ├── EditorPane.tsx    # Monaco editor
│   │   │   ├── PreviewPane.tsx   # Live preview
│   │   │   ├── PreviewError.tsx  # Preview errors
│   │   │   ├── TerminalPane.tsx  # AI commands
│   │   │   ├── RightSidebar.tsx  # AI Assistant
│   │   │   ├── EditorFooter.tsx  # Status bar
│   │   │   ├── LandingPage.tsx   # Repo selector
│   │   │   └── GitHubRepoModal.tsx
│   │   ├── marketing/            # Landing page components
│   │   └── ui/                   # Shared UI components
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.tsx           # Authentication
│   │   ├── useRepository.tsx     # GitHub repo state
│   │   ├── useDiagnostics.tsx    # Code diagnostics
│   │   ├── useAICommands.tsx     # AI command interface
│   │   ├── useActivityLog.tsx    # User activity tracking
│   │   ├── usePreview.tsx        # Live preview logic
│   │   └── useTerminal.tsx       # Terminal emulation
│   │
│   ├── lib/                      # Utilities & configs
│   │   ├── supabase.ts           # Client-side Supabase
│   │   ├── supabase-server.ts    # Server-side Supabase
│   │   ├── auth.ts               # Auth utilities
│   │   ├── github.ts             # GitHub API helpers
│   │   └── utils.ts              # General utilities
│   │
│   ├── middleware.ts             # Route protection
│   ├── types/                    # TypeScript types
│   └── utils/                    # Utility functions
│       └── validators.ts         # Code validators
│
├── supabase-setup.sql            # Database schema
├── tailwind.config.ts            # Tailwind configuration
├── package.json                  # Dependencies
└── tsconfig.json                 # TypeScript config
```

---

## Core Features

### 1. Code Editor (Monaco)

- Syntax highlighting for 50+ languages
- IntelliSense & auto-completion
- Real-time error detection
- Multiple file tabs

### 2. Live Preview System

| File Type | Preview Method          |
| --------- | ----------------------- |
| HTML      | Direct iframe render    |
| CSS       | Styled sample elements  |
| JSON      | Syntax-highlighted tree |
| Markdown  | MD → HTML conversion    |
| SVG       | Direct render           |

**Features:**

- Device simulation (Mobile/Tablet/Desktop)
- Zoom controls (25% - 200%)
- Error overlay with retry
- Auto-refresh on save

### 3. AI Commands Interface

Quick command bar for AI-assisted coding:

| Command     | Action                   |
| ----------- | ------------------------ |
| `help`      | Show available commands  |
| `explain`   | Explain selected code    |
| `refactor`  | Suggest refactoring      |
| `optimize`  | Performance improvements |
| `document`  | Generate documentation   |
| `find bugs` | Detect potential issues  |

### 4. Diagnostics System

- Real-time error/warning counts
- Monaco integration for JS/TS
- Custom validators for Python
- Footer status display

### 5. Collapsible Bottom Panel

- AI Commands tab
- Recent Activity tab
- Click-to-expand from collapsed state
- Smooth animations

---

## Component Reference

### Editor Components

| Component         | Size | Purpose                    |
| ----------------- | ---- | -------------------------- |
| EditorHeader.tsx  | 16KB | Top toolbar with file tabs |
| EditorSidebar.tsx | 6KB  | File tree explorer         |
| EditorPane.tsx    | 9KB  | Monaco editor wrapper      |
| PreviewPane.tsx   | 12KB | Live preview with iframe   |
| TerminalPane.tsx  | 10KB | AI commands & activity     |
| RightSidebar.tsx  | 18KB | AI Assistant panel         |
| EditorFooter.tsx  | 4KB  | Status bar                 |

---

## Hooks Reference

### State Management Hooks

```mermaid
graph LR
    A[useAuth] -->|User State| B[Global]
    C[useRepository] -->|File State| D[Editor]
    E[useDiagnostics] -->|Error State| D
    F[useAICommands] -->|AI State| G[Bottom Panel]
    H[useActivityLog] -->|Activity State| G
    I[usePreview] -->|Preview State| J[Preview Pane]
```

| Hook             | Purpose                | Key Functions                        |
| ---------------- | ---------------------- | ------------------------------------ |
| `useAuth`        | Authentication state   | `signIn`, `signUp`, `signOut`        |
| `useRepository`  | GitHub repo management | `loadRepository`, `selectFile`       |
| `useDiagnostics` | Code error tracking    | `setDiagnostics`, `clearDiagnostics` |
| `useAICommands`  | AI command interface   | `executeCommand`, `navigateHistory`  |
| `useActivityLog` | User activity          | `logActivity`, `getRecentActivities` |
| `usePreview`     | Live preview           | `refresh`, `status`, `error`         |

---

## Database Schema

```mermaid
erDiagram
    profiles ||--o{ projects : owns
    profiles ||--o{ ai_conversations : has
    profiles ||--o{ activity_logs : generates
    projects ||--o{ ai_conversations : contains
    ai_conversations ||--o{ ai_messages : contains

    profiles {
        uuid id PK
        string email
        string full_name
        string avatar_url
        timestamp created_at
    }

    projects {
        uuid id PK
        uuid user_id FK
        string name
        string github_url
        jsonb settings
    }

    ai_conversations {
        uuid id PK
        uuid user_id FK
        uuid project_id FK
        string title
        timestamp created_at
    }

    ai_messages {
        uuid id PK
        uuid conversation_id FK
        string role
        text content
        timestamp created_at
    }

    activity_logs {
        uuid id PK
        uuid user_id FK
        string action_type
        jsonb metadata
        timestamp created_at
    }
```

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant A as App
    participant S as Supabase
    participant G as GitHub

    U->>A: Click "Sign in with GitHub"
    A->>S: signInWithOAuth('github')
    S->>G: Redirect to OAuth
    G->>U: Authorize AI CodeMate?
    U->>G: Approve
    G->>S: Auth callback with code
    S->>S: Create/update user
    S->>A: Return session + token
    A->>U: Redirect to /editor

    Note over A,S: Token stored in cookies

    U->>A: Request protected route
    A->>S: Validate session
    S->>A: Session valid
    A->>U: Show editor
```

---

## API Routes

| Route                | Method | Purpose                |
| -------------------- | ------ | ---------------------- |
| `/api/auth/callback` | GET    | OAuth callback handler |
| `/api/auth/signout`  | POST   | Sign out user          |

---

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx

# GitHub OAuth (via Supabase)
# Configured in Supabase Dashboard

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Future Roadmap

### Phase 1: AI Integration

- [ ] Connect AI Commands to real LLM API
- [ ] Stream responses in real-time
- [ ] Code generation from prompts

### Phase 2: Collaboration

- [ ] Real-time multi-user editing
- [ ] Cursor presence
- [ ] Chat integration

### Phase 3: Deployment

- [ ] One-click deploy to Vercel/Netlify
- [ ] Environment management
- [ ] CI/CD integration

### Phase 4: Extensions

- [ ] Plugin system
- [ ] Theme marketplace
- [ ] Custom keybindings

---

## Quick Start

```bash
# Clone
git clone <repo-url>
cd ai-codemate

# Install
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run database migrations
# Execute supabase-setup.sql in Supabase SQL Editor

# Start development
npm run dev

# Open http://localhost:3000
```

---

## Build & Deploy

```bash
# Production build
npm run build

# Start production server
npm start

# Or deploy to Vercel
vercel --prod
```

---

_Last Updated: January 2026_
