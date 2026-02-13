# Pirates of the Scandinavian - Act 2 Data Pack

This package contains a machine-readable quest schema and Act 2 content (Quests 6-10) in JSON + CSV.

## Files

- `story/schema/quest-pack.schema.json`
  - JSON Schema for validating quest packs.
- `story/data/act2-quest-pack.json`
  - Source-of-truth quest content for Act 2.
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
