import { executeAssignment, executePostRule, executeRules, type EvalContext } from './formula';
import { ACT2_STAT_KEYS, type Choice, type FlagValue, type GameRun, type Quest, type QuestPack, type QuestResult, type ReplaySnapshot, type SetupInput, type StatKey } from './types';

const BASE_STATS: Record<StatKey, number> = {
  P: 40,
  V: 40,
  O: 40,
  W: 40,
  S: 40,
  M: 40,
  Food: 3,
  Med: 2,
  Tar: 2,
  Timber: 2,
  Wounds: 0,
  A2: 0
};

export interface AdvanceResult {
  run: GameRun;
  questResult?: QuestResult;
  actComplete: boolean;
}

function emptyFlags(pack: QuestPack): Record<string, FlagValue> {
  return Object.fromEntries(pack.flags.map((flag) => [flag, null]));
}

function createStats(overrides?: Partial<Record<StatKey, number>>): Record<StatKey, number> {
  return {
    ...BASE_STATS,
    ...overrides
  };
}

function applyMetaRules(pack: QuestPack, run: GameRun): void {
  const context: EvalContext = {
    ...run.flags,
    ...run.stats,
    ...run.computed
  };

  const metaEntries = Object.values(pack.meta ?? {});
  for (const ruleValue of metaEntries) {
    if (typeof ruleValue !== 'string') {
      continue;
    }

    // Only assignment-style meta expressions are executable in the current runtime.
    if (!/^\s*[A-Za-z_][A-Za-z0-9_]*\s*=/.test(ruleValue)) {
      continue;
    }

    executeAssignment(ruleValue, context, () => undefined);
  }

  for (const key of ACT2_STAT_KEYS) {
    const value = context[key];
    if (typeof value === 'number') {
      run.stats[key] = value;
    }
  }

  for (const flag of pack.flags) {
    if (Object.prototype.hasOwnProperty.call(context, flag)) {
      run.flags[flag] = context[flag];
    }
  }

  captureComputed(pack, run, context);
}

function isStatKey(key: string): key is StatKey {
  return ACT2_STAT_KEYS.includes(key as StatKey);
}

function clampStatFloor(run: GameRun): void {
  for (const key of ACT2_STAT_KEYS) {
    run.stats[key] = Math.round(run.stats[key] * 100) / 100;
  }
}

export function createRun(
  pack: QuestPack,
  setup: SetupInput,
  statOverrides?: Partial<Record<StatKey, number>>
): GameRun {
  const run: GameRun = {
    stats: createStats(statOverrides),
    flags: emptyFlags(pack),
    questIndex: 0,
    nodeIndex: 0,
    choicesByNode: {},
    choiceLog: [],
    questResults: [],
    computed: {}
  };

  run.flags.ending_vector = setup.endingVector;
  run.flags.chapter1 = setup.chapter1;
  run.flags.famine = setup.famine;
  run.flags.oath_shattered = setup.oathShattered;
  run.flags.oath_cracked = setup.oathCracked;
  run.flags.mutiny = setup.mutiny;
  run.flags.sickness = setup.sickness;

  applyMetaRules(pack, run);
  clampStatFloor(run);

  return run;
}

export function getCurrentQuest(pack: QuestPack, run: GameRun): Quest | undefined {
  return pack.quests[run.questIndex];
}

export function getCurrentNode(pack: QuestPack, run: GameRun) {
  const quest = getCurrentQuest(pack, run);
  if (!quest) {
    return undefined;
  }
  return quest.nodes[run.nodeIndex];
}

function applyChoiceEffects(run: GameRun, choice: Choice): void {
  for (const effect of choice.effects ?? []) {
    if (effect.op !== 'add') {
      continue;
    }

    if (isStatKey(effect.target)) {
      run.stats[effect.target] += effect.value;
      continue;
    }

    const existing = run.computed[effect.target];
    const currentValue = typeof existing === 'number' ? existing : 0;
    run.computed[effect.target] = currentValue + effect.value;
  }

  for (const [key, value] of Object.entries(choice.set_flags ?? {})) {
    run.flags[key] = value;
  }

  // Runtime notes with explicit numeric instructions are resolved in-engine.
  if (choice.choice_id === 'Q9_C3_C' && run.stats.Wounds >= 2) {
    run.stats.M -= 3;
  }

  // Existing content note has no numeric value; mark it for observability.
  if (choice.choice_id === 'Q6_C2_C' && run.flags.ending_vector === 'exile') {
    run.computed.q6_exile_smuggle_bonus_applied = true;
  }
}

function buildContext(run: GameRun): EvalContext {
  return {
    ...run.stats,
    ...run.flags,
    ...run.computed
  };
}

function captureComputed(
  pack: QuestPack,
  run: GameRun,
  context: EvalContext
): void {
  for (const [key, value] of Object.entries(context)) {
    if (isStatKey(key) || pack.flags.includes(key)) {
      continue;
    }
    run.computed[key] = value;
  }
}

