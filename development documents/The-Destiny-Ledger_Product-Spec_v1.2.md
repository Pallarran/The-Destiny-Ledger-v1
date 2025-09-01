# The Destiny Ledger — Product Specification (v1.1)
**Version:** v1.2 — 2025-08-29

## 1) Mission & Overview
**The Destiny Ledger** is a browser-based D&D 5e optimizer and character comparison tool. It lets players build full characters (SRD at launch), simulate 3-round nova DPR using closed-form math, visualize non-DPR strengths on a radar chart, and compare up to three builds side-by-side. A Level Path Explorer analyzes level order permutations with constraints to maximize level-20 DPR by default.

**Design tenets**
- Accuracy first: closed-form math, deterministic toggles, transparent assumptions.
- Fast iteration: no servers, instant feedback, local Build Vault.
- Clarity: clean modern UI with subtle fantasy accents.
- Extensible: SRD seed data with pathways for future data packs/homebrew.

## 2) In/Out of Scope (v1)
**In scope**
- Ruleset: 2014 5e + all official pre-2024 books; **data content** at launch is **SRD 5.1 only** (bundled).
- Full character builder (stats, class/subclass, feats, gear) with per-level timeline.
- DPR engine: **attack-roll only**, 3-round nova, **Round 0** pre-buffs allowed (warn on concentration conflicts), **your turn only**.
- Mechanics at launch: **Extra Attack**, **GWM/Sharpshooter** (auto threshold), **Fighting Styles**, **Sneak Attack**.
- Gear modeling: basic weapon bonuses + common on-hit riders (e.g., +1dX, Flametongue, Elemental Weapon, Crimson Rite).
- Non-DPR roles: 6-axis radar (Social, Control, Exploration, Defense, Support, Mobility/Stealth) with objective scoring + optional manual nudge.
- Comparison: up to 3 builds, overlay DPR curves (normal/adv/disadv) across AC 10–30.
- Level Path Explorer: user-defined sequences **and** auto-optimizer (max 3 classes; must-hit milestones; optional “be good at <role> by Lx”). Default objective: **maximize L20 DPR**. Default result view: **side-by-side**.
- Persistence: Local Build Vault (IndexedDB) with import/export JSON (export UI may ship in v1.1).

**Out of scope (v1)**
- Save-based/AoE spells in DPR; off-turn reactions; enemy HP/saves; external party buffs.
- Non-SRD data bundles; Homebrew Editor.
- Cloud accounts or sync; PWA offline mode.

## 3) Primary Screens
1. **Landing**: purpose, feature overview, “Create Build,” “Open Vault,” “DPR Lab,” “Level Path Explorer.”
2. **Build Vault**: list of saved builds (cards with class icons, level, last edited), folders/tags, duplicate/rename/delete, usage meter.
3. **Character Builder (advanced editor)**:
   - Panels: Identity, Ability Scores, Class & Levels, Features & Feats, Gear, Buffs, Notes.
   - Per-level timeline (1–20) with milestones and ASIs/feats placements.
   - Validation badges (e.g., concentration conflicts, missing proficiency choices).
4. **DPR Lab**:
   - Inputs: advantage state (overlay shows all 3 lines), AC range fixed 10–30, Round-0 toggles, resource heuristics (greedy defaults), SS/GWM auto.
   - Output: line chart (normal/adv/disadv), SS/GWM breakpoint readout table, per-round breakdown, total/average DPR.
5. **Compare**:
   - Select up to 3 builds → DPR overlay chart + radar chart; SS/GWM breakpoint tables per build; notes.
6. **Level Path Explorer**:
   - Objective selector (default L20 DPR), constraints (max classes, must-hit milestones, role-by-level target), candidate list pane, **side-by-side view** of up to 3 orders with per-level DPR sparkline and milestone markers.
7. **Settings**:
   - Non-DPR weights (for combined score), default ability method, UI theme, data reset.

