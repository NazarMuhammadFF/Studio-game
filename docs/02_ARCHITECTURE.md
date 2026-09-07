# Architecture

## High-Level Architecture

```text
                         CLIENT
                React + TypeScript
                        │
          ┌─────────────┴─────────────┐
          │                           │
    Product UI Layer            Studio Layer
  Board / Chat / Report           Phaser
          │                           │
          └─────────────┬─────────────┘
                        │
                    Supabase
        ┌───────────┬───┴────┬───────────┐
        │           │        │           │
       Auth     PostgreSQL  Realtime    Storage
```

## Studio Layer

Phaser owns:

- map rendering
- avatar sprites
- movement
- collision
- interactive world objects
- local animation
- remote avatar visualization

Phaser must not become responsible for:

- forms
- project management UI
- complex dialogs
- reports
- dashboards
- application navigation

These belong to React.

## Product UI Layer

React owns:

- authentication screens
- workspace/project UI
- goals/tasks
- reports
- monitoring
- chat panels
- embed containers
- settings
- admin/lead controls

## Backend

Supabase handles V1:

### PostgreSQL
Persistent application data.

### Auth
User identity and sessions.

### Realtime
Initially:
- online presence
- chat updates
- typing
- low-frequency avatar synchronization

### Storage
Only lightweight application files.

Do not use Supabase Storage as the main repository for:
- game builds
- large PSD files
- large Blender files
- large video files
- large source asset repositories

## Avatar Networking

V1:

```text
Local Player
60 FPS local rendering
       │
       ├── local movement
       │
       └── throttled network updates
             approximately 3-5 updates/sec
```

Remote clients interpolate movement.

Do not transmit movement at rendering frame rate.

## Future Scaling

If avatar networking becomes a verified realtime bottleneck:

```text
React / Phaser
   │
   ├── Supabase
   │     persistent application data
   │
   └── Colyseus
         avatar movement
         room state
         realtime world synchronization
```

Design network interfaces so movement transport can later be replaced without rewriting the Phaser scene system.

## Persistent vs Temporary State

Persistent:

- users
- memberships
- roles
- projects
- milestones
- goals
- tasks
- reports
- messages
- external references
- final room/position if needed

Temporary:

- active movement
- typing
- transient interaction
- current presence
- temporary animation state
