# BoneSculpt PRO landing page

Buildless product page for **BoneSculpt PRO by Vikas Thakur**, based on the local **0.13.0 / Blender 5.0+** product documentation. No dependencies, framework, remote fonts, analytics, simulated Blender controls, or generated product imagery.

## Local preview and export

Requires Node.js 20.11 or newer. No installation step is needed.

```powershell
npm start
npm run check
node build-standalone.mjs --check
npm run export:standalone
```

Open `http://127.0.0.1:5174`. Set `PORT` for another port. `server.mjs` binds to loopback by default; set `HOST` explicitly if needed. It supports HEAD and byte ranges for native video seeking.

The deployable directory is `dist/`. Its HTML, CSS and JavaScript are the source files:

- `dist/index.html`: purchase hero, original Blender montage, guided scene switcher, compact edition comparison and collapsed installation/controls/rig information.
- `dist/styles.css`: complete flat-color design, responsive layout, keyboard focus, print and reduced-motion styles.
- `dist/app.js`: accessible scene tabs and media playback/fallback behavior. There is no unused mobile-menu or brush-selector code.
- `build-standalone.mjs`: validates guided assets and builds the optional standalone export.

## Design and content contract

Use near-black `#101218`, orange `#ff6b2b` purchase panels, cyan `#5ee8ed` feature fields and lime `#d5ff59` badges/checks. Keep the existing authentic media. No gradients, decorative blobs or repeated feature-card grid.

The hero shows the original wide `hero.mp4`, a prominent **$14.99 PRO regular price (USD)**, and **Get PRO on Superhive**. Standard's regular price is **$4.99 USD**. These are owner-confirmed regular/list prices, not live sale prices. Link to **Current offers on Superhive** instead of hardcoding discounts. Purchase links open the confirmed product URL in a new tab with `noopener noreferrer`:

https://superhivemarket.com/products/bonesculptpro

Keep purchase CTAs at the start, in the selected demo and at the bottom. **`?embed=1` hides only the redundant site navigation; it retains every purchase CTA, price and the bottom purchase panel.** The standalone export follows the same behavior.

Default copy stays concise; the three native `details` sections hold installation, the nine short brush descriptions and controls, and rig/onion-skin limitations. Critical connected-bone/rig, collision and onion warnings remain visible beside their respective selected demo. The full onion warning explains that sampling can reset other unkeyed animated values, even when Auto Update is off.

PRO has nine brushes; Standard has Grab, Twist, Smooth and Reset. The four-row comparison groups shared controls while retaining the five extra PRO brushes and the combined Grab + Twist, mirror, collision and onion-skin distinctions. Included tools have **a visible green/lime check and “Included”**; missing tools retain **a dash and “Not included”**. Both editions require Blender 5.0+ and should not be enabled together. Do not imply every rig is validated.

Every authored DOM label is at least **14px**; body text is generally 16–19px. Maintain 32–48px section gaps, readable controls and no horizontal page overflow at 320px. The narrowest guide stage must remain at least about **271px** wide: authored labels are 66px in the 1200px source, so a 271px rendering keeps them above 14px. Do not place three narrow guided players side by side.

## Media contract and provenance

No media files are regenerated or edited by this redesign. Preserve every existing asset and `dist/media/media-sources.json`.

| Asset | Purpose |
| --- | --- |
| `media/hero.mp4`, `hero-poster.webp` | Original colorful wide Blender montage in the hero; 1200 × 600 |
| `media/bonesculpt-stroke-guide.mp4`, `.webp`, `-poster.webp` | Current 0.13.0 Grab demonstration on a real chain in Blender 5.0.1 |
| `media/bonesculpt-collision-guide.mp4`, `.webp`, `-poster.webp` | Annotated existing official collision footage |
| `media/bonesculpt-onion-guide.mp4`, `.webp`, `-poster.webp` | Annotated existing official mesh-ghost footage |
| `media/interface.webp` | Actual Blender 5.0.1 interface capture and error fallback |
| `media/sculpt.mp4`, `collision.mp4`, `onion.mp4` and matching posters | Retained original media and provenance; no longer additional page sections |

