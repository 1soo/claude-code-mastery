# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static Instagram card-news generator. Each topic ("episode") is turned into a deck of 4:5 (1000×1350) cards built with pure HTML/CSS, then captured to PNGs. There is no build step, framework, or test suite — just HTML files, a shared stylesheet, and a screenshot workflow. Decks are produced with the **`card-news` skill** (`.claude/skills/card-news/`); read its `SKILL.md` for the full authoring workflow.

## Structure

The project is organized as one folder per deck under `episodes/`, all sharing a single root stylesheet:

- `styles.css` — shared design system at the project root, used by **every** episode. Edit visual changes here, not in per-card files; a change reflows all decks.
- `episodes/YYMMDD_<topic-slug>/` — one deck. `260623_claude-tag/` is the reference episode. Each contains:
  - `sources/*.md` — source article(s) the card copy is derived from.
  - `card-N.html` — one card per file (cover, body pages, CTA). Each is a single `<section class="card">` linking `../../styles.css`. This one-card-per-file split exists specifically so each page renders exactly one 1000×1350 card at the top of the viewport — see the capture gotchas below for why.
  - `index.html` — all cards stacked in one page for quick visual preview. Self-contained (inline `<style>`), kept in sync by hand.
  - `output/` — captured PNGs (`01-cover.png`, `02-overview.png`, …), the final deliverable.

## Design system (styles.css)

Dark theme with an orange accent, driven by CSS custom properties on `:root` (`--ground`, `--accent #FF6B35`, plus `--blue/--purple/--pink/--green` for the numbered/flow accents). Korean type is Pretendard loaded from the jsDelivr CDN with a `"Malgun Gothic"` fallback. Reusable card components: `.eyebrow` + `.headline` header, `.feat` numbered cards, `.flow` step row, `.panel` checklist, `.banner` highlight box, plus `.cover` and `.cta` layouts. When adding a card, compose these existing classes rather than inventing new ones, and keep the `.card` box fixed at 1000×1350.

## Capturing cards to PNG (Playwright MCP)

`file://` is blocked, so serve over HTTP first. Note `python` on this machine is a non-functional Store stub — use `py`:

```bash
py -m http.server 8753    # serve the PROJECT ROOT so ../../styles.css resolves
```

Serve the project root (not an episode folder) — cards link `../../styles.css`, which only resolves with the root as server root. Then drive the `playwright` MCP server: navigate to `http://localhost:8753/episodes/<ep>/card-N.html`, capture each card into that episode's `output/`, and clean up `full.png` / `.playwright-mcp/` afterward.

The happy path: with a **fresh** Playwright MCP context (default `devicePixelRatio = 1`), navigate to a card and `take_screenshot` the `.card` element — it yields a correct, crisp 1000×1350 PNG directly. No zoom or cropping needed. Pass an absolute `filename` into the episode's `output/` dir (the MCP resolves relative filenames against the project root, not the served page).

Two non-obvious gotchas:

1. **Headless Chromium does not rasterize off-screen content** — capturing multiple cards from `index.html` yields solid-black images for cards below the fold. This is why cards live in separate files (one card per page, always on-screen).
2. **A large viewport resize permanently drops the context to `devicePixelRatio = 0.5`** (it persists across `browser_close`/navigation). Since `take_screenshot` forces `scale:'css'`, at dpr 0.5 it fills only the top-left device-pixel region and leaves the rest black. Avoid huge resizes. If you've already triggered it, the recovery is: set `document.querySelector('.card').style.zoom = '2'` via `browser_evaluate`, capture the element (a 2000×2700 PNG with the crisp full card in the top-left), then crop the top-left 1000×1350 with PIL (`py`, Pillow is installed) — do NOT downscale the full 2000×2700.

## MCP servers

Configured in `.mcp.json`: `playwright` (card capture), `context7` (library docs), `supabase`, `shadcn`, `sequential-thinking`, and `shrimp-task-manager` (writes to `shrimp_data/`).
