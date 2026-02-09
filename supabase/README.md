# Supabase Migrations

## Overview

This directory contains SQL migration files to be applied to the Supabase database.

## Applying Migrations

You can apply migrations using the Supabase Dashboard SQL Editor or the CLI.

### Option 1: Supabase Dashboard (Recommended for Quick Start)

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/_/sql).
2. Open the SQL Editor.
3. Copy the content of the latest migration file (e.g., `20240523000000_init.sql`).
4. Run the query.

### Option 2: Supabase CLI (Recommended for Production)

1. Install Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Link your project: `supabase link --project-ref <your-project-ref>`
4. Push migrations: `supabase db push`

## Migration History

- `20240523000000_init.sql`: Initial schema setup (Profiles, Projects, AI Conversations).
