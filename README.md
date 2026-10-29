# BoneSculpt PRO landing page

Buildless product page for **BoneSculpt PRO by Vikas Thakur**, based on the local **0.13.0 / Blender 5.0+** documentation. No dependencies, framework, remote fonts, analytics or simulated Blender controls.

## Local preview

Requires Node.js 20.11 or newer. No install or build is necessary.

```powershell
npm start
```

Open `http://127.0.0.1:5174`. Set `PORT` to use another port. The preview binds to loopback by default; set `HOST` explicitly if needed. The static server supports HEAD and byte ranges for native video playback and seeking. The deployable directory is `dist/`; `server.mjs` is a local preview helper.

## Source files

- `dist/index.html`: semantic product narrative, demo panels, brush field guide, controls, edition comparison, installation, rig limitations, FAQ and seller support.
- `dist/styles.css`: light off-white/orange editorial design, responsive layout, focus states, print and reduced-motion styles.
- `dist/app.js`: mobile navigation, current-section indicator, brush explanations and motion/media behavior.
- `dist/media/interface.webp`: A cropped native Blender 5.0.1 capture of BoneSculpt PRO 0.13.0 in a disposable, isolated 27-bone chain scene. The source capture is retained in the workspace media-work folder. No plugin UI was synthesized.
- `server.mjs`: dependency-free local static server.
- `build-standalone.mjs`: optional single-HTML export.

## Media contract / owner handoff

The owner supplies these **real product media** files. This implementation does not create, replace or download the video assets:

| Required path | Purpose |
| --- | --- |
| `dist/media/hero.mp4` | Main viewport posing overview |
| `dist/media/hero-poster.webp` | Static frame from `hero.mp4` |
| `dist/media/sculpt.mp4` | Brush-style bone-chain posing / refinement |
| `dist/media/sculpt-poster.webp` | Static frame from `sculpt.mp4` |
| `dist/media/collision.mp4` | Brush posing against mesh collision surfaces |
| `dist/media/collision-poster.webp` | Static frame from `collision.mp4` |
| `dist/media/onion.mp4` | Evaluated mesh onion-skin comparison |
| `dist/media/onion-poster.webp` | Static frame from `onion.mp4` |
| `dist/media/interface.webp` | Current Blender interface still; supplied by this implementation |

The media panels use a 2:1 stage, matching the available listing animations, with `object-fit: contain` so controls and rig content are not cropped. Other aspect ratios are letterboxed. Use browser-compatible MP4 (for example H.264 with yuv420p). There is no audio-dependent copy. The page notes that older demos may show an earlier UI; current requirements come from the local docs.

Available real source assets were inspected in `../media-work/bonesculpt-assets`, including `contact-sheet-public.jpg` and `01-gallery.webp`. The owner's converted `hero`, `sculpt`, `collision` and `onion` videos arrived during implementation and are referenced directly. The comparison clip under the brush field guide is explicitly labeled as the collision workflow. Brush selection changes the field guide text only, not the video. `brushes.mp4` is not required; `result.mp4` is also not used.

If a video fails to load, its panel displays the actual current interface screenshot with an explicit unavailable-preview message. Missing video posters also fall back to the screenshot. No blank demo cards or synthetic Blender visualizations are used.

## Interaction and accessibility

- Native video controls, muted looping inline playback. Videos autoplay only through JavaScript when in view and reduced motion is off. Offscreen/hidden-tab playback pauses. Native manual pauses are respected; “Pause demos” pauses all videos. Reduced-motion visitors start with motion paused and can explicitly choose playback.
- Native FAQ `details`/`summary`, keyboard-accessible brush explanation buttons and a polite text update region.
- Mobile navigation supports its toggle, Escape, link selection and outside clicks. The comparison table scrolls on narrow screens.
- `?embed=1` hides the site header, promotional purchase links and the closing purchase section. Internal navigation and seller-support links remain available. The same query works on the standalone export.
- Without JavaScript, the content, native FAQ and media controls remain usable, and a text summary covers all nine brushes.

## Standalone HTML

```powershell
npm run export:standalone
```

Creates `dist/bonesculpt-pro-standalone.html` with CSS, JavaScript, the actual interface screenshot and available video posters embedded. Missing posters use the interface still. **Videos remain relative** under `./media/`. Keep the export beside the media directory, or copy the videos with the HTML. Do not expect a single HTML file to contain the videos. Use `node build-standalone.mjs --check` to validate generation without writing the generated file.

## Checks

```powershell
npm run check
node build-standalone.mjs --check
```

The implementation handoff passed Node syntax checks, dry-run export, HTML local-asset/anchor/ARIA-reference checks and an in-memory local-server check covering HEAD, video byte ranges, invalid ranges, missing files and traversal rejection. No test files were added. Desktop/mobile visual QA and final media verification belong to the owner. No publication or changes to hosting configuration are performed by this implementation.

## Product copy sources

Source of truth: `D:/Claude chats/vikas plugin/README.md`, `docs/USER_GUIDE.md`, `docs/BONE_SCULPT_GUIDE.md`, and `bone_sculpt (8).py`. The page uses v0.13.0 / Blender 5.0+, nine PRO brushes, four Standard brushes and the documented controls. It includes the onion-sampling keyframe warning, ZIP installation through Preferences → Install from Disk, and rig-lock/constraint/connected-bone limitations. Pricing stays on Superhive; no sale, testimonial, customer count or performance guarantee is asserted.

Purchase and support destination: https://superhivemarket.com/products/bonesculptpro. Customer support is through Vikas Thakur’s seller/support link on the relevant Superhive purchase page.

## Public hosting and Superhive

Public page: https://aastik7.github.io/bonesculpt-pro-landing-page/
Superhive version: https://aastik7.github.io/bonesculpt-pro-landing-page/?embed=1

The GitHub Pages workflow in `.github/workflows/pages.yml` publishes `dist/`. Changes to `dist/` on `main` deploy automatically. You can also run the workflow manually from GitHub Actions.

Paste `superhive-embed.html` into the product description's HTML/code view. Its height is a starting value: preview on desktop and phone and adjust it for your listing. Keep Superhive's separate documentation/FAQ fields complete.

Final local validation: desktop/mobile layout, native video metadata/playback, all media and section references, brush selector, FAQ, mobile menu, global pause and embed mode. The source videos come from the creator's existing public listing; the current interface image is a new native Blender 5.0.1 capture of version 0.13.0. See `dist/media/media-sources.json` for provenance.
