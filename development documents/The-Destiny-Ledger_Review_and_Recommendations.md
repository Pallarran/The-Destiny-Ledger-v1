# The Destiny Ledger — Review & Recommendations (Pre-2024 5e Optimizer)

**Scope:** Feedback and actionable recommendations to shape *The Destiny Ledger* into a precise, fast, and extensible D&D 5e (2014 rules + expansions, pre-2024) optimizer.

---

## Product North Star

> **The fewest clicks to a trustworthy number.**  
> Every toggle should teach a rule and update results instantly.

---

## Top-Level Information Architecture

- **Global Nav:** `Vault → Build Editor → DPR Lab → Compare → Party Optimizer → About/Legal`
- **Build Editor Breadcrumbs:** `Abilities → Class & Subclass → Features → Feats → Fighting Style → Spells → Equipment → Summary`
- **Persistent Utilities:** AC slider, advantage state (normal/adv/disadv), rest profile (encounters per SR/LR), presets, Save/Share.

---

## UI / UX Recommendations

### Forms that “can’t lie”
- Sectioned forms with **inline validation** and concise helper text: “Affects DPR: –5 to hit, +10 damage.”
- For each toggle (Archery, Sharpshooter, Hex, Bless), render a **delta pill** near output: `+3.7 DPR`.
- Disable or reveal fields contextually (e.g., **GWM** appears only with qualifying heavy melee weapons).

### Compare that earns its name
- **Side-by-side** cards with sticky headers.
- **Show differences only** toggle; up/down change indicators (↑/↓) per metric.
- Export **printable summary** (clean light theme, minimal ornament).

### Readability & theme
- Keep the modern UI; use parchment/frame **sparingly** on hero panels or print views.
- Ensure legible contrast, large hit-areas, keyboard navigation, and visible focus rings.
- Add “Skip to content”; label all controls (ARIA) and describe math-affecting toggles in plain language.

### Feedback loops
- Debounced recompute on input; optimistic UI with a tiny spinner only for long sims.
- **Round Scripts** editor (R1/R2/R3) with inline warnings when bonus actions collide.

---

## Engineering Architecture

### Canonical data model (typed)
```ts
type Build = {
  identity: { name: string; level: number; classPath: Array<{ cls: ClassId; levels: number; subclass?: SubclassId }> };
  abilities: { STR: number; DEX: number; CON: number; INT: number; WIS: number; CHA: number };
  profs: { skills: SkillId[]; saves: AbilityId[]; expertise: SkillId[] };
  features: FeatureId[];
  feats: FeatId[];
  fightingStyles: StyleId[];
  spells: Array<{ spell: SpellId; prepared?: boolean; known?: boolean }>;
  equipment: { weapons: WeaponId[]; ammo?: number; armor?: ArmorId; shield?: boolean };
  resources: { actionSurge?: number; superiorityDice?: { count: number; die: number }; pactSlots?: { level: number; count: number } };
  toggles: {
    advantage: "normal" | "adv" | "disadv" | "elven-accuracy";
    cover?: 0 | 2 | 5;
    sharpshooter?: boolean;
    greatWeaponMaster?: boolean;
    hex?: boolean; huntersMark?: boolean; bless?: boolean; faerieFire?: boolean;
  };
};
```

### Rules elements as composable modifiers
- Normalize feats/features/styles into **typed modifiers** (e.g., `toHit:+2`, `damage:+10 if sharpshooter`, `critRange:+1`, `advantage:attack`, `extraAttack:+1`, `bonusAction:requires(<reason>)`).
- A small **rules engine** composes modifiers into a **ResolvedAttack** per round.

### Simulator: analytic first, Monte Carlo second
- Use **closed-form math** for hit/crit:
  - Base hit `p = clamp( (21 + attackBonus − AC) / 20 )`
  - Advantage `p_adv = 1 − (1 − p)^2`
  - Elven Accuracy `p_ea = 1 − (1 − p)^3`
- Expected damage = `p_noncrit * onHit + p_crit * (onHitCrit)` including riders (Hex/HM per hit).
- **Monte Carlo fallback** (Web Worker) for stateful edge cases (e.g., limited-use procs, stacking riders with on-kill moves). Report **mean ± CI**.

### Action economy as a budget
- Per round track **Action / Bonus Action / Reaction / Concentration**.
- **Round Scripts**:
  - **R1:** cast Hex (BA), Attack (Action, 2 attacks), Reaction: —
  - **R2+:** maintain Hex, BA: move Hex if target dead, Action: Attack
- Enforce exclusivity (e.g., TWF vs War Magic BA attack).

### Multiclass spellcasting & slots
- PHB multiclass rules: shared slot table for full/half/third casters; **Warlock pact slots** separate (short rest).
- Distinguish **known/prepared** vs **slots**; enforce legality in the editor.

### State, forms, persistence
- **react-hook-form + zod** for forms/validation.
- **Zustand** for global state (current build, UI toggles).
- **localStorage** autosave; **shareable URLs** (encode build as compressed JSON in query/hash).

### Performance
- Sims run in a **Web Worker**; debounce inputs (150–250 ms).
- Precompute **to-hit tables by AC**; memoize derived stats.
- **Code-split** heavy views; lazy-load Compare and Party Optimizer.

### Testing strategy (Vitest)
- **Golden tests**: canonical builds with locked DPR at key levels (e.g., L5 Archery+Sharpshooter vs AC16; L11 EK War Magic; L5 GWM greatsword Champion).
- **Property tests** (fast-check):
  - Holding hit chance fixed, adding flat damage never lowers DPR.
  - Advantage ≥ normal ≥ disadvantage DPR, all else equal.
