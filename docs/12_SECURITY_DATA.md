# Security and Data Guidelines

## Authentication

Use Supabase Auth.

Never implement custom password storage.

## Authorization

Use Row Level Security.

Client-side role checks are only UX helpers.

## Data Ownership

Every protected record must have a clear ownership or membership path.

Examples:

```text
workspace → membership
project → workspace
goal → project
message → conversation → allowed members
```

## Sensitive Operations

Require proper permission for:

- workspace deletion
- project deletion
- member removal
- role changes
- destructive bulk actions

## External URLs

Validate external URLs.

Do not allow arbitrary script injection or raw HTML embeds.

## Storage

Restrict file type and size where relevant.

Do not use application storage as an unrestricted game asset warehouse.

## Realtime

Never expose private project realtime channels to unauthorized users.

## Logging

Do not record:
- passwords
- access tokens
- auth secrets
- private credentials

## Environment

Use `.env` for local environment values.

Commit:
- `.env.example`

Do not commit:
- `.env`
- service role secret
- private keys
