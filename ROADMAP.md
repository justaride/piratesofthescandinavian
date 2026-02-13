# Roadmap

## Next Milestones

1. Act 3 Content Pack
- Expand scaffolded quests `Q11`-`Q15` keyed from `act3_start_state` with production narrative and balance passes.
- Define final-ending reconciliation with ending matrix.

2. Runtime Evaluator Implementation
- Implement `expr-v1` parser/evaluator in TypeScript.
- Add deterministic test harness for score calculations.

3. Data Authoring Tooling
- Add scripts to regenerate CSV from JSON in one command.
- Add schema validation pre-commit hook.

4. Balance and QA
- Create canonical playthrough test states per route:
  - `conquest`
  - `accord`
  - `ashen`
  - `exile`
- Tune thresholds for fail-state frequency and route identity.

5. Localization Readiness
- Externalize dialogue strings for i18n.
- Add locale-specific narrative packs.
