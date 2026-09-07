# Agent Execution Guide

This document describes how an implementation agent should progress through the roadmap.

## Important

Do not ask the coding agent to build the full application in one request.

Work phase-by-phase.

## Session Start Prompt

Use this when starting a new agent session:

```text
Read AGENTS.md and all relevant files under /docs before making changes.

Inspect the current repository and determine the latest completed roadmap phase.

Follow docs/10_ROADMAP.md and continue only with the next incomplete phase.

Do not expand the V1 scope.

Before coding, summarize:
1. current repository state
2. target phase
3. files/modules you expect to touch
4. implementation checklist

Then implement the phase incrementally.

After implementation, report:
- completed work
- changed files
- database/migration changes
- validation/tests performed
- known issues
- recommended next step
```

## Per-Phase Prompt Template

```text
Implement Roadmap Goal <N>: <NAME>.

Read:
- AGENTS.md
- docs/01_V1_SCOPE.md
- docs/02_ARCHITECTURE.md
- docs/10_ROADMAP.md
- the subsystem documentation related to this phase

First inspect the existing implementation and preserve working behavior.

Implement only this goal and the minimum prerequisites required for it.

Do not add future-phase features.

After completing it:
1. run relevant checks/tests
2. document any schema/environment changes
3. report remaining issues
4. stop before starting the next roadmap goal
```

## Recommended Execution Strategy

### Goal 1
Complete backend structure and application foundation before Phaser complexity.

### Goal 2
Use placeholder/simplified visual assets.

Do not block implementation waiting for final pixel art.

### Goal 3
Make messaging reliable before adding visual chat polish.

### Goal 4
Build planning data model before advanced monitoring.

### Goal 5
Create immutable progress history entries rather than only overwriting percentages.

### Goal 6
Start with generic links and one supported embed provider.

### Goal 7
Build monitoring from existing project/report data, not a separate duplicate tracking system.

## Agent Stop Conditions

Stop and report instead of improvising if:

- a database migration could destroy existing data
- auth/security requirements conflict
- a required external credential is missing
- repository architecture fundamentally conflicts with documentation
- the requested phase requires an unplanned major dependency

For ordinary implementation details, make a reasonable decision and continue.
