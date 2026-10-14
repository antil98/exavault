# Exavault

Exavault is a cloud-drive-style file manager built with Next.js App Router. It provides per-user file spaces, nested folders, uploads to Vercel Blob, search, bulk actions, trash and restore, and ZIP downloads.

## Features

- Clerk sign-in and sign-up
- Per-user root folders and server-side ownership checks
- Public file uploads to Vercel Blob
- Folder creation, nested navigation, breadcrumbs, search, and pagination
- Desktop file table and mobile file cards
- Single and bulk selection
- Rename, move, trash, restore, and permanent deletion
- ZIP downloads for selected files and folders
- Clerk webhooks for user creation and deletion

## Tech stack

- Next.js 16, React 19, and TypeScript
- Tailwind CSS, Base UI, and Lucide icons
- Clerk authentication
- Neon serverless PostgreSQL
- Vercel Blob object storage

## Prerequisites

- Node.js (use a currently supported LTS release)
- pnpm
- Accounts/projects for Clerk, Neon, and Vercel Blob

## Installation

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/antil98/exavault.git
   cd exavault
   pnpm install
   ```

2. Create a `.env.local` file in the project root and add the required keys below.

3. Create a Neon Postgres project, copy its connection string into `DATABASE_URL`, and create the `files` table using the SQL in [Database setup](#database-setup).

4. Create a Clerk application and a Vercel Blob store, then add their keys to `.env.local` as described below.

5. Start the development server:

   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000), create an account, and start using Exavault.

### Required development keys

Put these values in `.env.local`. Do not commit this file or expose secret keys in client-side code.

| Variable | Required for | Where to get it |
| --- | --- | --- |
| `DATABASE_URL` | Database access | In the [Neon Console](https://console.neon.tech), open your project and select **Connect**. Choose a branch, database, and role, then copy the connection string. The pooled connection string is suitable for this app. See [Neon's connection guide](https://neon.com/docs/connect/connect-from-any-app). |
| `BLOB_READ_WRITE_TOKEN` | Uploading and deleting stored files | Create a Blob store from your Vercel project's **Storage** tab. Include the **Development** environment when creating the store so the token is available locally. Vercel documents this in [Using the Blob SDK](https://vercel.com/docs/vercel-blob/using-blob-sdk). |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk authentication in the browser | Create or select an application in the [Clerk Dashboard](https://dashboard.clerk.com/), then copy the publishable key from **API Keys**. See Clerk's [Next.js quickstart](https://clerk.com/docs/nextjs/getting-started/quickstart). |
| `CLERK_SECRET_KEY` | Server-side Clerk authentication | Copy the secret key for the same Clerk application from its **API Keys** page. Keep it private. See Clerk's [Next.js quickstart](https://clerk.com/docs/nextjs/getting-started/quickstart). |

Example (replace each placeholder with the value from the corresponding provider):

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

### Optional Clerk webhooks

`CLERK_WEBHOOK_SECRET` is needed only if you configure Clerk to call the user lifecycle webhook. The handler is `/api/webhooks/clerk` and processes `user.created` and `user.deleted` events.

In the Clerk Dashboard, create a webhook endpoint pointing to `https://<your-public-host>/api/webhooks/clerk`, subscribe it to **user.created** and **user.deleted**, and copy that endpoint's **Signing Secret** into `.env.local`:

```dotenv
CLERK_WEBHOOK_SECRET="whsec_..."
```

The signing secret is shown for the endpoint in the [Clerk Webhooks dashboard](https://dashboard.clerk.com/~/webhooks). See [Clerk's webhooks guide](https://clerk.com/docs/guides/development/webhooks/overview) for details. For local testing, expose the development server through an HTTPS tunnel and use its public URL as the webhook endpoint. Restart the dev server after changing environment variables.

The app does not use `NEXT_PUBLIC_APP_URL` for its current upload flow. Clerk's webhook sender must be able to reach the endpoint; a localhost URL alone is not reachable from Clerk.

## Database setup

This repository does not currently include a migration runner or schema migration files. Run the following SQL once against the Neon database selected by `DATABASE_URL` (for example, from the Neon SQL Editor):

```sql
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES files(id) ON DELETE CASCADE,
  owner_id TEXT NOT NULL,
  name TEXT NOT NULL,
  url TEXT,
  pathname TEXT,
  size DOUBLE PRECISION NOT NULL DEFAULT 0,
  file_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_dir BOOLEAN NOT NULL DEFAULT FALSE,
  is_trashed BOOLEAN NOT NULL DEFAULT FALSE,
  original_location UUID,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS files_owner_parent_idx
  ON files (owner_id, parent_id);

CREATE INDEX IF NOT EXISTS files_owner_trash_parent_idx
  ON files (owner_id, is_trashed, parent_id);
```

`url`, `pathname`, and `file_type` may be null for folders. A user's root folder is created automatically the first time the authenticated user accesses the file area; the Clerk `user.created` webhook can also create it.

## Development commands

```bash
pnpm dev      # Start the local development server
pnpm lint     # Run ESLint
pnpm build    # Create a production build
pnpm start    # Serve the production build
```

## How it works

```text
Browser
  -> Next.js server actions and route handlers
    -> Clerk authentication and per-user authorization
    -> Neon Postgres for file and folder metadata
    -> Vercel Blob for file contents
```

Uploads use a two-step flow: `/api/upload` creates an authenticated Blob client token, then `/api/upload/complete` records the uploaded object's metadata for the currently authenticated user. The completion handler does not trust a client-supplied owner ID.

File and folder operations are scoped to the authenticated Clerk user. Recursive SQL is used for folder tree operations such as moving, trashing, restoring, and preparing ZIP downloads.

## Project structure

```text
app/
  (drive)/             Protected file manager routes
  actions/             Server actions for file mutations
  api/                 Upload, download, folders, and webhook routes
  sign-in/, sign-up/   Clerk authentication pages
components/            File manager UI and reusable components
components/ui/         UI primitives
hooks/                 Client-side hooks
lib/data.ts            Database queries and file/folder operations
lib/db.ts              Neon database connection
proxy.ts               Request and authentication proxy
types/                 Shared TypeScript types
```

## Deployment notes

- Set the four required environment variables in the deployment environment.
- Set `CLERK_WEBHOOK_SECRET` if the Clerk webhook endpoint is enabled; configure its URL to use the deployed domain.
- Apply the database SQL in the production Neon database before serving requests.
- The configured Blob store must be available to the deployment environment.

## Current limitations

- No automated test suite or migration runner is included.
- Blob storage and database updates are separate operations; retries and cleanup can be improved.
- The UI and empty, loading, and error states are still being refined.