## 4) Data Model (conceptual)
**Entities**
- `Build` { id, name, createdAt, updatedAt, notes, version }
- `AbilityScores` { method: "standard|pointbuy|manual", scores { STR, DEX, CON, INT, WIS, CHA }, pointBuyLimit }
- `LevelTimeline` [ { level, classId, subclassId?, features[], asiOrFeat?, abilityIncreases?, notes } … ]
- `Feats` [ { id, name, options, halfFeat: { abilityChoices }? } ]
- `Features` [ { id, name, source, rulesKey } ] // e.g., Sneak Attack, Fighting Style (Archery)
- `Gear` { mainHand, offHand?, ranged?, ammo?, itemBonuses: [{ type, value }], riders: [{ id, name, dice, condition }] }
- `Buffs` [ { id, name, type: "concentration|nonconcentration", deterministic: true, grants: { advAttack?, dmgBonus?, attackBonus? }, actionCost: "action|bonus|free", allowedRound0: true } ]
- `SimConfig` { acMin:10, acMax:30, acStep:1, round0BuffIds:[], greedyHeuristics:true }
- `NonDPRSignals` { skills, expertise, senses, movement, toolkits, defensiveFeatures, supportAuras }

**IndexedDB (Dexie) schema**
- Tables: `builds` (primary), `snapshots` (optional), `settings`.
- Indexes: by `updatedAt`, `name`.

**JSON export (v1.1)**
- Single-file JSON matching the above; include `rulesetVersion`, `appVersion`.

## 5) Rules & Content
- **Source**: Ship SRD 5.1 JSON bundles for classes, features, feats, weapons, armor, and general options.
- **Extensibility**: Data loaders isolated behind a `rules/` module to enable future data packs/homebrew.
- **Deterministic toggles**: Self-cast buffs that normally require saves (e.g., Faerie Fire) are user-toggled as “on,” with action/slot accounted and concentration enforced.
- **Validation**: Detect and warn on multiple concentration effects enabled simultaneously (esp. Round 0).

## 6) DPR Engine (closed-form, attack-roll only)
**Assumptions**
- Three rounds; **Round 0** pre-buffs allowed; **your turn only**.
- Enemy model: **AC only** (10–30 step 1). No HP/saves/resists.
- Overlay curves: normal, advantage, disadvantage.

**Supported mechanics (v1)**
- **To-hit**: `pHit = clamp((21 + attackBonus - AC)/20, 0, 1)`; **crit** at natural 20 (or improved range), `pCrit = critRange/20`; advantage/disadvantage via `1 − (1 − p)^2` or `p^2` replacement for hit/crit windows (compute exact joint probabilities for hit, crit, miss).
- **Damage model** per attack: `E[D] = pCrit * E[critDamage] + (pHit − pCrit) * E[normalDamage]`.
- **Extra Attack**: sum per extra swing.
- **Action Surge**: greedy default uses R1; configurable later.
- **Sneak Attack**: once per turn, applies to the **first** qualifying hit; compute `P(at least one qualifying hit)` for expectation.
- **Fighting Styles**: Archery (+2 to hit), Dueling (+2 damage one-handed), Great Weapon Fighting (reroll 1s/2s on weapon dice), Defense (+1 AC—affects non-DPR roles only in v1).
- **GWM/Sharpshooter**: evaluate **per-AC** the higher of `{toHit+10 damage}` vs `{toHit}`; expose breakpoint table.
- **Buffs**: Haste extra attack (one weapon attack), Bless (+d4 to attack treated as +2.5 avg), Hex/Hunter’s Mark style on-hit riders modeled as flat expected extra damage with concentration enforcement.
- **Gear riders**: +X weapons (to-hit & damage), simple on-hit dice (e.g., +1d6), elemental riders.

**Outputs**
- Per-round damage breakdown; total 3-round DPR; curve arrays for three advantage states; SS/GWM breakpoint list.

**Acceptance criteria**
- Identical results (±0.5 DPR tolerance) to hand-calculated test cases across AC 10–30 for representative builds (archer with SS, greatsword GWM, rogue SA with Archery style ally, haste self-cast, bless on).
- GWF reroll math verified vs exact enumeration for 1d6/1d8/2d6.

