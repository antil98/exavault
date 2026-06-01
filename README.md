# Exavault

Exavault is a full-stack file manager built with Next.js App Router. It supports authenticated user spaces, folder navigation, uploads to Vercel Blob, bulk file actions, trash/restore workflows, ZIP downloads, search, pagination, and Clerk-powered account management.

The goal of this project is to explore the moving parts behind a real cloud-drive style product: auth, server actions, database ownership rules, object storage callbacks, recursive folder operations, and client-side selection state.

<!-- Screenshot suggestion: Add a wide desktop screenshot of the main "My files" view showing the sidebar, breadcrumbs, search input, file table, and action buttons. -->
<!-- Screenshot suggestion: Add a second screenshot showing selected files with the bulk action toolbar visible. -->

## Features

- User authentication with Clerk
- Per-user root folders and protected file ownership
- File uploads through Vercel Blob
- Server-to-server upload completion handling
- Folder creation and nested folder browsing
- Breadcrumb navigation
- Search with URL query params
- Pagination
- Desktop table view and mobile-friendly file cards
- Single and bulk selection
- Context menus and dropdown action menus
- Rename, move, trash, restore, and permanent delete actions
- Recursive folder operations for trash, restore, delete, and ZIP download
- ZIP download generation for multiple files or folders
- Clerk webhook handling for user lifecycle events

<!-- Screenshot suggestion: Add a screenshot of the move dialog open, ideally showing nested folders and the "Move here" action. -->
<!-- Screenshot suggestion: Add a screenshot of the trash page showing restore/delete actions. -->

## Tech Stack

- **Framework:** Next.js App Router
- **Language:** TypeScript
- **UI:** React, Tailwind CSS, shadcn-style components, Base UI, lucide-react
- **Auth:** Clerk
- **Storage:** Vercel Blob
- **Database:** Neon/Postgres via @neondatabase/serverless
- **Feedback:** Sonner toasts
- **Validation and safety:** Server-side ownership checks, signed upload callback payloads, Clerk webhook signature verification

## Architecture Overview

Exavault separates user-facing interaction from server-side ownership checks. Client components handle selection, menus, dialogs, and navigation. Server actions and route handlers validate the current Clerk user before mutating files. Database functions receive an owner ID and use it to scope reads and writes.

```txt
Client UI
  -> Server Actions / Route Handlers
    -> Clerk auth()
    -> Database queries scoped by owner_id
    -> Vercel Blob for object storage
```

Upload is handled as a two-step flow:

```txt
Authenticated user starts upload
  -> /api/upload generates a Vercel Blob client token
  -> ownerId is stored in the signed token payload
  -> browser uploads directly to Vercel Blob
  -> Vercel Blob calls /api/upload after completion
  -> callback inserts the file row using ownerId from the signed payload
```

This avoids relying on browser cookies during the Vercel Blob callback, because that callback is server-to-server and does not have a Clerk session.

<!-- Screenshot suggestion: Add a small architecture diagram image here if you create one later. A simple boxes-and-arrows diagram is enough. -->

## Notable Implementation Details

### Recursive File Trees

Folder operations use recursive SQL to collect descendants before trashing, restoring, deleting, or downloading folder contents. This lets bulk operations work on both files and folders while preserving ownership checks.

### Selection State

Selection is owned by the file view and passed down to nested menus. Action components notify the parent when mutations complete so selection can be cleared in the same state owner that renders the selected count.

### Upload Callback Safety

The upload callback endpoint is intentionally public to Clerk middleware because Vercel Blob calls it without user cookies. The user ID is captured during authenticated token generation and later read from the signed callback payload.

### Clerk Webhooks

Clerk webhooks are used to react to user lifecycle events, such as creating a root folder for new users and cleaning up user-owned database/blob data when an account is deleted.

## Project Structure

```txt
app/
  (drive)/              Protected file manager routes
  actions/              Server actions for file mutations
  api/                  Upload, download, folders, and webhook routes
  sign-in/, sign-up/    Clerk auth pages
components/
  ui/                   Reusable UI primitives
  FileView.tsx          Main file explorer surface and selection owner
  FileActionsMenu.tsx   Per-file context/dropdown actions
  BulkActions.tsx       Bulk action toolbar
  MoveDialog.tsx        Folder move workflow
lib/
  data.ts               Database access and file/folder domain operations
  update-selection.ts   Pure selection state transition helper
  download-files.ts     Browser download helper
hooks/
  useSelection.ts       Local selection hook
```

## Getting Started

Install dependencies:

```bash
pnpm install
```

Create the required environment variables:

```bash
DATABASE_URL=
BLOB_READ_WRITE_TOKEN=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Notes

For deployed uploads, the Vercel Blob callback URL must point to a public route that Vercel Blob can reach. In local development, use a tunnel if you need to test the callback end-to-end.

Clerk webhook delivery also requires a public URL in development. Use Clerk webhook tooling or a tunnel when testing local webhook behavior.

## Current Limitations

- No automated test suite yet
- Database schema and constraints should be documented more formally
- Some file lifecycle operations can still be improved for retry safety between Blob and database changes
- Upload callback URL should be environment-driven instead of hardcoded
- The UI is functional but still has room for polish in empty/error/loading states

## Roadmap

- Add tests for selection logic, naming conflicts, and folder move validation
- Add stronger database constraints for per-folder name uniqueness
- Improve root-folder recovery if a webhook is missed
- Add preview support for common file types
- Add better storage cleanup retry behavior
- Add organization/shared-folder support

## What I Learned

This project brought together several concepts that are easy to underestimate in isolation:

- How App Router server actions and client components fit together
- Why server-to-server callbacks cannot rely on browser sessions
- How to scope database operations by authenticated user ownership
- How recursive folder operations work in SQL
- Why selection state should have a single owner in React
- How route protection, public callbacks, and webhooks need different auth strategies

## Status

This is an active learning project. It is intended to demonstrate practical full-stack product development, not just isolated UI components.