All three guides are 1200 × 1320, 6.4 seconds, H.264/yuv420p with faststart, displayed without cropping. The stroke capture uses the original brush methods with scripted screen-space input; cursor trails, labels and holds are editorial annotations. It verifies source-driven brush output rather than manual modal event handling. Collision and onion guides are edits of existing official media, which may show an earlier interface. They are not controlled collision tests or a guarantee of intersection-free meshes.

The guide capture/build scripts, hashes, original source URLs and review frames remain in `../media-work/bonesculpt-explainers/manifest.json` and `../media-work/scripts/bonesculpt_explainers_*`. Do not modify the add-on or this media provenance during page work.

Native MP4 controls and static posters are mandatory. Animated WebP versions are explicit links only; the page does not load animated images automatically. The current interface still is also available as a full-size link in the rig details.

## Interaction and accessibility

- The three scene tabs use selected state, roving focus, arrow keys, Home and End. Changing scenes pauses the outgoing player. Only the selected scene is displayed. With JavaScript off, all three native players and their captions remain available.
- Videos loop muted and inline. JavaScript only starts visible demos when reduced motion is off. Offscreen/hidden-document playback pauses; native manual pauses persist. **Pause demos** stops all players; **Play demos** explicitly resumes visible demos. Reduced-motion visitors start paused and can use native controls or explicitly enable playback.
- Actual video/source errors show the real interface still and an honest unavailable message. Do not use an initial `NETWORK_NO_SOURCE` state as an error: it can occur before source loading starts. Successful metadata restores a playable video and hides the fallback, including after an earlier error.
- Missing posters fall back to the real interface image. No fake Blender scenes or empty demo panels.
- Navigation needs no menu script. Native `details`/`summary`, visible focus, a skip link and textual inclusion labels remain keyboard accessible.

## Standalone HTML contract

`npm run export:standalone` writes the ignored `dist/bonesculpt-pro-standalone.html`. Preserve the exact stylesheet and deferred script tags expected by the builder. It validates references to all three guided MP4/WebP/poster sets before writing.

CSS, JavaScript, the interface screenshot, static posters and explicitly linked guide WebPs are embedded. **MP4 videos remain relative under `./media/`.** Keep the export beside that directory, or copy the MP4s with it. The HTML alone does not contain the videos. A dry run with `--check` validates generation without writing; it does not replace browser decoding checks.

## Validation and owner handoff

Run the syntax check, standalone dry run and export after source changes. Check local paths, internal anchors, ARIA references and external purchase destinations. In a browser, verify 320px, 390px, intermediate and desktop widths; all scene selections; actual decoding/seeking; native/manual/global pause; offscreen behavior; error-to-metadata recovery; and embed CTA visibility. Expand the details once to check controls and long identifiers at narrow widths.

Implementation QA uses T3 collaborative preview tools. The owner's server on 5174 may already be running: reuse it without stopping someone else's session. T3 snapshot/viewport failures should be reported accurately; same-origin responsive frame measurements can supplement DOM checks. Final visual QA and publication belong to the owner.

The page redesign preserves plugin originals and media files. The publishing handoff updates `superhive-embed.html` to a **3700px starting height**, replacing the old 18000px reservation. All three closed-details scenes measured 2566–3624px at 320, 390, 728, 1024 and 1280px widths. Replace the old snippet on Superhive to reduce the reserved empty area, and keep normal iframe scrolling for expanded details. The actual listing editor has not been changed. The existing direct fragments `superhive-video-clips.html` and `superhive-image-clips.html` remain separate alternatives.

Product facts come from `D:/Claude chats/vikas plugin/README.md`, `docs/USER_GUIDE.md`, `docs/BONE_SCULPT_GUIDE.md` and `bone_sculpt (8).py`. Support goes through Vikas Thakur's seller/support link on the buyer's Superhive purchase page. Retain GPL-3.0-or-later attribution. No testimonials, customer counts, performance promises or guarantees are asserted.