- **Fixture library**: presets double as test inputs.

---

## Rules Compliance (2014 rules only)

- **Sharpshooter / GWM:** Per-attack toggles; correct weapon gating; –5/+10 applied before advantage math; works with Archery style.
- **War Magic (EK 7, 2014):** Action=cantrip → **Bonus Action** one weapon attack; conflicts with TWF/other BA uses.
- **Concentration:** One at a time; BA required to move Hex/HM; optional “Concentration success” slider for realism in long sims.
- **Advantage stacking:** Binary; **Elven Accuracy** = roll three, keep highest (use `p_ea`).
- **Rest cycles:** Encounters per short/long rest; amortize Action Surge, superiority dice, pact slots; show **per-encounter** and **adventuring-day** DPR.
- **TWF / Crossbow Expert:** Respect exact BA usage; no double-spend of BA in the same round.

---

## Content & Licensing (SRD 5.1, CC-BY-4.0)

Include an **About/Legal** modal and footer attribution:

> This work includes material taken from the System Reference Document 5.1 (“SRD 5.1”) by Wizards of the Coast LLC. The SRD 5.1 is licensed under the Creative Commons Attribution 4.0 International License (CC-BY-4.0).

- Keep **Product Identity** out (no protected names/monsters/logos).
- Footer line: **“Compatible with 5e.”** (avoid using “D&D” wordmark or logos).

---

## Quick Wins Checklist

- [ ] Add Legal modal + footer attribution (SRD 5.1, CC-BY-4.0).
- [ ] Implement **Round Scripts** UI with action/BA/conc checks.
- [ ] Add **delta pills** showing effect of each toggle on DPR.
- [ ] Sticky **Compare** with “show differences only”.
- [ ] Move DPR engine to a **Web Worker**; keep UI buttery.
- [ ] Ship **10 presets** (see below) to validate and delight.
- [ ] Golden tests for 6 canonical scenarios.

---

## Suggested Preset Library (starter set)

1. **Champion Fighter 5** — GWM greatsword baseline.
2. **Fighter (Archery) 5** — Longbow + Sharpshooter vs AC ladder.
3. **Eldritch Knight 11** — War Magic cantrip+BA shot, archer variant.
4. **Battlemaster 5/11** — Superiority dice on-hit riders.
5. **Hexblade 5** — EB + Agonizing + Hex (baseline ranged spell DPR).
6. **Hunter Ranger 5/11** — Colossus Slayer + HM.
7. **Paladin 5/11** — Greatsword + Smite budgeting per encounter.
8. **Rogue 5/11** — Sneak Attack constraints (advantage/source modeling).
9. **Sorlock 5/7** — Agonizing EB + Hex + Pact slots cadence.
10. **Barbarian 5 (Reckless)** — Advantage dynamics vs AC.

Each preset includes: build sheet, round script, rest profile, and locked expected DPR (test fixture).

---

## Output & Reporting

- **Per-round DPR** (R1/R2/R3), **Total (3-round)**, and **Sustained DPR** (over encounters/day).
- **AC sweep chart** with auto-computed “Use Sharpshooter/GWM when AC ≤ N”.
- Breakdown table: hit chance, crit chance, expected hits, flat/rider damage, BA usage.

---

## Roadmap (phased)

**Phase 1 — Foundations**
- Data model, analytic DPR core, workerized sim, Round Scripts, presets, golden tests, legal modal.

**Phase 2 — Power Tools**
- Compare with diffs, AC sweep charts, shareable URLs, printable summaries, accessibility passes.

**Phase 3 — Party Optimizer**
- Multi-build synergy scoring (buff/debuff modeling: Bless, Faerie Fire, Pack Tactics, –AC effects), encounter templates.

**Phase 4 — Homebrew UI**
- Structured editors for custom weapons/feats/features with the same modifier schema; export/import JSON.

---

## Tech Stack Notes

- **Forms/validation:** `react-hook-form` + `zod`
- **State:** `zustand`
- **Charts:** `recharts` (or lightweight SVG for AC sweep)
- **Testing:** `vitest` + `@fast-check/vitest`
- **Perf:** Web Worker, memoize derived, debounce inputs, code-split heavy views

---

## Acceptance Criteria (sample)

- Toggling Sharpshooter on a longbow build updates hit chance, crit chance, and DPR instantly with **no UI jank**.
- EK War Magic at level 7 models **Action cantrip + BA weapon** and properly blocks TWF that round.
- **Advantage → Elven Accuracy** increases DPR monotonically (property test).
- **Hex/HM** apply on each hit, require BA to move, and never stack with themselves.
- Compare view **highlights only differences** on request and exports a clean PDF.

---

## Appendix: DPR Math (concise)

Let `AB = attack bonus`, `AC = armor class`, `D = expected on-hit damage`, `C = expected crit damage`, `r = crit range (usually 20 → 5%)`.

```
p_hit     = clamp((21 + AB - AC)/20, 0, 1)
p_crit    = r/20 (modified by features)
p_noncrit = max(p_hit - p_crit, 0)

Advantage:
  p_hit_adv  = 1 - (1 - p_hit)^2
  p_crit_adv = 1 - (1 - p_crit)^2  // or compute from distribution if expanding crit range
Elven Accuracy (3 dice):
  p_hit_ea   = 1 - (1 - p_hit)^3

E[damage per attack] = p_noncrit * D + p_crit * C (+ riders like Hex/HM per hit)
Total DPR per round = sum over attacks (respecting Action/BA limits) / round duration
```

---

**End of document.**
