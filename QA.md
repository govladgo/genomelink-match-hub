# Match Hub — QA checklist

A walk-through QA list for the prototype at https://genomelink-match-hub.vercel.app.
Every `- [ ]` is one verifiable assertion. Tick the box once you've confirmed.

> Cross-references: implementation details and rationale live in [DEV_HANDOFF.md](./DEV_HANDOFF.md).
> Figma source of truth: [DNA-Match-Tools](https://www.figma.com/design/oDsDML1fSeKbrIFqAjurDN/DNA-Match-Tools).

---

## How to run this QA

**Tools you need.** Just a Chromium-based browser with DevTools (for device-mode + console) and a keyboard.

**Three viewport passes.** Walk the whole list once at each:
1. **Desktop** — 1440 × 900 (or any width ≥ 1312 to see the 3-column tools grid).
2. **Tablet** — 768 × 1024 (DevTools → iPad).
3. **Mobile** — 375 × 812 (DevTools → iPhone 12 Pro). Re-test sections **H** and **I** here specifically.

**Reset state between checks.** Decisions don't persist. To start fresh: hard-reload (`Cmd/Ctrl + Shift + R`) and strip the `?user=` query param from the URL.

**Demo users.** The header switcher has 10 prebuilt users; any duplicate-group test should be reproducible by re-selecting the same user. If a behaviour seems user-specific, note the user id (e.g. `user-3`).

**Filing failures.** Open a GitHub issue at `govladgo/genomelink-match-hub` with the `QA` label, the failing checklist item id (e.g. `C.6.f`), browser + viewport, and a screenshot.

---

## A. Routing & smoke

Routes per [DEV_HANDOFF.md → Routes](./DEV_HANDOFF.md#routes).

- [ ] **A.1** `/` loads in under 2 s, shows the tools selector page (no flash of unstyled content).
- [ ] **A.2** `/match-hub` loads, shows the hub with the active demo user.
- [ ] **A.3** `/match-hub/help` loads, shows the help card.
- [ ] **A.4** `/match-hub/migrate` returns the standard 404 page (no flash of an old wizard).
- [ ] **A.5** A made-up route like `/foo` returns 404.
- [ ] **A.6** Direct-typing each of the 4 valid URLs into the address bar works (not only via in-app links).
- [ ] **A.7** Browser **Back** after navigating Tools selector → Match Hub returns to `/`; **Forward** goes back to `/match-hub`.
- [ ] **A.8** Reloading on `/match-hub/help` keeps you on the help page (no redirect back to `/`).
- [ ] **A.9** Visiting `/match-hub?user=user-7` selects user-7 in the switcher on first paint.
- [ ] **A.10** Visiting `/match-hub?user=foo-bar` (invalid id) silently falls back to the first user — no error toast, no blank screen.
- [ ] **A.11** Switching users updates the URL to `?user=user-N` without a full page reload.

---

## B. Tools selector page (`/`)

Source: `app/page.tsx`. Figma: `12291:4738` (desktop) / `12291:4764` (mobile).

- [ ] **B.1** "DNA Matches" h1 renders at 32 px / 36 line-height.
- [ ] **B.2** PRO badge sits to the right of the h1: dark `#263856` bg, white uppercase `PRO`, ~66 × 36 px, radius 8.
- [ ] **B.3** List/Tools sub-pill renders top-right with **Tools** as the active tab (white card + drop-shadow).
- [ ] **B.4** List/Tools sub-pill is purely visual — clicking either label does nothing.
- [ ] **B.5** **6 cards** render in this order: Network Graph, Clusters, Match Hub, Common Ancestor cM, DNA Painter, Family Tree.
- [ ] **B.6** Network Graph card has the dataflow icon + "Open network" outlined button.
- [ ] **B.7** Clusters card has the dataflow-03 icon + "View clusters" outlined button.
- [ ] **B.8** Match Hub card has the **users-01** icon + "View Hub" outlined button. Clicking the button navigates to `/match-hub`.
- [ ] **B.9** Common Ancestor cM card shows an orange `COMING SOON` badge, no button, link-04 icon.
- [ ] **B.10** DNA Painter card shows `COMING SOON` badge, no button, dna-01 icon.
- [ ] **B.11** Family Tree card shows `COMING SOON` badge, no button, dataflow-01 icon.
- [ ] **B.12** Working cards (Network Graph, Clusters, Match Hub) are all 416 px wide on desktop.
- [ ] **B.13** Coming-soon cards visually shorter than working cards (no button row).
- [ ] **B.14** Card hover state on the Match Hub button: bg becomes very subtle blue `rgba(38, 56, 86, 0.04)`.
- [ ] **B.15** Clicking anywhere on a coming-soon card does **nothing** (no navigation, no console error).
- [ ] **B.16** Clicking the "Open network" or "View clusters" button does nothing (placeholders → `#`).

---

## C. Match Hub (`/match-hub`)

Source: `app/match-hub/page.tsx`. Figma: `12292:21156` (Duplicates) / `12292:27433` (Assessed).

### C.1 User loading

- [ ] **C.1.a** On first paint, "Loading matches…" hint card is visible briefly, then disappears.
- [ ] **C.1.b** Stat cards populate to non-zero values within ~1 s on a fresh load.
- [ ] **C.1.c** With no `?user` param, the first user from the index is selected by default.
- [ ] **C.1.d** Network tab shows `index.json` and `user-N.json` requested from `/data/`.
- [ ] **C.1.e** No 4xx / 5xx responses on initial load.
- [ ] **C.1.f** With JS network throttled to "Slow 4G", the loading hint stays visible during fetch (no FOUC).

### C.2 UserSwitcher

Source: `components/UserSwitcher.tsx`.

- [ ] **C.2.a** UserSwitcher button is visible to the right of the active user's display name.
- [ ] **C.2.b** Clicking the switcher opens a dropdown listing **all 10** demo users.
- [ ] **C.2.c** Each row in the dropdown shows: avatar with initials, display name, population label, total match count.
- [ ] **C.2.d** The currently active user has a tinted background (`rgba(38, 56, 86, 0.06)`) and a green checkmark on the right.
- [ ] **C.2.e** Clicking outside the dropdown closes it.
- [ ] **C.2.f** Selecting a different user closes the dropdown, updates the URL `?user=user-N`, refetches data, and re-runs dedup.
- [ ] **C.2.g** Selecting the *same* user closes the dropdown and does not refetch.
- [ ] **C.2.h** Switching users mid-decision clears all per-record decisions (Merged stat resets to 0 for the new user).

### C.3 Identity + stats row

Figma: `12292:21168`.

- [ ] **C.3.a** User name renders at 20 px semibold `#263856`.
- [ ] **C.3.b** Subtitle renders as `{Population label} | Kit: {synthetic kit id}` at 16 px regular `#6786AC`.
- [ ] **C.3.c** Synthetic kit id matches the pattern `\d{2}-[A-F0-9]{6}` (e.g. `24-A4F2C9`).
- [ ] **C.3.d** The kit id is stable across reloads for the same user.
- [ ] **C.3.e** Stat card **Total entries** equals the user's match count (cross-check with the dataset JSON).
- [ ] **C.3.f** Stat card **Vendors** is between 1 and 5 (distinct vendor count).
- [ ] **C.3.g** Stat card **Duplicates** equals the number of duplicate groups detected.
- [ ] **C.3.h** Stat card **Merged** starts at `0` for a fresh user.
- [ ] **C.3.i** After merging one sibling, **Merged** increments to `1` live (no reload needed).
- [ ] **C.3.j** Each stat card is 112 px wide, has a tinted gray bg `rgba(201, 214, 228, 0.20)`, radius 12.

### C.4 Tabs

- [ ] **C.4.a** "Duplicates Matches" h3 (20/28) sits left of the tab pill.
- [ ] **C.4.b** Tab pill has gray-60 track `rgba(201, 214, 228, 0.6)`, 4 px padding, radius 16.
- [ ] **C.4.c** **Duplicates** tab is active by default; white card + drop-shadow.
- [ ] **C.4.d** Tab labels include counts in parentheses, e.g. `Duplicates (12)` and `Assessed (2)`.
- [ ] **C.4.e** Each tab has its icon prefix: copy-06 for Duplicates, check-circle for Assessed.
- [ ] **C.4.f** Clicking **Assessed** switches the visible group list.
- [ ] **C.4.g** Clicking **Duplicates** switches back.
- [ ] **C.4.h** When all groups are assessed, the Duplicates tab body shows: *"All duplicate groups have been assessed. Switch to the Assessed tab to review them."*
- [ ] **C.4.i** When zero groups are assessed yet, the Assessed tab body shows: *"No groups have been assessed yet. Decide each candidate in the Duplicates tab."*
- [ ] **C.4.j** When the user has zero duplicate groups, the Duplicates tab shows: *"No duplicates detected across your matches."*

### C.5 Group card header

Source: `components/hub/DuplicateGroupCard.tsx`. Figma: `12327:2058`.

- [ ] **C.5.a** Card has white bg, 1 px border `rgba(201, 214, 228, 0.6)`, radius 12, padding 24.
- [ ] **C.5.b** **No 48 px avatar** in the header (post-Figma-12327 change — name + cM only).
- [ ] **C.5.c** Title is cM-led: `~XX.X cM · N candidates` (e.g. `~35.1 cM · 2 candidates`).
- [ ] **C.5.d** Subtitle is exactly `N vendors` — no "matched on cM + segments" suffix.
- [ ] **C.5.e** Hovering the subtitle shows a tooltip with the actual basis (e.g. `Grouped by cM + segments`).
- [ ] **C.5.f** Confidence percentage on the right (16 px semibold), values between 70% and 99%.
- [ ] **C.5.g** Chevron-down icon to the right of the percentage.
- [ ] **C.5.h** Clicking anywhere on the header collapses the card; clicking again expands.
- [ ] **C.5.i** Chevron rotates 180° between expanded/collapsed.
- [ ] **C.5.j** When member names diverge across the group, an orange `NAME VARIES` badge appears next to the title.
- [ ] **C.5.k** When all members share the same name spelling, no `NAME VARIES` badge.
- [ ] **C.5.l** Hovering the `NAME VARIES` badge shows tooltip listing the distinct spellings.

### C.6 Member rows + per-record decisions

State machine: see [DEV_HANDOFF.md → Per-record decision state machine](./DEV_HANDOFF.md#per-record-decision-state-machine-hooksusededuplicationts).

- [ ] **C.6.a** First row is the primary, marked with an orange `PRIMARY` pill, no action buttons.
- [ ] **C.6.b** Each row shows a 32 px avatar with initials and the user's avatar colour.
- [ ] **C.6.c** Member name renders at 14/20 semibold `#263856`.
- [ ] **C.6.d** Vendor pill is the **outlined** variant: white bg, `#C9D6E4` border, brand-coloured 10 px text, radius 4.
- [ ] **C.6.e** Sub-line under the name is exactly `{cM} cM · {N} seg · {relationship}`.
- [ ] **C.6.f** Pending sibling shows two action buttons: **Dismiss** (outlined) + **Merge** (orange filled), 120 px each, radius 32.
- [ ] **C.6.g** Clicking **Merge** on a sibling: row bg turns light green `rgba(122, 191, 67, 0.10)`, status pill changes to green `MERGED`, action buttons replaced by a single outlined **Undo**.
- [ ] **C.6.h** Clicking **Dismiss** on a sibling: row identity column dims to 50% opacity, name strikes through, status pill changes to gray `NOT A DUPLICATE`, action buttons replaced by **Undo**.
- [ ] **C.6.i** Clicking **Undo** on a merged row reverts it to pending (Dismiss + Merge return).
- [ ] **C.6.j** Clicking **Undo** on a dismissed row reverts it to pending.
- [ ] **C.6.k** Decisions inside one group don't affect siblings in another group.
- [ ] **C.6.l** Group with 3+ siblings: merge one + dismiss another + leave third pending → the group **stays in Duplicates** tab (one sibling pending).
- [ ] **C.6.m** Decide all siblings (any combination of merged/rejected) → group moves to **Assessed** tab.
- [ ] **C.6.n** From Assessed tab, click Undo on any sibling → group moves back to **Duplicates**.
- [ ] **C.6.o** Merging a sibling increments the **Merged** stat by exactly 1.
- [ ] **C.6.p** Dismissing a sibling does **not** increment the Merged stat.
- [ ] **C.6.q** Undoing a merge decrements the Merged stat by exactly 1.
- [ ] **C.6.r** Header click (to collapse the group) doesn't accidentally fire a sibling button (clicks don't bubble).

### C.7 Primary selection

Source: `utils/dedupEngine.ts` (search for `VENDOR_RANK`). Logic: highest cM → most segments → vendor preference (`FTDNA > MyHeritage > GEDmatch > 23andMe > Ancestry`) → lowest id.

- [ ] **C.7.a** In any group, the row marked `PRIMARY` has the highest `sharedCM` of all members.
- [ ] **C.7.b** When two members tie on cM, the primary has at least as many segments as the other.
- [ ] **C.7.c** When cM and segments tie, the primary's vendor outranks the other's per the order above (e.g. FTDNA wins over Ancestry).
- [ ] **C.7.d** Re-selecting the same user produces the same primary (deterministic).
- [ ] **C.7.e** The PRIMARY pill is orange (`rgba(255, 124, 17, 0.10)` bg, `#FF7C11` text).

### C.8 Empty / loading / error states

- [ ] **C.8.a** Loading hint card has padding 32, centered text, gray `var(--gl-color-text-muted)`.
- [ ] **C.8.b** When no duplicate groups exist (synthetic test: a user with all distinct vendors), Duplicates tab shows the "No duplicates detected" empty state.
- [ ] **C.8.c** With network offline, the load attempt logs a console error (`Failed to load user data`) — no crash.
- [ ] **C.8.d** Demo disclaimer footer renders at the bottom: *"Demo: real DNA-pair data; names, ancestry, and vendor assignments are synthesized."*

---

## D. Help page (`/match-hub/help`)

Source: `app/match-hub/help/page.tsx`. Figma: `12307:2027` / `12308:2435`.

- [ ] **D.1** GenomelinkHeader and Match Hub sub-header render identically to the hub page.
- [ ] **D.2** Sub-header back link reads **"Back to hub"** (not "Back to tools").
- [ ] **D.3** Clicking "Back to hub" navigates to `/match-hub`.
- [ ] **D.4** Sub-header centre shows `users-01` icon + `Match Hub` title.
- [ ] **D.5** Right side of sub-header shows help-circle + "How it works?".
- [ ] **D.6** Help card is on `#F9FCFF` page bg, white, with 1 px gray-60 border, radius 12, padding 48/192 (collapsed at narrower widths).
- [ ] **D.7** All sections render in order: Intro / Quick start / Reference (TOC) / Cross-vendor / Vendors / Why differ / Tabs / How grouped (with table) / Confidence / Why cM (with callout) / Reviewing groups (with primary list + lifecycle callout) / Demo data / Performance / Glossary.
- [ ] **D.8** The TOC has two columns at desktop, single column at mobile.
- [ ] **D.9** TOC links are orange `#FF7C11` 16 px regular.
- [ ] **D.10** Clicking a TOC link scrolls to that section's heading.
- [ ] **D.11** "How matches are grouped" table has 3 columns (Step / Computation / Role).
- [ ] **D.12** Table header has tinted blue bg `rgba(122, 184, 255, 0.10)`.
- [ ] **D.13** Three callouts (`TIP`, `THE NEW MODEL`, `GROUP LIFECYCLE`) render with light-blue bg (`rgba(122, 184, 255, 0.10)`), 1 px border `rgba(122, 184, 255, 0.30)`, radius 16, padding 20.
- [ ] **D.14** Callout label text colour is `#8FABCF` (uppercase 12/16 semibold) — not navy or orange.
- [ ] **D.15** Reviewing groups section explains primary selection in a 4-step ordered list (cM → segments → vendor → id).
- [ ] **D.16** Glossary "Primary record" entry mentions the `FTDNA > MyHeritage > GEDmatch > 23andMe > Ancestry` vendor order.
- [ ] **D.17** Bottom CTA "Open the inbox" button: orange `#FF7C11`, 216 px wide, padding 14/24, radius 32, uppercase 14 px medium white.
- [ ] **D.18** Hovering the CTA darkens it to `#f2690b`.
- [ ] **D.19** Clicking the CTA navigates to `/match-hub`.

---

## E. Migrate route (`/match-hub/migrate`)

Source: `app/match-hub/migrate/page.tsx`.

- [ ] **E.1** Visiting `/match-hub/migrate` renders Next's standard 404 page.
- [ ] **E.2** Page does **not** flash the old migration wizard before showing 404.
- [ ] **E.3** No console errors logged when hitting the route.

---

## F. Genomelink top header

Source: `components/layout/GenomelinkHeader.tsx`. Figma: `11364:6865`.

- [ ] **F.1** Logo X-mark + Genomelink wordmark on the left.
- [ ] **F.2** Header height is 80 px on desktop, has bg `#F9FCFF`.
- [ ] **F.3** 5 nav items in order: HOME, TRAITS, REPORTS, GENEALOGY, BONUS.
- [ ] **F.4** HOME has the active underline (2 px dark line beneath the label).
- [ ] **F.5** TRAITS shows a chevron-down + 6 px orange notification dot.
- [ ] **F.6** GENEALOGY shows a chevron-down + 6 px orange notification dot.
- [ ] **F.7** REPORTS and BONUS render plain (no chevron, no dot).
- [ ] **F.8** Right side: "Upgrade to unlock 312+ traits" copy + UPGRADE button (orange, 127 px, radius 32) + 24 px gradient avatar + chevron-down.
- [ ] **F.9** Nav items, UPGRADE button, and avatar are visual-only (no clicks navigate or open menus).

---

## G. Match Hub sub-header

Source: `components/layout/MatchHubSubHeader.tsx`. Figma: `12292:21249` / `12292:21254` / `12292:22163`.

- [ ] **G.1** On `/match-hub`, left-side back link reads "Back to tools" with a left-arrow icon.
- [ ] **G.2** "Back to tools" navigates to `/`.
- [ ] **G.3** Centre shows `users-01` icon (24 px) + "Match Hub" title at 24/32 semibold `#263856`.
- [ ] **G.4** Right side shows help-circle (18 px) + "How it works?".
- [ ] **G.5** Clicking "How it works?" navigates to `/match-hub/help`.
- [ ] **G.6** On `/match-hub/help`, back link reads "Back to hub" and navigates to `/match-hub`.

---

## H. Mobile responsive

Test each at the listed viewport in DevTools device-mode.

### H.1 Top header

- [ ] **H.1.a** ≤ 1100 px: nav gap shrinks; "Upgrade to unlock 312+ traits" copy hides.
- [ ] **H.1.b** ≤ 900 px: header drops to 64 px tall; nav fully hidden; padding reduces to 16 px.
- [ ] **H.1.c** ≤ 600 px: Genomelink wordmark hides; only the colourful X-mark + UPGRADE + avatar render.
- [ ] **H.1.d** No horizontal scroll at 320 / 375 / 414 px viewport.

### H.2 Sub-header

- [ ] **H.2.a** ≤ 900 px: subheader becomes a 2-row grid.
- [ ] **H.2.b** Row 1: "Back to tools" left, "How it works?" right (justified to grid edges).
- [ ] **H.2.c** Row 2: users-01 + "Match Hub" title, left-aligned, full-width.
- [ ] **H.2.d** Title font-size shrinks to 22/28 at this breakpoint.

### H.3 Tools selector

- [ ] **H.3.a** ≤ 900 px: cards stack to a single column.
- [ ] **H.3.b** ≤ 900 px: container padding becomes 24/20.
- [ ] **H.3.c** ≤ 600 px: card padding shrinks to 16; button shrinks to 8/16 padding, 12 px text, 16 px arrow icon.

### H.4 Match Hub page

- [ ] **H.4.a** ≤ 900 px: top row stacks (identity block first, stats grid below).
- [ ] **H.4.b** ≤ 900 px: identity row stacks (name on row 1, UserSwitcher on row 2).
- [ ] **H.4.c** ≤ 900 px: stats becomes a **2 × 2 grid** (1737/5 on top, 14/0 on bottom).
- [ ] **H.4.d** ≤ 900 px: container padding reduces to 16.
- [ ] **H.4.e** ≤ 600 px: in a duplicate group's member row, the action buttons (Dismiss / Merge) wrap to a new full-width row beneath the identity column.
- [ ] **H.4.f** ≤ 600 px: action buttons no longer clip vendor pills.

### H.5 Help page

- [ ] **H.5.a** ≤ 1100 px: card padding collapses from 48/192 to 40/64.
- [ ] **H.5.b** ≤ 900 px: card padding becomes 24; container padding becomes 16; TOC becomes single-column.
- [ ] **H.5.c** ≤ 900 px: glossary becomes single-column (term above definition).
- [ ] **H.5.d** ≤ 600 px: card padding becomes 16; H1 → 24/32, H2 → 20/28, H3 → 18/26.
- [ ] **H.5.e** ≤ 600 px: "Open the inbox" CTA button stretches to full width.

### H.6 Touch targets

- [ ] **H.6.a** Action buttons (Dismiss / Merge / Undo) on mobile are at least 40 × 40 px clickable.
- [ ] **H.6.b** Tab pills are tappable without accidentally triggering the chevron above.

---

## I. Accessibility

Test with a keyboard only. Where noted, run a screen reader (VoiceOver on macOS / NVDA on Windows).

### I.1 Keyboard navigation

- [ ] **I.1.a** Tab order through `/match-hub` is logical: header nav → upgrade → user identity → switcher → stat cards (skipped) → tab buttons → group headers → action buttons → footer.
- [ ] **I.1.b** Every interactive element is focusable via Tab.
- [ ] **I.1.c** No focus traps (you can always Tab forward and Shift-Tab back out of any element).
- [ ] **I.1.d** **Enter** on the UserSwitcher button opens the dropdown.
- [ ] **I.1.e** **Escape** closes the open UserSwitcher dropdown — *(known gap: Esc-to-close not yet wired; flag if missing).*
- [ ] **I.1.f** Tab pills (Duplicates / Assessed) switch with **Enter** or **Space**.
- [ ] **I.1.g** Group card header expand/collapse can be triggered with keyboard — *(known gap: header is a `<div onClick>`; non-keyboard activatable. Flag for v2.)*
- [ ] **I.1.h** **Enter** on a Merge / Dismiss / Undo button activates it.

### I.2 Focus visibility

- [ ] **I.2.a** All buttons show a visible focus ring (default browser outline, or styled equivalent).
- [ ] **I.2.b** All anchor links show a visible focus ring.
- [ ] **I.2.c** Focus ring is not removed by `outline: none` without replacement.

### I.3 Semantics & ARIA

- [ ] **I.3.a** Tab pills are real `<button>` elements (inspect in DevTools), not divs with onClick.
- [ ] **I.3.b** Decision actions are real `<button>` elements with descriptive text content (`Merge`, `Dismiss`, `Undo`).
- [ ] **I.3.c** Headings are hierarchical: each page has exactly one `<h1>` then `<h2>` and `<h3>` in nesting order.
- [ ] **I.3.d** Decorative SVG icons have `aria-hidden="true"`.
- [ ] **I.3.e** Image-only buttons have `aria-label` (e.g. avatar div).

### I.4 Colour & contrast

- [ ] **I.4.a** Body text `#263856` on white passes WCAG AA (≥ 4.5:1).
- [ ] **I.4.b** Subtitle `#6786AC` on white passes WCAG AA for body text (16 px) — borderline; spot-check with a contrast tool.
- [ ] **I.4.c** Status pills are never colour-only — each has explicit text (`PRIMARY`, `MERGED`, `NOT A DUPLICATE`).
- [ ] **I.4.d** Confidence percentage in card header is dark `#263856` (not just colour-coded).

### I.5 Screen reader spot-check

- [ ] **I.5.a** Activating Merge causes the row's accessible name to update (the new pill text "MERGED" is announced when re-tabbed to).
- [ ] **I.5.b** "Name varies" badge is reachable via screen reader (text content, not background image).
- [ ] **I.5.c** *(Known gap)* Decision changes are not announced via `aria-live`. Confirm whether this matters for the prototype; flag as a v2 ticket if so.

---

## J. Dedup engine correctness

Source: `utils/dedupEngine.ts`. Constants: `MIN_CM_FOR_DEDUP = 30`, `CM_TOLERANCE = 0.05`, `SEGMENT_OVERLAP_THRESHOLD = 0.7`, `HIGH_CONFIDENCE_THRESHOLD = 0.9`.

The engine is pure-functional and importable from the browser console. Open DevTools at `/match-hub`, then run snippets like:

```js
const { scorePair } = await import('/_next/static/chunks/app/match-hub/page-XXXX.js'); // path varies; use Network tab
// Or: in the React DevTools, find the scorePair reference inside the engine module.
```

If hand-importing is fiddly, validate the same assertions by **reading the data + the rendered groups**: pick a duplicate group from the UI and inspect its members in the network response (`/data/user-N.json`) to verify the stated thresholds are honoured.

- [ ] **J.1** A pair where both records have `sharedCM < 30` is not grouped.
- [ ] **J.2** A pair where the cM difference is > 5 % of either value is not grouped.
- [ ] **J.3** Two records on the **same vendor** are never paired (engine skips same-vendor early).
- [ ] **J.4** A pair where either record has `segments.length === 0` returns confidence 0 (and is therefore not grouped).
- [ ] **J.5** A real cross-vendor duplicate fixture (same biological match, ±5 % cM, perturbed segments) scores ≥ 0.8.
- [ ] **J.6** Three matches A↔B (overlap 0.4) and B↔C (overlap 0.5) do **not** all chain into one group — the threshold of 0.7 prevents the union-find chain.
- [ ] **J.7** A group's `confidence` is the **average** pair overlap across members, not the max.
- [ ] **J.8** Groups in the UI sort by confidence DESC (highest-% first).
- [ ] **J.9** A name that differs across vendors (e.g. transliterated Cyrillic) does not block grouping — the cM + segment criteria still apply, and the `NAME VARIES` badge surfaces the divergence.

---

## K. Edge cases & data integrity

- [ ] **K.1** Switching demo users mid-decision discards every per-record decision (Merged stat resets to 0).
- [ ] **K.2** Hard reload (`Cmd+Shift+R`) discards every decision (no persistence is the documented behaviour).
- [ ] **K.3** Group with exactly 2 members: merging the sibling moves the group straight to Assessed.
- [ ] **K.4** Group with 3 members: any combination of (1 merged + 1 dismissed + 1 pending) keeps the group in Duplicates.
- [ ] **K.5** Group with 3 members all decided: the group lives in Assessed; undoing any one moves it back to Duplicates.
- [ ] **K.6** Group where every member has identical `sharedCM` and `segments.length`: primary is picked by vendor preference order; verify by inspecting source vendors in the rendered card.
- [ ] **K.7** `23andMe` vendor pill renders pink `#d50f67` text on white outlined pill.
- [ ] **K.8** `Ancestry` vendor pill renders olive `#9cbe30` text.
- [ ] **K.9** `MyHeritage` vendor pill renders orange `#e56c30` text.
- [ ] **K.10** `FTDNA` vendor pill renders navy `#003D7A` text.
- [ ] **K.11** `GedMatch` vendor pill renders amber `#f0a302` text.
- [ ] **K.12** Across the 10 demo users, every one of the 5 vendor pills is renderable (each user has at least one match per major vendor).
- [ ] **K.13** Synthetic kit id is stable per user across reloads (e.g. user-3 always shows `Kit: 24-XXXXXX` with the same hex).
- [ ] **K.14** Synthetic kit ids differ across users (no two users share the same kit id).
- [ ] **K.15** Stats `Vendors` count never exceeds 5.
- [ ] **K.16** A group with two members whose names match exactly does **not** show the `NAME VARIES` badge.
- [ ] **K.17** A group with two members where one has a transliterated/abbreviated name (e.g. `Birgit Pettersen` vs `B. Pettersen`) shows the `NAME VARIES` badge.
- [ ] **K.18** Total entries stat equals the JSON record count exactly (no off-by-one).
- [ ] **K.19** Refreshing on `/match-hub` with a user that has zero matches (if any) does not throw — stats render as zeros, both tabs show empty states.
- [ ] **K.20** Console is free of warnings/errors during a clean walkthrough (React keys, hydration mismatches, missing alt text).

---

## Reporting

When all sections are walked, summarise pass/fail counts per section in the GitHub issue or status doc:

```
A. Routing & smoke         ____ / 11
B. Tools selector          ____ / 16
C. Match Hub
   C.1 Loading             ____ / 6
   C.2 UserSwitcher        ____ / 8
   C.3 Identity + stats    ____ / 10
   C.4 Tabs                ____ / 10
   C.5 Group card header   ____ / 12
   C.6 Member rows         ____ / 18
   C.7 Primary selection   ____ / 5
   C.8 Empty states        ____ / 4
D. Help page               ____ / 19
E. Migrate route           ____ / 3
F. Top header              ____ / 9
G. Sub-header              ____ / 6
H. Mobile responsive       ____ / 22
I. Accessibility           ____ / 16
J. Dedup engine            ____ / 9
K. Edge cases              ____ / 20
                           ─────────
TOTAL                      ____ / 204
```

Any item flagged `(known gap)` is intentional — file a ticket but do not block on it for the prototype handoff.
