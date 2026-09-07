# Studio asset guide

## Scope and implementation checklist

This is the explicitly requested visual/asset pass on the existing Goal 2 studio, not an implementation of the next product roadmap phase. The repository has React 19, TypeScript, Vite, Phaser 4.2.1 and a Supabase bridge. Existing scene/layout includes six rooms and 48 interactive objects with sample product context. This pass makes no claim that all other roadmap goals are complete.

- [x] Audit generated textures, scene references, declared sizes, collisions and rendering.
- [x] Replace environment/furniture/studio-object placeholders with coherent shared art.
- [x] Centralize assets, dimensions, origins, collision footprints and approach offsets.
- [x] Separate room/layout data and appearance resolution from scene rendering.
- [x] Replace avatar renderer; support idle/walk in four directions and shared appearances.
- [x] Preserve room IDs, workstation data, seating, interactions and seven doorways.
- [x] Validate actual Phaser bodies, traversal, access, animation and asset failure states.
- [x] Document replacement workflow and remaining limits.

No database, migration, auth, permissions, network transport or product UI changes. The working directory has no Git repository, so no commit or Git diff was available.

## Audit findings and resolution

| Before | Resolution |
|---|---|
| 66 runtime Canvas texture definitions in a single dummy asset generator; no independent art library | All 66 logical keys now use the authored SVG library; 17 reusable building/prop keys added |
| Repeated workstation drawing code and nearly identical furniture across departments | Shared drawing primitives in `scripts/build-studio-assets.mjs`, content deduplication and canonical texture keys |
| Neon colored floors, disconnected room palettes, inconsistent front-face/top-surface treatment | Neutral mineral tiles, warm timber, muted department rugs and one upper-left lighting direction |
| Full image bounds used as static colliders, including monitor tops and plant leaves | Registry footprints block physical bases and desk surfaces; shadows/overhangs permit depth overlap |
| Layout dimensions diverged from actual textures (e.g. conference table 130×68 versus 140×72; plaza status 76×44 versus 80×46) | Layout resolves authoritative registry dimensions; dimensions removed from authored object records |
| Large type/id-dependent texture selection chain inside scene | `assets/objectAppearance.ts` resolves legacy product types to assets; `layout.ts` exposes explicit `assetKey` |
| Thousands of separate floor images, including partial final tiles outside exact room rectangles | Seven exact-size TileSprites: base building plus six rooms |
| Wall segments rounded up to 32px and extended past their declared endpoint | Last wall tile uses exact remaining dimensions; doorway spans remain intact |
| Every member generated its own 12 dummy avatar textures; no animated idle | Layered character renderer, 16 frames per unique appearance, eight animation definitions, shared texture cache |
| Approaches south of two plaza benches, perimeter QA board and code board could be blocked | Four per-placement approach offsets use the clear west/north side |

There were no scattered image URLs to migrate: the old problem was scattered generated texture keys and drawing logic. The scene now has no raw image paths.

## Art direction

Clean, stylized slight top-down orthographic studio. Visible desk tops and shallow front edges use the same projection. Light comes from the upper left; lower-right shadows remain within texture bounds. Floors and walls form a single building. Avoid phototextures, neon outlines, large gradients and texture noise.

Palette: mineral/sage floors, cream walls, honey oak surfaces, slate hardware. Programming uses teal, Art dusty rose, Design sage green, Audio lavender and Meeting ochre. Department objects differentiate by code displays, artwork panels, flowcharts, waveform consoles and presentation surfaces. Plaza uses directory maps, shared seating and the existing studio emblem. Screens/boards are decorative illustrations, not live project metrics.

The renderer produces final usable minimalist vector art, not downloaded or AI-generated artwork. Do not mix a higher-detail asset into one room without checking the full building. Custom branding, bespoke character hairstyles/outfits and richer illustration can be commissioned later; no external art generation is required to run this version.

## Structure and naming

- `public/assets/studio/environment/{floors,walls,doors,windows}`: building kit.
- `public/assets/studio/furniture/*`: desks, chairs, tables, sofas, shelves, cabinets, lamps and other shared furniture.
- `public/assets/studio/technology/*`: monitors, laptops, computer/server cases and speakers.
- `public/assets/studio/signage`: directory, project, review, planning and presentation boards.
- `public/assets/studio/decorations`: plants, books, cups, boxes and reference art.
- `public/assets/studio/interaction`: ground interaction ring.
- `src/studio/assets/characters/avatar.ts`: base character, layer order, color variants and animation definitions.
- `src/studio/assets/manifest.json`: generated declarative asset metadata.
- `src/studio/assets/registry.ts`: typed registry, preload and body application.
- `src/studio/assets/objectAppearance.ts`: mapping from existing interaction definitions to appearance.
- `src/studio/layout.ts`: room/door geometry, object placement, shared decorations and approach overrides.
- `scripts/studio-asset-specs.json`, `scripts/build-studio-assets.mjs`: editable art source/specification; no external art dependencies.

Retain stable snake_case keys (`floor_`, `obj_`, `env_`, `tech_`, `decor_`, `fx_`). Files use their canonical key. Room-specific differences are shared variants, not separate copied room folders. Empty speculative directories are intentionally omitted. See [the complete inventory](assets/INVENTORY.md).

## Scale, collision and depth