## 7) Non-DPR Role Scoring
- **Signals** (examples):
  - Social: CHA, proficiency/expertise in Persuasion/Deception/Intimidation/Insight; always-on advantage sources.
  - Control: prone/restrain/stun/grapple enablers; shove/grapple proficiency; superiority dice maneuvers; fear auras.
  - Exploration: skills/tools (Stealth, Perception, Investigation, Survival, Thieves’ Tools), senses (darkvision), rituals.
  - Defense: AC/EHP approximation, shield access, defensive reactions (Shield spell), temp HP, resistances.
  - Support: ally buffs, damage amplification auras, help action enhancers.
  - Mobility/Stealth: speed, climb/fly, BA Dash/Disengage, stealth features.
- **Computation**: normalize each axis 0–100 using weighted signals; show “why” breakdown; allow user **nudge** (−10…+10) per axis.
- **Visualization**: radar chart (Recharts Radar) with tooltips.

## 8) Level Path Explorer
**Inputs**
- Base build intents (classes you’re considering), constraints (max 3 classes, must-hit milestones, role-by-level target), allowed feats/ASIs rules.

**Objective**
- Default: maximize **L20** 3-round DPR.
- Optional: tier averages or custom mixed milestones (UI stubbed for v1.1).

**Search strategy**
- Deterministic greedy + **beam search** (width configurable) over level additions 1…20.
- Prune branches that violate constraints or miss must-hit milestones by their deadlines.
- Score nodes by objective with tie-breakers (earlier Extra Attack, meeting role target by X).

**Results**
- Side-by-side comparison of up to 3 candidate orders; per-level timeline; milestone badges; per-level DPR sparkline.

## 9) UX & Visual Design — Modern‑Fantasy Skin (Authoritative)

**Intent:** Modern app first (grid, spacing, contrast, motion discipline), fantasy accents second (parchment panels, light rune corners on select components, arcane‑blue focus/lines).

### Layout & Density
- App chrome is dark; content lives on **parchment panels** with generous whitespace.
- Spacing scale = 8px; section titles sit in a slim dark bar with a thin **gold** divider.
- Keep panels flat; use **etched borders** and **micro inner shadow** only—no heavy bevels or drop shadows.

### Typography
- **Headings:** Cinzel *or* Cormorant Garamond (H1–H2 only).
- **Body/UI:** Inter everywhere else. Use CSS `clamp()` for fluid type scales.

### Design Tokens (canonical names — do not rename)
```css
:root{
  --bg:#0F1318;         /* app chrome (header/sidebar) */
  --panel:#EDE2CB;      /* parchment cards */
  --ink:#1E232A;        /* primary text on parchment */
  --muted:#4F5A66;      /* secondary text */
  --accent:#63CBFF;     /* arcane blue (focus, charts) */
  --gold:#C8A86B;       /* dividers/highlights */
  --emerald:#89B57D;    /* success */
  --border:#D8C9A5;     /* etched borders */
  --danger:#BE4B49;
  --radius:16px;
  --shadow:0 1px 0 rgba(0,0,0,.10), inset 0 0 0 1px var(--border);
}
```

### Surfaces & Accents
- **Parchment panel** = `background: var(--panel)` + subtle paper‑noise overlay **≤ 6% opacity** + `box-shadow: var(--shadow)` + `border-radius: var(--radius)`.
- **Rune corners (SVG)** appear **only** on large hero panels and ability score cards; opacity 35–45%.
- **Focus rings & “magic” glow** use `--accent` with a subtle drop shadow; respect `prefers-reduced-motion`.

### Components (shadcn/radix reskin)
- **Tabs / Segmented control:** pill tabs; thin **gold** indicator; active tab elevates 2px.
- **Form controls:** neutral fills; `:focus-visible` in **accent blue**; all labels visible.
- **Validation bar:** parchment banner; `--danger` for errors, **gold** for warnings.
- **Cards/Panels:** `.panel` utility applies `bg-panel text-ink rounded-[var(--radius)] shadow-[var(--shadow)]`.

### Charts (Recharts)
- **DPR line chart:** three curves (Normal / Advantage / Disadvantage), `strokeWidth=3`, dots only at AC ticks; faint gridlines; minimal legend.
- **Radar (Non‑DPR roles):** ~35% fill with thin stroke; hover tooltips.

