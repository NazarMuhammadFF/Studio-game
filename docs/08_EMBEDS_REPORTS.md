# Embeds and Structured Reports

## Principle

If external work can be embedded safely, show it inside the app.

If it cannot be embedded, represent it through a structured report and external reference.

## External Resource States

```text
Supported Embed
→ show embedded preview

Preview Only
→ show metadata/card

Unsupported Embed
→ show structured information + external link
```

## Initial Providers

Architecture should support:

- Figma
- FigJam
- GitHub
- Notion
- Google Docs
- YouTube
- Generic URL

Do not require all provider integrations during the first implementation.

## Embed Safety

Never inject arbitrary external HTML.

Embed handling must use:
- trusted provider rules
- validated URL parsing
- controlled iframe configuration where applicable
- provider-specific allowed domains

## Structured Progress Report

Recommended fields:

```text
Goal
Progress %
Status

Summary
- What changed?

Blockers
- What is preventing progress?

Next Target
- What happens next?

Evidence
- external URL
- commit
- PR
- image
- document
```

## Example

```text
Goal:
Inventory System

Progress:
70%

Status:
In Progress

Summary:
- Item pickup complete
- Inventory UI complete
- Save system started

Blocker:
Save synchronization still unstable

Evidence:
GitHub PR link

Next Target:
Complete save/load workflow
```

## Reports vs Tasks

Tasks describe planned work.

Reports describe actual current progress.

Do not force users to rewrite task descriptions into reports.
