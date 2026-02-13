# Pirates of the Scandinavian - Act 2 Data Pack

This package contains a machine-readable quest schema, a production Act 2 content pack (Quests 6-10), and an Act 3 scaffold pack (Quests 11-15).

## Files

- `story/schema/quest-pack.schema.json`
  - JSON Schema for validating quest packs.
- `story/data/act2-quest-pack.json`
  - Source-of-truth quest content for Act 2.
- `story/data/act3-quest-pack.json`
  - Scaffold quest content for Act 3 using the same schema and runtime model.
- `story/csv/quests.csv`
  - One row per quest.
- `story/csv/nodes.csv`
  - One row per choice node.
- `story/csv/choices.csv`
  - One row per player choice.
- `story/csv/effects.csv`
  - One row per stat mutation tied to a choice.
- `story/csv/scoring_rules.csv`
  - Derived/scoring/post expressions plus final score key.
- `story/csv/outcome_bands.csv`
  - Score bands and quest-result effects.
- `story/csv/meta.csv`
  - Pack-level meta expressions.
- `story/csv/act3/*.csv`
  - Normalized table export for the Act 3 scaffold pack.
- `story/csv/act2/*.csv`
  - Normalized table export for the Act 2 pack.

## Exporting CSV

- Act 2 export:
  - `npm run export:csv:act2`
- Act 3 export:
  - `npm run export:csv:act3`
- Export both:
  - `npm run export:csv:all`
- Reusable exporter:
  - `node scripts/export-pack-csv.mjs --pack <pack-json> --out <output-dir>`

## Join Keys

- `quest_id` links all tables.
- `node_id` links `nodes.csv` -> `choices.csv` -> `effects.csv`.
- `choice_id` links `choices.csv` -> `effects.csv`.

## Runtime Order (recommended)

1. Apply `meta` seed rules (initialize `A2`).
2. For each quest in `quests.order`:
   - Resolve selected rows in `choices.csv`.
   - Apply `effects.csv` deltas.
   - Apply `set_flags_json` from `choices.csv`.
   - Evaluate `scoring_rules.csv` where `rule_scope in ('derived','scoring')`.
   - Read final score variable from `rule_id='final_score'`.
   - Apply matching `outcome_bands.csv` row.
   - Evaluate `rule_scope='post'` rules.

## Notes

- Expressions use `expr-v1` pseudocode and are intended for your own evaluator.
- Conditional bonuses called out in `choices.notes` are intentionally kept explicit for engine-side handling.
