# Component library (copy-ready HTML)

Every snippet below is a real component defined in `styles.css`. Compose cards from these;
don't invent markup. Each card is one `<section class="card">…</section>` placed in `<body>`
of a full HTML document (see SKILL.md Step 3 for the head boilerplate).

Available accent colors (CSS custom properties): `--accent` orange (#FF6B35, the primary),
plus `--blue`, `--purple`, `--pink`, `--green` for the numbered/flow accents. Use orange as
the through-line; the others differentiate items within a list.

## Table of contents
- [Shared chrome](#shared-chrome) — pageno, arrows, dots
- [Cover](#cover) — first card
- [Body header](#body-header) — eyebrow + headline
- [Lead](#lead) — overview paragraph
- [Banner](#banner) — highlight box
- [Feature list](#feature-list) — numbered cards
- [Flow](#flow) — step sequence
- [Panel](#panel) — checklist box
- [CTA](#cta) — last card

---

## Shared chrome

Body cards (everything except cover and CTA) carry a page number, decorative side arrows, and
the dots progress row. The cover and CTA carry only `.dots`.

```html
<span class="pageno">02</span>
<span class="arrow left" aria-hidden="true">‹</span>
<span class="arrow right" aria-hidden="true">›</span>
```

**Dots** sit at the bottom of every card. Put one `<i>` per card in the deck; mark the current
one with `class="on"`. For a 6-card deck, card 3 looks like:

```html
<div class="dots" aria-hidden="true">
  <i></i><i></i><i class="on"></i><i></i><i></i><i></i>
</div>
```

---

## Cover

The hook. `.cover` centers content vertically and adds the giant watermark `@` and a glow.
Kicker (uppercase label) → big title with one `.or` accent → one-line sub → meta (date · source).

```html
<section class="card cover" aria-label="커버">
  <div class="glow" aria-hidden="true"></div>
  <div class="at" aria-hidden="true">@</div>
  <span class="kicker">Introducing</span>
  <h1 class="big">
    Slack 팀원이 된<br />
    <span class="or">Claude Tag</span>
  </h1>
  <p class="sub">
    채널 · 도구 · 데이터에 접근하는<br />
    하나의 <b>'AI 팀원'</b>이 대화에 합류합니다.
  </p>
  <div class="meta">2026.06.23 · ANTHROPIC</div>
  <div class="dots" aria-hidden="true">
    <i class="on"></i><i></i><i></i><i></i><i></i><i></i>
  </div>
</section>
```

The watermark `@` is a stylistic signature — keep it (or swap for another single glyph that
suits the topic, e.g. `#`, `▲`). `.kicker` is a short English/Latin label; the `.big` title is
the Korean hook.

---

## Body header

Opens every body card. `.eyebrow` is a small uppercase English label; `.headline` is the Korean
title (use `<br />` to control line breaks, `<span class="or">` for the one accented term).

```html
<div class="body-head">
  <div class="eyebrow">What is it</div>
  <h2 class="headline">Claude Tag란?</h2>
</div>
```

With an accent and a line break:

```html
<div class="body-head">
  <div class="eyebrow">Admin control</div>
  <h2 class="headline">관리자가<br /><span class="or">모든 접근을 제어</span></h2>
</div>
```

---

## Lead

A readable overview paragraph. Use `<br /><br />` for paragraph breaks, `<b>` for emphasis,
`<span class="or">` for the single hottest term. Keep to ~4–5 lines.

```html
<p class="lead">
  Claude와 함께 일하는 <b>새로운 협업 방식</b>입니다.<br /><br />
  처음에는 <span class="or">Slack</span>에서 출시되며, 선택한
  <b>채널 · 도구 · 데이터 · 코드베이스</b>에 접근할 수 있는
  하나의 <b>'팀원'</b>처럼 동작합니다.
</p>
```

---

## Banner

A centered highlight box for the card's one-line takeaway. `margin-top:auto` pushes it to the
bottom of the card, so it works as a closing statement under a lead or feature list.

```html
<div class="banner">시간이 지날수록 학습하는 AI 팀원</div>
```

This is the deck's standard tool for **filling vertical space**: a `.lead`, `.feat-list`, or
`.flow` rarely reaches the bottom of the 1350px card on its own, and a card with an empty
bottom third looks off-template. Distill the card's point into one line and drop a `.banner`
after the main content — it sinks to the bottom and anchors the layout. The reference deck does
this on its overview, features, and availability cards.

---

## Feature list

2–3 numbered cards, each a distinct point. Cycle the accent classes `c-blue` → `c-purple` →
`c-pink` in order. Each `.feat` has a number badge, an `<h3>` title, and a `<p>` with one
`<span class="hl">` highlight.

```html
<div class="feat-list">
  <div class="feat c-blue">
    <span class="num">01</span>
    <div class="txt">
      <h3>능동적인 지원</h3>
      <p>주변 맥락을 인지해 <span class="hl">알아야 할 내용을 먼저</span> 알려줍니다.</p>
    </div>
  </div>
  <div class="feat c-purple">
    <span class="num">02</span>
    <div class="txt">
      <h3>비동기 작업</h3>
      <p>맡겨두면 <span class="hl">혼자 처리</span>하고, 긴 기간에 걸쳐 스스로 일정도 잡습니다.</p>
    </div>
  </div>
  <div class="feat c-pink">
    <span class="num">03</span>
    <div class="txt">
      <h3>다이렉트 메시지</h3>
      <p>개인용 도구를 사용해 <span class="hl">1:1로 직접</span> 답변합니다.</p>
    </div>
  </div>
</div>
```

Two features? Use `c-blue` + `c-purple` and stop. The cards grow a little but won't fill the
card on their own — close the card with a `.banner` (see below) so the bottom isn't empty. The
reference features card ends with `<div class="banner">팀 대화에 끊김 없이 합류</div>`.

---

## Flow

A horizontal step sequence with `→` separators. Each `.step` has a number `.n` and a short
two-line label `.l`. Cycle `s-blue` → `s-purple` → `s-green` → `s-pink`. Best for 3–4 steps.

```html
<div class="flow">
  <div class="step s-blue"><div class="n">01</div><div class="l">접근<br />제어</div></div>
  <div class="sep">→</div>
  <div class="step s-purple"><div class="n">02</div><div class="l">인스턴스<br />분리</div></div>
  <div class="sep">→</div>
  <div class="step s-green"><div class="n">03</div><div class="l">토큰<br />한도</div></div>
  <div class="sep">→</div>
  <div class="step s-pink"><div class="n">04</div><div class="l">활동<br />로그</div></div>
</div>
```

---

## Panel

A boxed checklist. A small `.tag` label, an `<h4>` title, then `.rows` where each `<div>` gets
a `✓` automatically. Use `<b>` to emphasize key terms in each row.

```html
<div class="panel">
  <span class="tag">CONTROL</span>
  <h4>채널마다 권한을 다르게</h4>
  <div class="rows">
    <div>어떤 <b>채널</b>에서 어떤 <b>도구 · 정보</b>에 접근할지 직접 제어</div>
    <div>기능별로 서로 다른 <b>Claude 인스턴스</b> 생성 가능</div>
    <div><b>토큰 사용량 한도</b> 설정과 <b>활동 로그</b> 기록 포함</div>
  </div>
</div>
```

A flow + panel pair, or a panel + banner pair, fills a body card nicely.

---

## CTA

The closing card. `.cta` layout: eyebrow → `.cta-h` headline (one `.or` accent) → `.cta-sub` →
avatar → follow button → promo block. Keep the branding constant across decks (see SKILL.md).
Only the `.cta-h` / `.cta-sub` copy adapts to the article topic.

```html
<section class="card cta" aria-label="팔로우 안내">
  <div class="glow" aria-hidden="true" style="top:120px;left:50%;transform:translateX(-50%);"></div>
  <div class="eyebrow">Start now</div>
  <h2 class="cta-h">AI 협업,<br /><span class="or">더 깊이 알고 싶다면</span></h2>
  <p class="cta-sub">
    저장하고 팔로우해두면<br />
    <b>새로운 AI 활용법</b>을 가장 빠르게 받아볼 수 있어요.
  </p>
  <div class="avatar" aria-hidden="true">@</div>
  <span class="follow">팔로우하기</span>
  <div class="promo">
    <div class="thumb">CLAUDE<br />MASTER</div>
    <div class="pin">
      <span class="badge">신규 콘텐츠</span>
      <h5>클로드 완벽 마스터</h5>
      <p>실무에서 바로 쓰는 AI 협업 가이드</p>
    </div>
  </div>
  <div class="dots" aria-hidden="true">
    <i></i><i></i><i></i><i></i><i></i><i class="on"></i>
  </div>
</section>
```
