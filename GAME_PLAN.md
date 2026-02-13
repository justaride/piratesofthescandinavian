# Pirates of the Scandinavian: Game Planning Brief

## 1) Current Content Snapshot

The repository already has a strong data layer for Act 2.

- Act: 2
- Quests: 5 (`Q6` to `Q10`)
- Decision nodes: 15
- Player choices: 56
- Scoring rules: 15
- Derived rules: 2
- Post rules: 6
- Outcome bands: 20

Core tracked stats:

- Reputation and governance: `P`, `V`, `O`, `S`, `M`
- Survival pressure: `W`, `Food`, `Med`, `Tar`, `Timber`, `Wounds`
- Act progression accumulator: `A2`

Core route identity flag:

- `ending_vector`: `conquest`, `accord`, `ashen`, `exile`

Act 3 starts are already defined via post-rules:

- `WARLORD_ASCENDANT`
- `TREATY_REGENT`
- `ASH_PROPHET`
- `GHOST_ADMIRAL`
- fallback `FRACTURED_FJORD`

## 2) Story Arc for Build Planning

Act 2 escalates cleanly across 5 quests:

1. `Q6_CROWN_OR_COVENANT`
- Theme: who rules and by what legitimacy.
- Gameplay pressure: governance + morality under scarcity.

2. `Q7_WHALE_ROAD`
- Theme: logistics under winter threat.
- Gameplay pressure: convoy route and distribution ethics.

3. `Q8_KNIVES_UNDER_SNOW`
- Theme: paranoia and justice.
- Gameplay pressure: investigation quality, accusation accuracy, punishment cost.

4. `Q9_SIEGE_OF_NESODDEN`
- Theme: open conflict.
- Gameplay pressure: military doctrine vs civilian cost.

5. `Q10_THAW_RECKONING`
- Theme: political settlement and mythic symbol (the ring).
- Gameplay pressure: final claim, oath form, and route-aligned ending setup.

## 3) MVP Definition (First Playable)

Goal: ship a fully playable Act 2 story runtime with deterministic scoring and outcomes.

MVP includes:

- New run setup with initial flags/state (`ending_vector`, `chapter1`, crisis toggles).
- Quest loop: show node prompt -> pick choice -> apply effects -> advance.
- Scoring evaluation at quest end with visible result band.
- Running HUD updates after every decision.
- Act 3 start-state resolution after `Q10`.
- Save/load run state locally.

MVP excludes for now:

- Full combat simulation.
- World map traversal mechanics.
- Art-heavy cinematics.
- Multiplayer.

## 4) UI Plan (Using react-game-ui Patterns)

### Primary screen layout

- `GameLayout` shell
- Top HUD bar
  - Resource bars for `P`, `V`, `O`, `W`, `S`, `M`
  - Compact resources (`Food`, `Med`, `Tar`, `Timber`, `Wounds`)
- Center story panel
  - Quest title + beat line
  - Current node prompt
  - Choice cards/buttons
- Right side panel
  - Current flags summary
  - Quest progress (`6/10` style)
  - Route alignment hints
- Bottom action area
  - Confirm choice
  - Open codex/history
  - Pause/settings

### Component mapping

- `ResourceBar`: live stats and resources.
- `AnimatedCounter`: score and resource deltas.
- `Meter`: route alignment confidence or winter-risk meter.
- `GameButton`: primary choice CTA and utility actions.
- `GameModal`: quest-end result summary and post-rule transitions.
- `GameTooltip`: show exact effect deltas before confirm.
- Reduced motion + announcer region from the skill for accessibility.

### Interaction style

- Micro-feedback on choose/confirm.
- Delta popups when effects apply.
- Quest-end modal with score, band label, and key consequences.

## 5) Runtime Architecture Plan

Data source and validation:

- Load `story/data/act2-quest-pack.json` as source of truth.
- Validate against `story/schema/quest-pack.schema.json` on startup/build.

Engine modules:

- `state.ts`: typed game state (`stats`, `flags`, history).
- `effectResolver.ts`: apply `add`, `set_flags`, conditional notes.
- `exprEvaluator.ts`: deterministic evaluator for `expr-v1` formulas.
- `questRunner.ts`: node progression, score computation, outcome band matching.
- `postRules.ts`: run Act 3 start-state rules.

Suggested stack:

- React + TypeScript
- Tailwind + shadcn/ui
- Framer Motion
- Zustand (state)
- Zod or AJV (schema/runtime validation)

## 6) Milestone Plan

### Milestone 0: Project scaffold

- Initialize app shell and design tokens.
- Build base `GameLayout` and static HUD.
- Wire JSON loading.

Exit criteria:

- App boots and displays quest/node content from data file.

### Milestone 1: Deterministic engine core

- Implement effect application.
- Implement expression evaluation for rules used in Act 2.
- Implement outcome bands and post-rules.

Exit criteria:

- Same inputs always produce same outputs.
- Golden scenario tests pass.

### Milestone 2: Vertical slice (`Q6`)

- Complete one quest end-to-end with polish.
- Add animations, tooltips, and result modal.

Exit criteria:

- `Q6` fully playable from start to outcome band.

### Milestone 3: Full Act 2 runtime

- Integrate `Q7` to `Q10`.
- Add save/load and run summary.

Exit criteria:

- Entire Act 2 playable in a single run.

### Milestone 4: Balance and QA

- Canonical playthrough tests for each route.
- Tune threshold and penalty values.

Exit criteria:

- Target fail-state frequency and route identity feel are acceptable.

## 7) Immediate Next Sprint (Recommended)

1. Create `src/game/types.ts` from existing stat/flag schema.
2. Implement JSON loader + schema validation.
3. Build `GameLayout` with placeholder HUD and node panel.
4. Implement choice selection and effect application.
5. Implement scoring + band resolution for `Q6`.
6. Add test fixtures for `conquest`, `accord`, `ashen`, `exile`.
7. Add accessibility hooks (reduced motion + live region announcements).

## 8) Risks to Resolve Early

- `expr-v1` evaluator completeness and determinism.
- Handling notes-based conditional effects consistently.
- Preventing UI-state drift from source-of-truth content data.
- Balance tuning effort once full Act 2 is interactive.

