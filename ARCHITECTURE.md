# Architecture Overview

## Scope

This document describes the narrative-content architecture for the **Pirates of the Scandinavian** game module.

The current implementation focuses on **Act 2 (Quests 6-10)** as a data-driven content pack.

## System Design

```text
Narrative Design (docs/spec)
        |
        v
Source Content JSON (story/data/act2-quest-pack.json)
        |
        | validates against
        v
JSON Schema (story/schema/quest-pack.schema.json)
        |
        | transformed/exported into
        v
Normalized CSV Tables (story/csv/*.csv)
        |
        v
Game Runtime Evaluator (engine-side)
- Applies choice effects
- Resolves formulas
- Assigns outcome bands
- Advances state flags
```

## Content Data Model

### Primary Entities

- `quest`
- `node`
- `choice`
- `effect`
- `scoring_rule`
- `outcome_band`

### Key Relationships

- `quest_id` links all quest-level records.
- `node_id` maps choice groups to their parent quest stage.
- `choice_id` maps each player option to stat effects.

## Runtime Flow

1. Initialize pack-level meta state (including `A2` seed).
2. Execute quest nodes in order.
3. Apply selected choice effects and flag updates.
4. Evaluate derived/scoring rules.
5. Compute final quest score.
6. Resolve outcome band effects.
7. Apply post-rules (including Act 3 state selection).

## Design Decisions

### JSON as Source of Truth

Why:
- Hierarchical structure fits quest/node/choice nesting.
- Easier to diff narrative changes than spreadsheets.
- Works well with schema validation.

Trade-off:
- Less spreadsheet-friendly for non-technical editing.

### CSV as Delivery Format

Why:
- Supports SQL import and design review in spreadsheet tools.
- Enables analytics and balancing workflows outside runtime.

Trade-off:
- Split tables require consistent key joins.

### Formula Strings (`expr-v1`)

Why:
- Keeps balancing logic editable by content designers.
- Avoids hardcoding narrative math in app code.

Trade-off:
- Requires a deterministic evaluator in the game runtime.

## Extension Points

- Add `story/data/act3-quest-pack.json` for next act.
- Add localized text fields (`text_i18n`) per choice.
- Add automated formula tests against golden save states.
- Add migration scripts for schema-version upgrades.
