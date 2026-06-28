# Capturing cards to PNG — full procedure & recovery

The deliverable is one crisp 1000×1350 PNG per card in the episode's `output/` folder. Capture
is done with the `playwright` MCP server against a local HTTP server (Chromium blocks
`file://`). Cards link the shared stylesheet via `../../styles.css`, so the HTTP server must be
rooted at the **project root** (not the episode folder) for the styles to load.

## Why one card per file

Headless Chromium **does not rasterize off-screen content**. If you stack all cards in one page
(like `index.html`) and screenshot them, every card below the fold comes out solid black. So
each card lives in its own HTML file, rendering exactly one `.card` at the top of the viewport,
always on-screen. Capture each file separately.

## Happy path

Use a **fresh** Playwright MCP context (default `devicePixelRatio = 1`). Do not resize the
viewport large before capturing.

1. Serve the project root over HTTP (run in background; `python` is a broken stub — use `py`):

   ```bash
   py -m http.server 8753
   ```

2. For each card:
   - `browser_navigate` → `http://localhost:8753/episodes/<ep>/card-N.html`
   - `browser_take_screenshot` of the **`.card` element** (element screenshot). Pass an
     **absolute** `filename` into the episode's `output/` dir (e.g.
     `…/episodes/<ep>/output/NN-label.png`) — the MCP resolves relative filenames against the
     project root, not the served page, so a relative name lands in the wrong place.
     `take_screenshot` forces `scale:'css'`, which at dpr 1 captures the full 1000×1350 element
     crisply.

3. **Verify each PNG is exactly 1000×1350** (e.g. `py -c "from PIL import Image;
   print(Image.open(r'…').size)"`). If it isn't, you hit the dpr trap below — fix it before
   moving on; a 2000×2700 or black-filled PNG is a broken deliverable, not a usable one.

4. After all cards, stop the HTTP server and delete `full.png` and `.playwright-mcp/` if they
   were created.

## The devicePixelRatio trap (when a capture isn't 1000×1350)

The Playwright MCP context can sit at a `devicePixelRatio` other than 1 — a large
`browser_resize` permanently drops it to **0.5**, and some contexts start at **2**. Either way
`take_screenshot` forces `scale:'css'` and the result isn't a clean 1000×1350. Prevention:
start a **fresh** context and never do a big viewport resize. If a capture comes out wrong,
identify which case you're in by looking at the PNG, then fix it — don't ship it as-is.

**Case A — dpr < 1 (e.g. 0.5): black fill.** The card renders into only the top-left region and
the rest of an oversized canvas is solid black. Recover by zooming, then cropping:

1. Zoom the card 2× in the page (via `browser_evaluate`): `document.querySelector('.card').style.zoom = '2';`
2. `browser_take_screenshot` the `.card` element → the crisp full card sits in the **top-left**.
3. Crop the top-left 1000×1350 with PIL (`py`; Pillow is installed). **Crop, do not downscale.**

   ```python
   from PIL import Image
   Image.open(r"full.png").crop((0, 0, 1000, 1350)).save(r"…/episodes/<ep>/output/NN-label.png")
   ```

**Case B — dpr = 2: uniformly 2× scaled.** The whole card is captured correctly but at
2000×2700 (the full card, no black). Just downscale 50% to spec:

```python
from PIL import Image
Image.open(r"full.png").resize((1000, 1350), Image.LANCZOS).save(r"…/episodes/<ep>/output/NN-label.png")
```

The difference matters: cropping a Case-B 2000×2700 would keep only the top-left **quarter** of
the card, and downscaling a Case-A black-filled image would shrink the black too. Check whether
the full card is present before choosing crop vs downscale. The clean fix is always a brand-new
context at dpr 1, where neither case happens.
