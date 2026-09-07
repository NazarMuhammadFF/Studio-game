# Multiplayer repair — 8 September 2026

Scope: existing avatar networking/rendering (Goal 2 reliability), click/E interaction and user-requested real Direct Chat. Preserve asset work and shared-studio visibility. No whole roadmap phase is declared complete.

## Completed

- [x] Reproduce using real React StudioCanvas under StrictMode. Phaser SceneManager.add returns null before boot: retain an explicit instance and replay presence once ready.
- [x] Preserve actual spawn/input locks; defer prop actions until readiness; dispose callbacks on unmount.
- [x] Preserve newer movement coordinates during presence sync and immediately transmit movement start/stop.
- [x] Read current remote state on click, support nearby E and repeated public speech via timestamps.
- [x] Register live chat participants; send persistent private messages with sending/sent/failed and unread states, without fake replies or public speech broadcasts.
- [x] Isolate Supabase Auth notification channels per document while keeping existing sessionStorage keys across reloads. Custom storage alone did not isolate Auth's BroadcastChannel.
- [x] Apply additive DM migration, validate and remove temporary QA data.

## Changed production files

- `src/components/studio/StudioCanvas.tsx`: scene/network/chat lifecycle bridge.
- `src/studio/StudioScene.ts`: current-state clicks and repeated speech.
- `src/lib/studioNetwork.ts`: freshest presence state and movement transitions.
- `src/lib/supabase.ts`: isolated tab auth notifications with compatible persisted keys.
- `src/studio/chat/liveDirectMessages.ts`: RLS inbox, Realtime inserts, queued refreshes and 4-second recovery polling.
- `src/studio/chat/mockChatStore.ts`, `mockChatTypes.ts`: live participants and DM delivery alongside existing demo functionality.
- `src/components/studio/chat/StudioChatDrawer.tsx`, `DirectChatView.tsx`: live entry points, delivery/errors and unread state.
- `supabase/migrations/20260907191803_studio_direct_messages.sql`: table, indexes, RLS and Realtime publication.

## Database and deployment

Migration 20260907191803 is applied to linked Supabase and recorded in migration history. Only sender/recipient can read. Inserts require the authenticated sender and both parties to belong to the specified workspace. Movement remains temporary; existing business data and policies were not replaced.

Frontend source and dist build are ready locally; frontend hosting was not deployed. Security advisor reported the existing Auth leaked-password-protection warning, with no new DM-table finding.

## Validation

- `npm.cmd run lint`: passed (tsc --noEmit).
- `npm.cmd run build`: passed after final production changes; existing large-bundle warning remains.
- `npm.cmd run assets:check`: passed, 70 assets and no duplicates.
- Real two-client browser: avatar arrival, walking animation, position convergence, stopped state, current-state click, nearby E, repeated public speech and departure passed without captured runtime errors.
- Live browser transport disabled local BroadcastChannel fallback and extended inbox polling to 10 minutes. Actual form sends A→B and B→A passed through Supabase; messages stayed private. Reload restored history; open-conversation unread count cleared.
- Final auth regression: distinct auth channels; signing out A retained B's session. Both live UI send directions still passed.
- Three authenticated QA accounts: receiver read allowed, outsider read/events denied, forged sender and cross-workspace insert denied. Final `qa-live-direct-messages.mjs` run returned all checks true and outsiderEvents=0.
- Both QA rounds' temporary accounts, workspaces and messages were removed. QA servers stopped and browser fixture sessions cleared.

## Reproduce

Local: `npx.cmd vite --config scripts/multiplayer.vite.config.ts`, then open `http://127.0.0.1:3002/scripts/multiplayer-preview.html`. Uses disconnected Supabase stub and isolated movement channels.

Live QA requires linked CLI admin access. `node scripts/qa-live-direct-messages.mjs` creates three temporary accounts and an isolated workspace/project; it refuses to overwrite an existing fixture. Temporary tokens stay outside the repository in `C:/Users/nazar/.codex/tmp/studio-multiplayer-qa.json`. Set `$env:STUDIO_QA_LIVE='1'`, run the same Vite config and open `http://127.0.0.1:3003/scripts/multiplayer-preview.html?live=1`. The localhost fixture endpoint serves only QA sessions; iframe storage is namespaced because same-tab iframes share sessionStorage. `node scripts/qa-realtime-delivery.mjs` separately checks server delivery and outsider isolation.

Always disconnect clients, run `node scripts/qa-live-direct-messages.mjs --cleanup`, clear QA browser sessions and stop the server afterward. Never deploy the QA endpoint or fixture.

## Limits / next step

Room/group panels retain existing simulation behavior; real delivery here is Direct Chat between workspace members. Converting live direct conversations to simulated groups is disabled. Public avatar speech remains temporary. The inbox loads the latest 200 accessible messages; older-history pagination is not included. Shared studio visibility is preserved, but private sends outside the current workspace show an error.

Next: deploy the frontend build and repeat the two-account acceptance flow on hosting before another roadmap phase.
