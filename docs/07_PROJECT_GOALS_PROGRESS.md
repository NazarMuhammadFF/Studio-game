# Project, Goals, and Progress

## Core Hierarchy

```text
Project
└── Milestone
    └── Goal
        └── Task
```

## Project

Represents a game or major initiative.

## Milestone

Represents a meaningful delivery stage.

Example:

```text
Prototype
Vertical Slice
Alpha
Beta
Release Candidate
```

The exact milestone model should remain configurable.

## Goal

A measurable outcome.

Good:

```text
Implement functional inventory system
Complete environment art direction
Finalize enemy behavior prototype
```

Bad:

```text
Work on programming
Do art
Improve game
```

## Task

A concrete unit contributing to a goal.

Example:

```text
Goal: Inventory System

Tasks:
- Define item data
- Implement pickup
- Implement inventory UI
- Implement save/load
```

## Progress

V1 should support:

- manual progress percentage
- derived progress from completed tasks

Avoid overly complex scoring initially.

Recommended rule:

If tasks exist:
```text
task completion can suggest progress
```

But goal owner/lead may still adjust final reported progress where necessary.

## Status

Task/Goal status:

- Not Started
- In Progress
- Review
- Blocked
- Done

Monitoring health:

- On Track
- At Risk
- Overdue

Health is different from workflow status.

## Progress History

Each meaningful report creates a timeline entry.

Example:

```text
Sep 2 → 30%
Sep 4 → 45%
Sep 6 → 70%
```

This allows leads to detect stagnation.
