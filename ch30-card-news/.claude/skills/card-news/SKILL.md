---
name: card-news
description: >-
  Generate Instagram-style card-news decks (4:5, 1000×1350) from a source article
  using this project's dark/orange design system, then capture each card to PNG.
  Use this whenever the user wants to turn an article, blog post, announcement, release
  note, or any markdown/text source into a swipeable card deck, "카드뉴스", Instagram
  carousel, or social slides — even if they only say "이 글로 카드뉴스 만들어줘",
  "카드 만들어줘", "인스타 카드", or point at a source file or an episode folder. Also use it
  when asked to add or restyle a card so it matches the existing template, or to
  re-capture cards to PNG.
---

# Card-news generator

Turn a source article into a deck of 4:5 (1000×1350) Instagram cards that match this
project's template, then capture each card to PNG.

The whole point of this skill is **visual consistency**: every new deck should look like
it came from the same designer as the cards already in this repo. You achieve that not by
inventing layouts but by **composing the existing CSS components** in the shared
`styles.css` at the project root. The design system is fixed and shared across all decks;
only the words and which components you pick change.

## Project layout — one folder per deck

Each card-news deck ("episode") lives in its own folder so many topics coexist cleanly:

```
styles.css                      ← shared design system, edited here only
episodes/
  260623_claude-tag/            ← one episode = YYMMDD_<topic-slug>
    sources/<article>.md        ← source text this deck is built from
    card-1.html … card-N.html   ← the cards (each links ../../styles.css)
    index.html                  ← optional stacked preview
    output/01-cover.png …       ← captured PNGs, the deliverable
```

All episodes share the single root `styles.css`; every card links it via `../../styles.css`,
so one change to the design system reflows every deck. `episodes/260623_claude-tag/` is the
reference deck — open it any time you need to see how a finished episode looks.

## The pipeline

```
0. Set up the episode    → create/locate episodes/YYMMDD_<slug>/
1. Read the source       → understand the article, find its natural sections
2. Plan the deck         → map sections to card archetypes (cover → body → CTA)
3. Write card-N.html     → compose existing components, one card per file
4. Sync index.html       → (optional) stack all cards for preview
5. Capture to PNG        → serve project root, drive Playwright, save to the episode's output/
```

Don't skip the planning step. A good deck reads as a story: a hook (cover), 3–4 body
cards that each make **one** point, and a close (CTA). Cramming two ideas onto one card is
the most common way a deck stops looking like the template.

## Step 0 — Set up the episode

Every deck gets its own folder: `episodes/YYMMDD_<topic-slug>/`.

- **YYMMDD** = the source article's publish date if it has one, else today's date.
- **topic-slug** = a short lowercase-kebab tag for the topic (e.g. `claude-tag`, `dark-mode`).

If the user points at an existing episode — or asks to add/restyle a card in one — work inside
that folder. Otherwise create a new episode folder with `sources/` and `output/` subfolders,
and place the source article under its `sources/`. If the date or topic is ambiguous, confirm
the folder name with the user before creating it. Everything you produce in steps 3–5 lives
inside this one episode folder.

## Step 1 — Read the source

The source lives in the episode's `sources/` folder (or wherever the user points). Read it and
pull out: the headline concept, the publish date + author/source, an overview paragraph, the
2–4 key points or features, any process/steps, any availability/rollout details, and the
single most important takeaway (good banner material).

## Step 2 — Plan the deck

Pick card archetypes that fit the content. The reference deck has six; yours can have fewer
or more, but keep the **cover-first, CTA-last** spine. Typical mapping:

| Card | Archetype | When to use it |
|------|-----------|----------------|
| 1 | **Cover** | Always. The hook: kicker + big title + one-line sub. |
| 2 | **Lead / overview** | "What is it" — `.headline` + a `.lead` paragraph, often closed by a `.banner`. |
| 3 | **Numbered features** | 2–3 distinct features/benefits → `.feat` cards (blue/purple/pink), closed by a `.banner` takeaway. |
| 4 | **Flow + panel** | A process or sequence → `.flow` steps, plus a `.panel` checklist of details. |
| 5 | **Panel + banner** | Availability, pricing, "how to start" → `.panel` checklist + closing `.banner`. |
| 6 | **CTA** | Always last. Follow prompt + promo. Keep the existing branding (see below). |

Cards 3–5 are interchangeable — use whichever archetypes match the article. A short article
might be cover + 2 body + CTA. Don't pad to six; don't exceed ~7 (it stops being swipeable).

**Read `references/components.md` now** — it has the exact, copy-ready HTML for every
component (cover, lead, banner, feat-list, flow, panel, CTA) plus the shared chrome
(`.pageno`, `.arrow`, `.dots`). Compose from those snippets rather than writing markup from
scratch; that is what keeps decks on-template.

