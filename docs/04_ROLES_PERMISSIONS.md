# Roles and Permissions

## Product Roles

### Owner
Workspace authority.

Can:
- manage workspace
- manage membership
- assign leads
- create/delete projects
- manage project settings
- access monitoring
- perform destructive workspace operations

### Lead
Project/team coordination.

Can:
- manage project planning
- create milestones/goals/tasks
- assign members
- review progress
- monitor blockers
- access project monitoring
- moderate project-level conversations when needed

### Member
Normal contributor.

Can:
- view assigned projects
- communicate
- update assigned goals/tasks
- submit reports
- add relevant evidence/resources
- interact with studio

### Guest
Restricted collaborator.

Can:
- access explicitly shared project contexts
- communicate where allowed
- view selected resources

Default guest permissions should be minimal.

## Discipline

Discipline is not authorization.

Examples:
- Programmer
- Artist
- Game Designer
- Audio
- Writer
- QA

A Programmer can still be a Lead.
An Artist can still be an Owner.

## Security

Permissions must be enforced in the backend.

Do not rely on:
- hidden buttons
- client-side checks only
- route visibility alone

Use Supabase Row Level Security for protected data.
