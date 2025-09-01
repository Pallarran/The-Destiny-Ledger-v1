# The Destiny Ledger — Product Specification (v1.3)
**Version:** v1.3 — 2025-08-31

## 1) Mission & Overview
**The Destiny Ledger** is a browser-based D&D 5e optimizer and full-featured character builder. It allows players to create and manage complete characters (with full class, subclass, feats, spells, and gear), simulate deep combat performance (via the DPR Lab), and compare up to three builds side-by-side. It supports all official 5e content and is expandable for homebrew. 

**Design tenets**
- Accuracy first: deterministic toggles, verified math, transparent assumptions.
- Fast iteration: no servers, instant feedback, local Build Vault.
- Clarity: clean modern UI with subtle fantasy aesthetics.
- Extensible: supports both bundled content and user-added homebrew.

## 2) Scope (v1.3)
### In Scope
- Full character sheet fidelity: classes, subclasses, feats, gear, stats, spells, inventory.
- Ruleset: Full 5e (PHB, XGtE, TCoE, SCAG, etc.); all data is bundled in the app.
- Spellcasting: prepared/known spell systems, slots, components, rituals, concentration.
- Inventory: main/off-hand/ranged + armor + up to 3 attuned magic items; includes all combat-impacting gear.
- DPR Lab: full build simulation (3-round DPR, charts, round-by-round breakdown) using data imported directly from the Build Vault including abilities, feats, features, spells, and gear.
- Compare view: multi-build comparison (up to 3) with rich info display based on builds loaded from the Build Vault.
- Level Path Explorer: automated pathfinder for optimal level orderings under constraints.
- Non-DPR role analysis: 6-axis radar chart based on signals + manual nudge.
- Combat Round Optimizer: simulates best-per-round action sequences across 3 rounds including bonus actions, reactions, and resource usage.
- Optimization Insights: recommends optimal feats, level paths, or gear to maximize specific goals (DPR, survivability, control).
- Party Optimizer Mode: configure and evaluate full party compositions (up to 5 builds), auto-assess role balance and synergy.

### Out of Scope (v1.3)
- Economic inventory, loot logs, weight, encumbrance.
- Multiplayer sync, cloud accounts, or networked persistence.
- Save-based/AoE spells in simulation (planned in v1.4+).

## 3) Core Screens
1. **Landing**: overview, “Create Build,” “DPR Lab,” “Compare Builds,” “Explorer.”
2. **Build Vault**: saved builds with tags, folders, and metadata.
3. **Character Builder**:
   - Panels: Identity, Ability Scores, Level Timeline, Class/Subclass, Feats, Gear, Spells, Buffs, Notes.
   - Spellbook: searchable, filterable; prep toggles and concentration checks.
   - Validation: warnings for attunement overlimit, missing choices, spell prep mismatch.
4. **DPR Lab**:
   - Imports build data from Vault and simulates using all relevant stats, feats, spells, gear.
   - Inputs: AC 10–30, advantage modes, buff toggles, gear effects.
   - Output: DPR curve (3 lines), SS/GWM tables, damage breakdown.
   - Includes Combat Round Optimizer engine for per-round sequence simulation.
5. **Compare**:
   - Up to 3 builds shown side-by-side, loaded from the Build Vault.
   - Includes class path, gear, spells, feats, buffs, radar chart, DPR overlays, notes, role tags.
6. **Level Path Explorer**:
   - Objective: optimize L20 DPR (default) or hit milestones.
   - Shows 3 candidates with per-level timeline, sparklines, badges.
7. **Party Optimizer**:
   - Allows configuration of up to 5 builds.
   - Assesses role coverage, synergy, non-DPR gaps, overlapping buffs.
   - Offers recommendations to improve balance and effectiveness.
8. **Settings**: theme, role weights, data reset, preferences.
9. **Homebrew Editor** (new): UI-based module to add/edit custom content (classes, feats, items, spells) with validation and preview.

## 4) Data Model (Additions)
- `Spells`: { id, name, classList[], level, school, castingTime, duration, range, components, ritual, concentration }
- `Spellbook`: [spellId], prepared[], slots{level1: X, level2: Y...}, pactSlots, pactLevel
- `Gear`: now includes attunedItems[] (with validation) and rider effects
- `Build` includes `spellcastingModel`, `inventory`, `attunementCount`
- `CompareViewModel`: aggregates summary data for each build
- `HomebrewPack`: structured data entity for user-created content
- `RoundPlan`: stores simulated action sequences with expected values
- `PartyPlan`: aggregates up to 5 builds with synergy evaluation metadata

## 5) Content & Extensibility
- All official 5e data (PHB, TCoE, XGtE, etc.) is bundled with the app.
- Homebrew support via new **Homebrew Editor UI** or JSON imports.
- Data grouped in packs: classes, subclasses, feats, items, spells.

## 6) DPR Lab (Simulation Engine)
- Closed-form DPR, 3-round simulation
- Advantage/disadvantage support
- GWM/SS breakpoint detection
- Buffs: Bless, Hex, Haste, etc.
- Action surge logic, Sneak Attack calc, Fighting Style effects
- Gear/item effects modeled via riders
- Pulls build data directly from Build Vault
- Includes combat round sequencing module to find highest value turn paths

## 7) Compare Module
- DPR chart overlays (normal/adv/disadv)
- Radar chart: 6-axis role evaluation
- Full character summary: class/subclass, spell highlights, feats, buffs
- Attuned items, role tags, build notes shown side-by-side
- Hover/click to expand any panel for more info
- All data pulled from Vault builds

## 8) UX & Visual Design
- Keep "Modern-Fantasy Skin" with all tokens (see v1.2 Section 9)
- Minor additions for Compare View:
   - New layout for side-by-side builds with collapsible sections
   - Spell list modal with tooltip previews
- New screen: Party Optimizer with 5-tile horizontal layout + synergy map

## 9) Architecture Updates
- Expanded `rules/` module to support full rulebook packs
- Spell system added to `builderStore`
- DPR Lab scoped to simulation root and wired to Vault imports
- New module: `homebrew/` with schema validation and preview tools
- `optimizer/` submodules for round planning and party synergy analysis

## 10) Acceptance Criteria
- Character builds reflect full class/feat/spell/item info
- Compare shows meaningful differences beyond just DPR
- DPR Lab shows accurate 3-round outputs across AC 10–30
- Spellcasting model supports multiclass prep + pact logic
- Attunement and concentration validation show correct warnings
- Homebrew Editor allows users to create/edit valid content via UI
- Combat Round Optimizer produces valid sequences with breakdowns
- Optimization engine suggests valid feats/paths based on chosen goal
- Party Optimizer reveals synergy/conflict and produces role report

## 11) Future Considerations
- AoE/save-based spells
- Off-turn reactions
- Buff duration modeling
- Printable/read-only sheet exports
- Shared online build links

## 12) Legal Note
This app bundles official 5e content for user convenience. It assumes rights are held or granted to display/use all non-SRD material.

## 13) Risks
- Expanded data model increases complexity; mitigated by modular loaders
- Legal exposure for bundled non-SRD; mitigated via offline/local-only delivery
- Simulation accuracy risk; mitigated by golden test coverage

---

> Implement the **Modern‑Fantasy Skin** exactly as defined in Section 9 of v1.2. All new UI should extend the existing design system with proper tokens, layouts, and etched panels.
