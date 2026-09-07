# Lead Monitoring

## Objective

A lead should understand project health without asking every member individually.

## Core Monitoring View

Display:

- overall project progress
- milestone progress
- goal progress
- member progress
- blocked work
- overdue work
- pending review
- recent reports
- stale progress

## Example

```text
PROJECT ALPHA
Overall Progress: 64%

Programming
Raka      80%   On Track
Dinda     55%   Blocked

Art
Ayu       70%   Review
Bima      40%   At Risk
```

## Priority Information

Lead view should prioritize exceptions.

Order of attention:

1. Blocked
2. Overdue
3. Waiting Review
4. At Risk
5. Stale Update
6. Normal Progress

## Member Detail

Lead can inspect:

- current goal
- tasks
- current progress
- latest report
- blocker
- next target
- evidence
- progress history

## Stale Progress

A goal may be marked as stale if:

- still active
- no meaningful update for a configured period

Do not automatically call a member late only because they have not opened the app.

## Monitoring Philosophy

Monitoring exists for coordination, not surveillance.

Do not track:
- keyboard activity
- exact work hours by default
- unnecessary behavioral telemetry
- continuous avatar history

Track work state, not private behavior.
