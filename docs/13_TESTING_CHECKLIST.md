# Testing Checklist

## Goal 1 — Foundation
- register works
- login works
- logout works
- session persistence works
- unauthorized project access fails
- role restrictions work
- workspace/project loading states work

## Goal 2 — Virtual Studio
- map loads
- avatar spawns
- movement works
- collision works
- room detection works
- remote avatar joins/leaves correctly
- position updates are throttled
- movement does not write continuous history to DB
- interpolation behaves acceptably

## Goal 3 — Communication
- DM creates/reuses expected conversation
- group chat works
- room chat works
- realtime message delivery works
- unread state works
- unauthorized user cannot read conversation
- typing state disappears correctly

## Goal 4 — Project Planning
- milestone CRUD
- goal CRUD
- task CRUD
- assignment
- status transition
- due dates
- project permission checks

## Goal 5 — Progress Reports
- report creation
- history preserved
- blockers displayed
- evidence links validated
- lead can view reports
- unauthorized project users cannot access reports

## Goal 6 — External References
- valid provider recognized
- invalid URL rejected safely
- supported embed works
- unsupported embed falls back cleanly
- external open action works

## Goal 7 — Monitoring
- overall progress is consistent
- blocked items appear
- overdue items appear
- review items appear
- member summaries are accurate
- empty project states are useful

## General
- no console-breaking errors
- error states exist
- empty states exist
- loading states exist
- mobile/narrow layout does not catastrophically break
- keyboard navigation remains usable for product UI
