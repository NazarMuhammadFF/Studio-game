# Goal 1 — Supabase Setup and Acceptance Checklist

Goal 1 is ready in local demo mode. Complete the steps below to validate it against a real Supabase project.

## User setup

1. Create a Supabase project.
2. In **Authentication → URL Configuration**, set the local site URL to `http://localhost:3000`.
3. Decide whether email confirmation is enabled. When enabled, new members must confirm their email before signing in.
4. Open **SQL Editor** and run these files in order:
   - `supabase/migrations/20260907000001_goal1_foundation.sql`
   - `supabase/migrations/20260907000002_goal1_rls_hardening.sql`
   - `supabase/migrations/20260907172609_goal1_security_advisor_fixes.sql`
   - `supabase/migrations/20260907180333_allow_workspace_creator_returning.sql`
   - `supabase/migrations/20260907181735_workspace_invite_links.sql`
   - `supabase/migrations/20260907182040_replace_invite_rpcs_with_rls_claims.sql`
5. Copy `.env.example` to `.env.local` and fill in the project URL and anonymous/public key.
6. Restart the development server with `npm.cmd run dev`.

Never place the Supabase service-role key in a `VITE_` variable. Vite variables are included in browser code.

## Acceptance checklist

- [ ] Register a new account.
- [ ] Confirm the registration email if confirmation is enabled.
- [ ] Sign in and refresh the browser; the session remains active.
- [ ] Update the profile and confirm the change remains after refresh.
- [ ] Create a workspace; the creator receives the `owner` role.
- [ ] Add a second registered member by username.
- [ ] Confirm the second member can open the workspace.
- [ ] As an owner or lead, create an invite link from **Team**. The link expires after seven days.
- [ ] Open the link in a separate browser profile, sign in, select Lead, Member, or Guest, and join the workspace.
- [ ] Confirm the invite flow never presents Owner and does not change the existing workspace owner.
- [ ] Confirm a user outside the workspace cannot read it or its projects.
- [ ] Confirm an owner or lead can create a project.
- [ ] Confirm a guest cannot create a project.
- [ ] Sign out and confirm protected application content is no longer visible.

## Local validation commands

```powershell
npm.cmd run lint
npm.cmd run assets:check
npm.cmd run build
```

Goal 1 is complete only after the real-Supabase acceptance checklist passes. Local demo mode is useful for UI development, but it does not prove database permissions or authentication behavior.