One world unit equals one rasterized texture pixel. Floors/walls use 32px modules; doors have 96px or 128px clear spans. Avatars are 32×32; standard desks 64×42; chairs 24×24. Large shared tables/displays use their real size (largest current asset 140×72). Do not stretch furniture to fit old dimensions.

Registry origins are normalized; furniture uses 0.5,0.5. Footprints are native texture coordinates `{x,y,width,height}` measured from the top-left corner. The body helper refreshes the static body first, then applies size/offset. Re-run the helper after moving a static prop. Never call `refreshBody()` afterward without reapplying the footprint.

Depth is the visible ground-contact Y, computed from the footprint bottom. Avatars use their feet depth; plants use the pot rather than leaf silhouette. Floors and thresholds have negative depth and no body. Windows overlay existing walls without new collision. Chairs remain nonblocking to preserve existing seating behavior. F1 shows body rectangles and doorway clearances.

Every object placement resolves `assetKey`, dimensions and `interactionOffset`; offsets describe a clear standing point relative to its center. The hint ring uses that point. Existing 65px proximity and click behavior remain intact. Use per-placement overrides when furniture/walls block the default south approach. Keep approaches connected to the plaza and outside doorway buffers.

## Character rules

Layers: ground shadow → shoes/trousers → clothing/sleeves → hands/skin → hair → face/highlight. Skin, hair and clothing colors are independently configured. Identity is not encoded into a texture; identical appearance colors reuse all frames. Future hairstyle/clothing/accessory layers belong here, with their configuration included in the cache signature. Do not add a character creator or role-based permissions to this module.

For each direction (`down`, `up`, `left`, `right`): frame 0 is rest, 1/2 are opposing steps, 3 is the subtle idle breath. Walk sequence `[1,0,2,0]` at 8fps; idle `[0,3]` at 2fps. Keep all frames 32×32, origin 0.5,0.7 and feet collider 16×12 at offset 8,20. Seated poses intentionally freeze the facing frame. Remote movement interpolation and network payloads remain unchanged.

## Add or replace an asset

1. Edit the drawing source/specification. For replacement art, preserve the logical key, perspective and intended world dimensions. The generator is the source of truth; direct edits to generated SVG/manifest files are overwritten on regeneration.
2. Run `npm.cmd run assets:build`. Identical SVG content resolves to one canonical texture; always reference `STUDIO_ASSETS[logicalKey].key`, since a logical alias may not be a loaded texture name.
3. Adjust origin/footprint/approach metadata in the generator when the physical shape changes. Room objects inherit dimensions from the registry.
4. Add an appearance mapping for a new existing object variant, or use `assetKey` in shared decoration layout data. Do not put filesystem paths in scene logic.
5. Run `npm.cmd run assets:check`, `npm.cmd run lint`, and `npm.cmd run build`.
6. Open the development QA page and run the runtime check below. Inspect all rooms, then view a desk/avatar close-up. Check front/back overlap, accessible interaction hints and seating.

For hand-authored SVG replacement, integrate its source into the generator rather than adding a second competing asset pipeline. An atlas is optional when measured network overhead warrants it; the current 70 unique SVG files total about 78 KB and rasterize at native dimensions. Each canonical key queues once per game, textures are reused, and avatars generate only on demand. The full six-room scene needs its complete small environment kit up front.

## Validation and review

Run the local server with `npm.cmd run dev -- --host 127.0.0.1`, then visit `/scripts/asset-preview.html`. This development-only harness instantiates the actual StudioScene with local data and no Supabase calls; it is not included in the Vite production entry.

```powershell
npx.cmd --yes agent-browser open http://127.0.0.1:3000/scripts/asset-preview.html
Get-Content scripts/verify-studio-runtime.js -Raw | npx.cmd --yes agent-browser eval --stdin
```

The runtime check verifies all required textures, exact collider size/offset, 48 reachable approach points using flood-fill against real bodies, 14 physical traversals of seven doors, furniture blocking, workstation/meeting seating and release, eight animation definitions, remote animation/interpolation/cache reuse and front/back depth order. It does not contact a real second account or validate production permissions.

`?missing=1` deliberately breaks a required asset only in the QA page. The scene must show a load/decode error or bounded 15-second timeout and must not create a playable world with missing textures. Reload the normal URL to recover.

Manual review: walk through all six rooms; inspect room objects using E/click; sit/stand at workstations and meeting chairs; observe avatars behind/in front of props; verify F1 clearance; confirm overview and player-view readability. [Overview screenshot](assets/studio-overview.png).

Remaining limits: the existing product/demo content is untouched; no live multi-account Supabase validation or production deployment was performed. Vite still reports its large application bundle warning, which includes Phaser. Future work should be a product-owner art review followed by the next explicitly requested roadmap phase, not automatic expansion into communication or project features.

Final visual cleanup also removes duplicate workstation nameplates when a present colleague already has a name tag. Room labels sit above furniture and clear corner plants. Sample avatar palettes are isolated in `assets/characters/variants.ts`. [Character/workstation detail](assets/studio-detail.png).

Validation recorded on 2026-09-07: `assets:check` passed (70 unique SVG files, 78,159 bytes, zero duplicate payloads), TypeScript lint passed, production build passed, and the full browser runtime check passed with zero failures. The deliberately missing required texture produced the bounded timeout message with no player/world created. Production build still emits the existing >500 KB chunk warning (application JS about 2.47 MB uncompressed including Phaser).
