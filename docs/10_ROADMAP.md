# Development Roadmap

Implementation must be incremental.

## Goal 1 — Foundation

### Deliverables
- project scaffold
- app shell
- Supabase connection
- auth
- profile
- workspace
- membership
- role model
- project creation/access
- initial RLS

### Exit Criteria
A user can authenticate, join/access a workspace, and open a project.

---

## Goal 2 — Virtual Studio Core

### Deliverables
- Phaser integration
- top-down map
- avatar
- movement
- collision
- room boundaries
- basic object interaction
- remote presence
- throttled position synchronization
- remote interpolation

### Exit Criteria
Multiple users can enter the same project studio and see each other move.

Do not polish art heavily yet.

---

## Goal 3 — Communication

### Deliverables
- conversations schema
- direct messaging
- group messaging
- room messaging
- realtime message updates
- unread state
- typing state
- studio quick-chat indication

### Exit Criteria
Members can communicate reliably inside the application.

---

## Goal 4 — Project Planning

### Deliverables
- milestones
- goals
- tasks
- assignment
- due dates
- statuses
- progress
- basic board view

### Exit Criteria
A lead can plan work and members can see assigned work.

---

## Goal 5 — Progress Reporting

### Deliverables
- progress report form
- progress history
- blockers
- next target
- evidence links
- report timeline

### Exit Criteria
Members can report progress and leads can see change over time.

---

## Goal 6 — External Work References

### Deliverables
- external resource model
- generic URL card
- safe provider parsing
- supported embed framework
- first Figma/FigJam embed path
- fallback external open behavior

### Exit Criteria
External work can be represented without copying production work into this app.

---

## Goal 7 — Lead Monitoring

### Deliverables
- monitoring dashboard
- project health
- blocked items
- overdue items
- waiting review
- recent updates
- member progress
- milestone progress

### Exit Criteria
A lead can understand the current project situation from one view.

---

## Goal 8 — Productivity Polish

### Deliverables
- Studio View ↔ Board View switching
- faster navigation
- better notifications
- UX polish
- responsive behavior
- accessibility pass
- performance pass

### Exit Criteria
The virtual experience does not slow normal productivity.

---

# V1 Completion

V1 is considered complete after Goal 7 is stable.

Goal 8 is a recommended usability/polish phase before broader team adoption.