function applyBand(run: GameRun, band: QuestResult['band']): void {
  for (const effect of band.effects) {
    if (effect.op !== 'add') {
      continue;
    }

    if (isStatKey(effect.target)) {
      run.stats[effect.target] += effect.value;
      continue;
    }

    const existing = run.computed[effect.target];
    const currentValue = typeof existing === 'number' ? existing : 0;
    run.computed[effect.target] = currentValue + effect.value;
  }

  for (const [key, value] of Object.entries(band.set_flags ?? {})) {
    run.flags[key] = value;
  }
}

function resolveQuest(pack: QuestPack, run: GameRun, quest: Quest): QuestResult {
  const context = buildContext(run);
  const choiceLookup = (nodeId: string) => run.choicesByNode[nodeId];

  executeRules(quest.derived, context, choiceLookup);
  executeRules(quest.scoring.rules, context, choiceLookup);

  const finalScoreValue = context[quest.scoring.final_score];
  const score = typeof finalScoreValue === 'number' ? finalScoreValue : Number(finalScoreValue) || 0;

  const band = quest.scoring.bands.find((candidate) => score >= candidate.min && score <= candidate.max);
  if (!band) {
    throw new Error(`No outcome band matched for ${quest.quest_id} score ${score}`);
  }

  captureComputed(pack, run, context);
  applyBand(run, band);

  const questResult: QuestResult = {
    questId: quest.quest_id,
    title: quest.title,
    score,
    band,
    formulaValues: {}
  };

  for (const rule of quest.derived ?? []) {
    questResult.formulaValues[rule.id] = context[rule.id] ?? null;
  }
  for (const rule of quest.scoring.rules) {
    questResult.formulaValues[rule.id] = context[rule.id] ?? null;
  }
  questResult.formulaValues[quest.scoring.final_score] = score;

  run.questResults.push(questResult);

  const postContext = {
    ...buildContext(run),
    [quest.scoring.final_score]: score
  };

  for (const postRule of quest.post_rules ?? []) {
    const assignments = executePostRule(postRule.expression, postContext, choiceLookup);

    for (const [key, value] of Object.entries(assignments)) {
      if (isStatKey(key)) {
        run.stats[key] = typeof value === 'number' ? value : Number(value) || 0;
        continue;
      }

      if (pack.flags.includes(key)) {
        run.flags[key] = value;
      } else {
        run.computed[key] = value;
      }
    }
  }

  captureComputed(pack, run, postContext);
  clampStatFloor(run);

  return questResult;
}

export function cloneRun(run: GameRun): GameRun {
  return {
    ...run,
    stats: { ...run.stats },
    flags: { ...run.flags },
    choicesByNode: { ...run.choicesByNode },
    choiceLog: [...run.choiceLog],
    questResults: run.questResults.map((result) => ({
      ...result,
      formulaValues: { ...result.formulaValues }
    })),
    computed: { ...run.computed }
  };
}

export function advanceRun(pack: QuestPack, run: GameRun, choiceId: string): AdvanceResult {
  const nextRun = cloneRun(run);
  const quest = getCurrentQuest(pack, nextRun);

  if (!quest) {
    return { run: nextRun, actComplete: true };
  }

  const node = quest.nodes[nextRun.nodeIndex];
  const choice = node.choices.find((candidate) => candidate.choice_id === choiceId);

  if (!choice) {
    throw new Error(`Choice ${choiceId} not found for node ${node.node_id}`);
  }

  nextRun.choicesByNode[node.node_id] = choice.choice_id;
  nextRun.choiceLog.push({
    questId: quest.quest_id,
    nodeId: node.node_id,
    choiceId: choice.choice_id,
    choiceText: choice.text
  });

  applyChoiceEffects(nextRun, choice);
  clampStatFloor(nextRun);

  const isQuestEnd = nextRun.nodeIndex === quest.nodes.length - 1;
  if (!isQuestEnd) {
    nextRun.nodeIndex += 1;
    return { run: nextRun, actComplete: false };
  }

  const questResult = resolveQuest(pack, nextRun, quest);

  nextRun.questIndex += 1;
  nextRun.nodeIndex = 0;

  return {
    run: nextRun,
    questResult,
    actComplete: nextRun.questIndex >= pack.quests.length
  };
}

export function buildReplaySnapshots(
  pack: QuestPack,
  setup: SetupInput,
  choiceIds: string[],
  statOverrides?: Partial<Record<StatKey, number>>
): ReplaySnapshot[] {
  const snapshots: ReplaySnapshot[] = [];
  let run = createRun(pack, setup, statOverrides);
  snapshots.push({
    step: 0,
    label: 'Run Start',
    run: cloneRun(run)
  });

  for (let index = 0; index < choiceIds.length; index += 1) {
    const choiceId = choiceIds[index];
    const result = advanceRun(pack, run, choiceId);
    run = result.run;
    const latestChoice = run.choiceLog[run.choiceLog.length - 1];
    snapshots.push({
      step: index + 1,
      label: latestChoice ? `${latestChoice.questId} / ${latestChoice.nodeId}` : `Step ${index + 1}`,
      run: cloneRun(run),
      choice: latestChoice
    });

    if (result.actComplete) {
      break;
    }
  }

  return snapshots;
}
