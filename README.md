# Pirates of the Scandinavian

A narrative systems project for a branching roleplay-survival game set in the Oslofjord, where pirate crews and Viking powers collide through winter.

This repository ships:

- a playable React runtime for Act 2,
- an Act 3 scaffold content pack wired to the same runtime pipeline,
- machine-readable quest data,
- schema validation,
- normalized CSV exports for content pipelines.

The content layer for Act 2 (Quests 6-10) includes:

- deterministic branching choices,
- stat and flag effects,
- score formulas, outcome bands, and Act 3 start-state post-rules.

Runtime UX currently includes:

- persistent local save/resume (browser storage),
- replay timeline on completion,
- score codex panel with per-rule formula outputs.

## What You Get

- Branching quest definitions with explicit choices and stat effects.
- Deterministic score formulas and outcome bands.
- Route-aware progression into Act 3 start states.

## Quick Start (Playable Runtime)

### Prerequisites

- Node.js 20+
- npm 10+

### Install + Run

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in your terminal.

### Test + Build

```bash
npm test
npm run build
```

## Content Validation

### Prerequisites

- `jq` (for JSON validation and CSV export checks)

### Validate current pack

```bash
jq empty story/data/act2-quest-pack.json
```

### Inspect CSV Tables

```bash
wc -l story/csv/*.csv
```

### Export Act 3 CSV Tables

```bash
npm run export:csv:act3
```

### Export Act 2 and All Packs

```bash
npm run export:csv:act2
npm run export:csv:all
```

## Project Structure

```text
Pirates of the Scandinavian/
├── README.md
├── ARCHITECTURE.md
├── CONTRIBUTING.md
├── CHANGELOG.md
├── GAME_PLAN.md
├── ROADMAP.md
├── src/                     # React runtime, engine, UI, tests
├── scripts/
│   └── export-pack-csv.mjs
├── package.json
└── story/
    ├── README.md
    ├── schema/
    │   └── quest-pack.schema.json
    ├── data/
    │   └── act2-quest-pack.json
    │   └── act3-quest-pack.json
    └── csv/
        ├── quests.csv
        ├── nodes.csv
        ├── choices.csv
        ├── effects.csv
        ├── scoring_rules.csv
        ├── outcome_bands.csv
        ├── meta.csv
        ├── act2/
        │   ├── quests.csv
        │   ├── nodes.csv
        │   ├── choices.csv
        │   ├── effects.csv
        │   ├── scoring_rules.csv
        │   ├── outcome_bands.csv
        │   └── meta.csv
        └── act3/
            ├── quests.csv
            ├── nodes.csv
            ├── choices.csv
            ├── effects.csv
            ├── scoring_rules.csv
            ├── outcome_bands.csv
            └── meta.csv
```

## Core Gameplay Model (Data-Level)

- `P`: Pirate reputation
- `V`: Viking reputation
- `O`: Oath integrity
- `W`: Winter readiness
- `S`: Seer influence
- `M`: Crew morale

Resource tracks (`Food`, `Med`, `Tar`, `Timber`, `Wounds`) and flags drive formula outcomes.

## Common Tasks

### Add a New Quest

1. Add quest object to `story/data/act2-quest-pack.json` (or new act pack file).
2. Define nodes, choices, effects, scoring rules, and outcome bands.
3. Validate JSON:
   ```bash
   jq empty story/data/act2-quest-pack.json
   ```
4. Regenerate CSV exports if your pipeline depends on tabular format.

### Tune Difficulty

1. Adjust score formulas in `scoring.rules`.
2. Rebalance `outcome_bands` thresholds.
3. Re-test route-specific playthroughs (`conquest`, `accord`, `ashen`, `exile`).

## Additional Docs

- `ARCHITECTURE.md`: system and data-flow design.
- `CONTRIBUTING.md`: content editing and commit workflow.
- `GAME_PLAN.md`: implementation and milestone plan for the playable game runtime.
- `ROADMAP.md`: next planned milestones.
- `CHANGELOG.md`: release history.
- `story/README.md`: detailed table-level runtime guidance.
