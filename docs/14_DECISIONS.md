# Architecture Decision Log

Use this document to preserve important decisions and reduce repeated redesign.

## ADR-001 — App Purpose

Decision:
The application is a communication, coordination, and monitoring layer.

It does not replace production tools.

Status:
Accepted.

## ADR-002 — Two Interaction Modes

Decision:
Provide:

- Studio View
- Board/Productivity View

Reason:
Virtual interaction should add presence without slowing high-volume project management.

Status:
Accepted.

## ADR-003 — Studio Rendering

Decision:
Use Phaser for the top-down 2D studio layer.

React remains responsible for application UI.

Status:
Accepted.

## ADR-004 — Initial Backend

Decision:
Use Supabase for V1.

Services:
- Auth
- PostgreSQL
- Realtime
- lightweight Storage

Status:
Accepted.

## ADR-005 — Avatar Realtime

Decision:
Start with throttled Supabase realtime synchronization.

Do not send avatar positions every render frame.

If scaling becomes a measured problem, move avatar realtime state to Colyseus.

Status:
Accepted.

## ADR-006 — Production Work

Decision:
External production work remains in original tools.

The application uses:
- embeds
- previews
- links
- structured reports

Status:
Accepted.

## ADR-007 — Progress Structure

Decision:

```text
Project
→ Milestone
→ Goal
→ Task
```

Structured progress reports exist independently from tasks.

Status:
Accepted.

## ADR-008 — Permission Design

Decision:
Separate product authorization role from professional discipline.

Authorization:
- Owner
- Lead
- Member
- Guest

Discipline:
- Programmer
- Artist
- Game Designer
- etc.

Status:
Accepted.