### Motion & Accessibility
- Motion 120–160ms ease‑out; no parallax or bouncy easing.
- AA contrast on parchment; full keyboard navigation; visible `:focus-visible` rings; chart lines meet contrast on `--panel`.
- Respect `prefers-reduced-motion` by disabling nonessential transitions and glows.

### Visual Acceptance (must resemble provided concept images)
- **DPR Lab:** left config on parchment; right chart with three lines; SS/GWM table in a dark slate sub‑card.
- **Compare Builds:** radar left, DPR chart right; per‑build SS/GWM readouts as dark sub‑cards.
- **Character Builder:** stat **cards** with light rune corners; right **Level Timeline** with circular milestone badges.
- **Level Path Explorer:** 3–4 parchment **tiles** with micro DPR sparklines + milestone badges.

### Engineering Notes
**Stack:** React 18 + TypeScript + Vite; Tailwind + shadcn/ui; Recharts; Framer Motion.

**Tailwind theme**
```ts
// tailwind.config.ts (extend)
colors: {
  bg: "var(--bg)", panel: "var(--panel)", ink: "var(--ink)", muted: "var(--muted)",
  accent: "var(--accent)", gold: "var(--gold)", emerald: "var(--emerald)",
  border: "var(--border)", danger: "var(--danger)"
},
borderRadius: { xl: "var(--radius)" },
boxShadow: { etched: "var(--shadow)" }
```

**Global CSS**
```css
body{ background:var(--bg); color:var(--ink); }
.panel{ background:var(--panel); color:var(--ink); border-radius:var(--radius); box-shadow:var(--shadow); }
.glow{ filter: drop-shadow(0 0 8px rgba(99,203,255,.45)); }
```

**Fonts:** Load Cinzel/Cormorant + Inter via Google Fonts; map H1–H2 to the serif, everything else to Inter.

**Charts:** Use CSS vars for strokes; `stroke="var(--accent)"` for Advantage; mix with black/white for Normal/Disadvantage; `strokeWidth=3`.

### Guardrail (place near the top of the spec)
> Implement the **Modern‑Fantasy Skin** exactly as defined in Section 9. Use the named tokens and component rules. If library defaults conflict, override toward parchment panels with etched borders, serif headings, and arcane‑blue focus/lines—**but keep modern spacing and restraint** (no heavy textures or bevels).

## 10) Tech Stack & Architecture (Pages-friendly)
- **Framework**: React 18 + TypeScript + Vite (static build; SPA).
- **UI/Styling**: Tailwind CSS + **shadcn/ui** (Radix primitives) for polished controls.
- **Icons**: lucide-react + custom SVG ornaments (runes, corners, sigils).
- **Charts**: Recharts (Line & Radar).
- **Animation**: Framer Motion (subtle page/component transitions).
- **State**: Zustand (+ Immer) modules: `builderStore`, `dprStore`, `vaultStore`, `settingsStore`.
- **Forms**: React Hook Form + Zod schemas.
- **Persistence**: Dexie (IndexedDB) for the Build Vault.
- **Math**: Closed-form DPR engine in a Web Worker (Comlink); pure TS math kernel in `engine/`.
- **Routing**: React Router; SPA fallback (`404.html` copies `index.html`) for GitHub Pages.
- **CI/CD**: GitHub Actions → GitHub Pages (workflow below).

**Repo structure**
```
src/
  app/                # routes & layout
  components/         # UI atoms/molecules (Card, PanelHeader, RuneCorners, ChartFrame)
  features/
    builder/          # Character Builder
    dpr/              # DPR Lab & math views
    compare/
    explorer/         # Level Path Explorer
    vault/
    settings/
  engine/             # closed-form math kernel (pure TS)
  rules/              # SRD JSON + loaders
  stores/             # zustand stores
  styles/             # globals.css, tokens.css (CSS vars above)
  workers/            # DPR worker entry (Comlink)
  assets/             # logo, ornaments, textures
tests/                # vitest
```

**Tailwind theme extension**
```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors:{
        bg:"var(--bg)", panel:"var(--panel)", ink:"var(--ink)", muted:"var(--muted)",
        accent:"var(--accent)", gold:"var(--gold)", emerald:"var(--emerald)",
        border:"var(--border)", danger:"var(--danger)"
      },
      borderRadius:{ xl:"var(--radius)" },
      boxShadow:{ etched:"var(--shadow)" }
    }
  }
}
```

