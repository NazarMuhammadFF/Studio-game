# Agent Instructions

This file is the primary execution contract for coding agents working on this project.

## General Rules

1. Read the project documentation before making architectural decisions.
2. Do not expand scope without a clear requirement.
3. Implement one roadmap phase at a time.
4. Prefer simple, maintainable solutions over premature abstraction.
5. Do not build features that duplicate external production tools.
6. The app is a communication, coordination, and monitoring layer.
7. Preserve a clean separation between:
   - Studio/Game Layer
   - Product UI Layer
   - Backend/Persistent Data
   - Temporary Realtime State
8. Keep changes incremental and testable.
9. Do not rewrite working modules unless necessary.
10. If documentation conflicts, use this priority:
   - `AGENTS.md`
   - `docs/01_V1_SCOPE.md`
   - `docs/02_ARCHITECTURE.md`
   - roadmap phase requirements
   - other docs

## Required Agent Workflow

Before implementation:

1. Inspect the existing repository.
2. Identify current stack and structure.
3. Compare repository state with current roadmap phase.
4. Create or update a short implementation checklist.
5. Implement only the requested phase.
6. Run relevant validation.
7. Report:
   - completed items
   - changed files
   - tests/checks performed
   - remaining issues
   - next recommended phase

## Scope Guard

Do NOT implement these in V1 unless explicitly requested:

- voice/video communication
- AI assistant
- marketplace
- advanced studio customization
- full asset version control
- built-in code editor
- built-in drawing/design editor
- built-in 3D editor
- mobile application
- achievement/gamification system
- complex automation engine
- microservice architecture

## Product UX Rule

The virtual studio must never make work slower.

Any important workflow that exists in Studio View should eventually have a fast equivalent in Product UI / Board View.

## Realtime Rule

Never store continuous avatar movement history in PostgreSQL.

Persistent data:
- account
- role
- project
- goal
- task
- report
- message
- final/latest persistent state

Temporary realtime data:
- avatar movement
- typing
- online presence
- transient room state

## External Work Rule

If external content can be embedded safely, embed it.

If it cannot be embedded:
- show a clean preview/card
- preserve the external URL
- allow structured reporting
- provide an external open action

Never attempt to recreate the external tool inside this application.

## Definition of Done for a Phase

A phase is complete only when:

- core workflow works
- loading/error/empty states exist
- permissions are enforced where relevant
- database changes are documented
- no known blocking errors remain
- implementation is consistent with current docs
