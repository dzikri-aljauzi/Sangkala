# Opencode Context

## Problem Summary
- Hard delete user from admin panel can cascade-delete uploaded assessment data tied to that user.
- Safer business direction chosen by team: optimize user deactivation instead of relying on permanent delete.

## Verification Result
- Delete endpoint uses `prisma.user.delete()` in `src/app/api/users/[id]/route.ts:85`.
- Prisma relations for uploaded records and auth session/account use `onDelete: Cascade` in `prisma/schema.prisma`.
- Login already blocks inactive users in `src/lib/auth.ts:44`.

## Latest Progress
- Improved user list action UX in `src/components/dashboards/AdminDashboard.tsx:661`.
  - Status now shown as clear badge: `Aktif` / `Nonaktif`.
  - Primary row action now `Nonaktifkan` / `Aktifkan`.
- Improved edit user flow in `src/components/dashboards/AdminDashboard.tsx:1916`.
  - Added `Status Akses` control in edit modal.
  - Admin can disable access without deleting user data.
- Reduced hard delete prominence in `src/components/dashboards/AdminDashboard.tsx:701`.
  - Added stronger confirmation warning about permanent delete and cascade impact.
  - Delete button made less visually dominant.

## Validation
- `npm run build` succeeded.
- `npm run lint` still fails because of many pre-existing repo-wide lint errors not caused by this change.

## Current Recommendation
- Use `isActive = false` for unused participants/users.
- Treat permanent delete as exceptional admin action only.
