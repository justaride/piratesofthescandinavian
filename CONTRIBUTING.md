# Contributing

## Goal

Keep quest content consistent, deterministic, and easy to balance.

## Branching

Use feature branches for non-trivial content updates.

Suggested naming:

```text
codex/<short-topic>
```

## Content Editing Rules

1. Treat `story/data/*.json` as source-of-truth.
2. Keep IDs stable once introduced (`quest_id`, `node_id`, `choice_id`).
3. Make stat deltas explicit (avoid hidden side effects).
4. Keep route-specific bonuses documented in `notes` when not directly represented in effects.

## Validation Checklist

Run before commit:

```bash
# JSON syntax
jq empty story/data/act2-quest-pack.json

# Quick CSV sanity
wc -l story/csv/*.csv
```

If you update JSON content and your pipeline uses CSV, regenerate CSV exports from the updated source.

## Commit Style

Use clear, scoped commit messages.

Examples:

- `feat(story): add act 2 quest pack and schema`
- `docs(project): add architecture and contribution guides`
- `balance(q8): tune accusation accuracy and penalties`

## Pull Request Guidance

Include:

- What changed (quests/nodes/formulas affected)
- Why it changed (narrative or balance goal)
- Any compatibility notes for runtime evaluator
- Before/after examples for key score paths

## Review Focus

Reviewers should check:

- Formula correctness and clamp boundaries
- Broken references between IDs
- Outcome band gaps or overlaps
- Flag naming consistency