## Step 3 — Write card-N.html

One card per file inside the episode folder: `episodes/<ep>/card-1.html`, `card-2.html`, …
Each is a full HTML document with a single `<section class="card">`, linking the shared root
stylesheet via `../../styles.css`. **The one-card-per-file split is mandatory for capture** —
see Step 5 for why. Every file uses this exact head:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{deck name} · {NN} {card label}</title>
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css" />
<link rel="stylesheet" href="../../styles.css" />
</head>
<body>
  <!-- single .card section here -->
</body>
</html>
```

Copy writing rules that keep it on-brand:

- **Korean, concise, punchy.** Headlines are short noun phrases, not sentences. Body copy is
  trimmed to fit — the card is 1000px wide, ~5 lines max per text block. If it overflows,
  cut words, don't shrink type.
- **Fill the card — no dead space.** Each card is a fixed 1350px tall, so a body card with a
  short feature list or lead floating at the top, leaving the bottom third empty, looks broken
  next to the rest of the deck. The reference deck's fix is a closing `.banner`: a one-line
  takeaway with `margin-top:auto` that sinks to the bottom and balances the card. Cards 2, 3,
  and 5 of the reference deck all end this way. So **after a `.lead`, `.feat-list`, or `.flow`,
  add a `.banner` (or, for detail-heavy cards, a `.panel`) to anchor the bottom** unless the
  content already reaches near the bottom edge. Glance at each card at full height and ask "is
  the bottom third empty?" — if yes, you're missing a closer.
- **One orange accent per card.** Wrap the single most important term in `<span class="or">`
  in headlines, `<b>` for secondary emphasis in body text. Over-highlighting flattens the
  hierarchy.
- **`.dots` track position.** Every card ends with a `.dots` row of `<i>` equal to the deck
  length, with `class="on"` on the current card's index. Keep these in sync across the deck.
- **Page numbers + arrows** appear on body cards (not cover/CTA): `.pageno` shows `02`, `03`…
  and the `‹ ›` arrows are decorative.

After writing the cards, keep the root `styles.css` untouched unless the user asks for a design
change — visual edits belong there, never inline in the card files. Remember it is **shared by
every episode**, so editing it restyles all existing decks too; prefer adding a new class over
changing an existing one, and mention any change. Never fork the design by copying styles.css
into an episode.

## Step 4 — Sync index.html (optional)

The episode's `index.html` stacks every card on one page (with inline `<style>`) for a fast
scroll-through preview. It's kept in sync by hand. Update it only if the user wants the combined
preview; the PNGs are the real deliverable.

## Step 5 — Capture to PNG

`file://` is blocked, so serve over HTTP first. **`python` on this machine is a broken Store
stub — use `py`:**

```bash
py -m http.server 8753    # serve the PROJECT ROOT (not the episode) so ../../styles.css resolves; run in background
```

Serve the **project root**, not the episode folder — the cards link `../../styles.css`, which
only resolves if the root is the server root. Then drive the **`playwright` MCP** server. The
happy path, with a **fresh** Playwright context (default `devicePixelRatio = 1`):

1. `browser_navigate` to `http://localhost:8753/episodes/<ep>/card-N.html`
2. `browser_take_screenshot` of the `.card` element (element screenshot, not full page)
3. Save to the episode's `output/NN-label.png` — use an **absolute path** to the episode's
   `output/` dir (the MCP resolves relative screenshot filenames against the project root, not
   the served page), e.g. `…/episodes/<ep>/output/01-cover.png`

That yields a crisp 1000×1350 PNG directly — no zoom or crop needed. Repeat for each card.
Afterward, clean up `full.png` and the `.playwright-mcp/` directory.

Two non-obvious gotchas (read `references/capture.md` for the full recovery procedure):

1. **Headless Chromium does not rasterize off-screen content.** Capturing multiple cards from
   `index.html` gives solid-black images below the fold — this is *why* cards are one-per-file.
2. **A large viewport resize permanently drops the context to `devicePixelRatio = 0.5`** and
   persists across navigation/close, which makes screenshots fill only the top-left and leave
   the rest black. Avoid big resizes. If it already happened, see `references/capture.md`.

## CTA branding (defaults)

Keep the existing branding unless the user changes it: the `@` avatar, the `팔로우하기`
button, and the promo block (`클로드 완벽 마스터` / `실무에서 바로 쓰는 AI 협업 가이드`).
These are the channel's identity and should stay consistent across decks. Only the CTA
headline/sub copy adapts to the article's topic.

## Output naming

PNGs land in the episode's `output/`, numbered with a two-digit prefix and a short English
label describing the card's role: `01-cover.png`, `02-overview.png`, `03-features.png`,
`04-access.png`, `05-availability.png`, `06-cta.png`. Match the order of the deck.
