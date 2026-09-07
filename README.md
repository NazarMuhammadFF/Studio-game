# Virtual Game Dev Studio

A collaborative workspace for game development teams that combines:

- a **top-down 2D virtual studio**
- realtime team presence and communication
- project, milestone, goal, and task tracking
- structured progress reporting
- external work embeds and links
- lead monitoring and project visibility

The application is **not intended to replace tools such as GitHub, Figma, Blender, Notion, or Google Docs**.

Its role is to become a central communication and monitoring layer where team members can see who is active, communicate naturally, and understand project progress without moving the actual production workflow into this app.

## Product Principle

> Work in the original tool. Communicate, coordinate, and monitor in the studio.

## Primary Views

### Studio View
Top-down 2D interactive virtual studio.

Used for:
- team presence
- avatar interaction
- room interaction
- quick chat
- contextual project information

### Board View
Fast productivity and monitoring interface.

Used for:
- milestones
- goals
- tasks
- progress
- blockers
- reviews
- monitoring

## Core Hierarchy

```text
Workspace
└── Project
    ├── Members
    ├── Rooms
    ├── Milestones
    │   └── Goals
    │       └── Tasks
    ├── Conversations
    ├── Reports
    └── External Work References
```

## Recommended Initial Stack

```text
Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

Virtual Studio
- Phaser

Backend
- Supabase
  - PostgreSQL
  - Auth
  - Realtime
  - Storage

Future realtime avatar scaling
- Colyseus
```

Do not introduce Colyseus in the first implementation unless Supabase Realtime becomes a verified bottleneck.

## Documentation

Read in this order:

1. `AGENTS.md`
2. `docs/00_PRODUCT_VISION.md`
3. `docs/01_V1_SCOPE.md`
4. `docs/02_ARCHITECTURE.md`
5. `docs/10_ROADMAP.md`
6. `docs/11_AGENT_EXECUTION.md`

The remaining documents contain implementation details for each subsystem.

## Studio art and asset system

See [Studio asset guide](docs/15_STUDIO_ASSETS.md) for visual direction, registry, replacement workflow and runtime validation, and [the complete asset inventory](docs/assets/INVENTORY.md).
