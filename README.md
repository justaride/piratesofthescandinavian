# Pirates of the Scandinavian

A narrative systems project for a branching roleplay-survival game set in the Oslofjord, where pirate crews and Viking powers collide through winter.

This repository folder currently ships the structured content layer for Act 2 (Quests 6-10), including:

- machine-readable quest data,
- a schema for validation,
- normalized CSV exports for content pipelines.

## What You Get

- Branching quest definitions with explicit choices and stat effects.
- Deterministic score formulas and outcome bands.
- Route-aware progression into Act 3 start states.

## Quick Start

### Prerequisites

- `jq` (for JSON validation and CSV export checks)
- Any runtime that can evaluate `expr-v1` style formulas

### Validate Current Pack

```bash
jq empty story/data/act2-quest-pack.json
```

### Inspect CSV Tables

```bash
wc -l story/csv/*.csv
```

## Project Structure

```text
Pirates of the Scandinavian/
├── README.md
├── ARCHITECTURE.md
├── CONTRIBUTING.md
├── CHANGELOG.md
├── ROADMAP.md
└── story/
    ├── README.md
    ├── schema/
    │   └── quest-pack.schema.json
    ├── data/
    │   └── act2-quest-pack.json
    └── csv/
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
- `ROADMAP.md`: next planned milestones.
- `CHANGELOG.md`: release history.
- `story/README.md`: detailed table-level runtime guidance.