**GitHub Pages deployment**
- In `vite.config.ts`: `base: "/<repo-name>/"`.
- Add SPA fallback: copy `index.html` to `404.html` during build or commit a duplicate.
- Actions workflow:
```yaml
# .github/workflows/pages.yml
name: Deploy Pages
on: { push: { branches: ["main"] } }
permissions: { contents: read, pages: write, id-token: write }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/deploy-pages@v4
```

**Why this stack fits the concept art**
- Tailwind + shadcn provides the parchment cards, switches, sliders, and tabs with minimal custom CSS.
- Recharts maps directly to your **overlay DPR lines** and **six-axis radar** visuals.
- Worker-based math keeps charts responsive even when sweeping AC 10–30 for three curves.

## 11) Performance Budget
- DPR evaluation for one build across AC 10–30 (3 curves) ≤ **25 ms** in worker.
- UI interaction to chart update ≤ **100 ms**.

## 12) Security & Privacy
- Local-only persistence; no network I/O in v1.
- Clear “Reset Data” control in Settings.

## 13) Testing Strategy
- **Unit**: math kernel golden tests for hit/crit, advantage, SS/GWM threshold detection, SA application, GWF rerolls, Haste extra attack.
- **Integration**: builder → engine translation; Round-0 concentration warnings.
- **UI**: smoke tests (mount screens), critical form validations.

## 14) Release Plan (milestones)
**M1 — Foundations (1–2 weeks)**
- Project scaffolding, routing, theme, shadcn/ui.
- Dexie store & Build Vault skeleton.
- SRD loaders and type definitions.

**M2 — DPR Engine Core (2 weeks)**
- Worker scaffolding; to-hit/crit math; advantage states; Extra Attack; SS/GWM thresholds; chart rendering; breakpoint table.

**M3 — Builder v1 (2 weeks)**
- Ability methods (standard/pointbuy/manual); classes/levels timeline; feats with half-feat ASI choices; gear basics + riders; buff toggles; validation.

**M4 — Compare & Radar (1 week)**
- 3-build compare view; radar scoring/nudge; notes.

**M5 — Level Path Explorer (2 weeks)**
- Constraints; beam search; side-by-side comparison UI.

**M6 — Polish (1 week)**
- Landing page; settings; empty states; help tooltips; iconography; docs.

## 15) Acceptance Criteria (v1 DoD)
- Create, save, and reopen builds locally; at least 20 builds without noticeable slowdown.
- DPR chart shows three overlays, SS/GWM breakpoints listed; results stable across refresh.
- Round-0 with two concentration buffs triggers a visible warning.
- Compare view renders radar + chart for 3 builds without overlap issues.
- Level Path Explorer produces ≥3 candidates for typical 2-class intents under constraints and displays them side-by-side.
- All core math tests pass; UI smoke tests pass.

## 16) Backlog (v1.1+)
- Homebrew/Data Packs; export/import JSON; cloud sync; PWA.
- Additional mechanics: Battlemaster maneuvers, Divine Smite, Crossbow Expert/Gunner, Haste rules polish, Champion crit expansion, Samurai, PAM, reroll traits.
- Save/AoE spells with enemy save model; off-turn reactions with trigger probability.
- Export charts; printable build sheets; shareable read-only links.

## 17) Risks & Mitigations
- **Rules coverage creep** → Gate with feature flags; expand post v1.
- **Math bugs** → Golden tests, cross-checks vs curated cases.
- **Data integrity** → Schema versioning; migration on app updates.

## 18) Developer Notes (for Claude-Code)
- Prioritize `engine/` first with exhaustive unit tests; freeze API types before UI wiring.
- Implement SS/GWM threshold finder as a pure function returning breakpoint ACs.
- Keep builder→engine mapping in one translator module; no engine imports from UI.
- Start with a static SRD JSON slice (Fighter, Rogue, Ranger, core feats/styles) to unblock.
- Provide `simulate(build, config): CurveSet` returning three arrays (AC→DPR) + breakdown & breakpoints.