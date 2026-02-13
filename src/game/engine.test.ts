import { describe, expect, it } from 'vitest';

import { advanceRun, buildReplaySnapshots, createRun, getCurrentNode, getCurrentQuest } from './engine';
import { storyPack } from './storyPack';
import type { SetupInput, StatKey } from './types';

const highStats: Partial<Record<StatKey, number>> = {
  P: 70,
  V: 70,
  O: 70,
  W: 70,
  S: 70,
  M: 70,
  Food: 6,
  Med: 4,
  Tar: 4,
  Timber: 4,
  Wounds: 0,
  A2: 0
};

const defaultSetup: Omit<SetupInput, 'endingVector'> = {
  chapter1: 'stable',
  famine: false,
  oathShattered: false,
  oathCracked: false,
  mutiny: false,
  sickness: false
};

const routePaths: Record<string, Record<string, string>> = {
  conquest: {
    Q6_C1: 'Q6_C1_A',
    Q6_C2: 'Q6_C2_B',
    Q6_C3: 'Q6_C3_A',
    Q7_C1: 'Q7_C1_B',
    Q7_C2: 'Q7_C2_B',
    Q7_C3: 'Q7_C3_A',
    Q8_C1: 'Q8_C1_B',
    Q8_C2: 'Q8_C2_B',
    Q8_C3: 'Q8_C3_B',
    Q9_C1: 'Q9_C1_A',
    Q9_C2: 'Q9_C2_A',
    Q9_C3: 'Q9_C3_C',
    Q10_C1: 'Q10_C1_A',
    Q10_C2: 'Q10_C2_A',
    Q10_C3: 'Q10_C3_C'
  },
  accord: {
    Q6_C1: 'Q6_C1_B',
    Q6_C2: 'Q6_C2_B',
    Q6_C3: 'Q6_C3_B',
    Q7_C1: 'Q7_C1_C',
    Q7_C2: 'Q7_C2_B',
    Q7_C3: 'Q7_C3_C',
    Q8_C1: 'Q8_C1_B',
    Q8_C2: 'Q8_C2_A',
    Q8_C3: 'Q8_C3_B',
    Q9_C1: 'Q9_C1_B',
    Q9_C2: 'Q9_C2_B',
    Q9_C3: 'Q9_C3_B',
    Q10_C1: 'Q10_C1_B',
    Q10_C2: 'Q10_C2_E',
    Q10_C3: 'Q10_C3_B'
  },
  ashen: {
    Q6_C1: 'Q6_C1_C',
    Q6_C2: 'Q6_C2_C',
    Q6_C3: 'Q6_C3_C',
    Q7_C1: 'Q7_C1_D',
    Q7_C2: 'Q7_C2_C',
    Q7_C3: 'Q7_C3_A',
    Q8_C1: 'Q8_C1_D',
    Q8_C2: 'Q8_C2_C',
    Q8_C3: 'Q8_C3_C',
    Q9_C1: 'Q9_C1_D',
    Q9_C2: 'Q9_C2_D',
    Q9_C3: 'Q9_C3_D',
    Q10_C1: 'Q10_C1_D',
    Q10_C2: 'Q10_C2_D',
    Q10_C3: 'Q10_C3_C'
  },
  exile: {
    Q6_C1: 'Q6_C1_C',
    Q6_C2: 'Q6_C2_C',
    Q6_C3: 'Q6_C3_A',
    Q7_C1: 'Q7_C1_A',
    Q7_C2: 'Q7_C2_B',
    Q7_C3: 'Q7_C3_A',
    Q8_C1: 'Q8_C1_C',
    Q8_C2: 'Q8_C2_D',
    Q8_C3: 'Q8_C3_C',
    Q9_C1: 'Q9_C1_D',
    Q9_C2: 'Q9_C2_C',
    Q9_C3: 'Q9_C3_C',
    Q10_C1: 'Q10_C1_E',
    Q10_C2: 'Q10_C2_C',
    Q10_C3: 'Q10_C3_C'
  }
};

function playAct2(endingVector: SetupInput['endingVector'], path: Record<string, string>) {
  let run = createRun(storyPack, { ...defaultSetup, endingVector }, highStats);

  while (true) {
    const node = getCurrentNode(storyPack, run);
    if (!node) {
      break;
    }

    const choiceId = path[node.node_id];
    expect(choiceId).toBeDefined();

    const result = advanceRun(storyPack, run, choiceId);
    run = result.run;

    if (result.actComplete) {
      break;
    }
  }

  return run;
}

describe('engine runtime', () => {
  it('is deterministic for identical setup + choices', () => {
    const path = routePaths.accord;
    const first = playAct2('accord', path);
    const second = playAct2('accord', path);

    expect(first).toEqual(second);
  });

  it('resolves route-aligned Act 3 start states', () => {
    const conquestRun = playAct2('conquest', routePaths.conquest);
    const accordRun = playAct2('accord', routePaths.accord);
    const ashenRun = playAct2('ashen', routePaths.ashen);
    const exileRun = playAct2('exile', routePaths.exile);

    expect(conquestRun.flags.act3_start_state).toBe('WARLORD_ASCENDANT');
    expect(accordRun.flags.act3_start_state).toBe('TREATY_REGENT');
    expect(ashenRun.flags.act3_start_state).toBe('ASH_PROPHET');
    expect(exileRun.flags.act3_start_state).toBe('GHOST_ADMIRAL');
  });

  it('applies explicit runtime note penalties', () => {
    const pathToGateCrisis: Record<string, string> = {
      Q6_C1: 'Q6_C1_B',
      Q6_C2: 'Q6_C2_B',
      Q6_C3: 'Q6_C3_B',
      Q7_C1: 'Q7_C1_C',
      Q7_C2: 'Q7_C2_B',
      Q7_C3: 'Q7_C3_C',
      Q8_C1: 'Q8_C1_B',
      Q8_C2: 'Q8_C2_A',
      Q8_C3: 'Q8_C3_B',
      Q9_C1: 'Q9_C1_B',
      Q9_C2: 'Q9_C2_B'
    };

    let run = createRun(storyPack, { ...defaultSetup, endingVector: 'accord' }, highStats);

    while (true) {
      const node = getCurrentNode(storyPack, run);
      const quest = getCurrentQuest(storyPack, run);
      expect(node).toBeDefined();
      expect(quest).toBeDefined();

      if (!node) {
        break;
      }

      if (node.node_id === 'Q9_C3') {
        break;
      }

      const choiceId = pathToGateCrisis[node.node_id];
      expect(choiceId).toBeDefined();

      run = advanceRun(storyPack, run, choiceId).run;
    }

    run.stats.Wounds = 2;
    const moraleBefore = run.stats.M;

    const result = advanceRun(storyPack, run, 'Q9_C3_C');
    const moraleAfter = result.run.stats.M;

    expect(moraleAfter).toBeCloseTo(moraleBefore - 3, 5);
  });

  it('builds replay snapshots from logged choices', () => {
    const run = playAct2('accord', routePaths.accord);
    const snapshots = buildReplaySnapshots(
      storyPack,
      { ...defaultSetup, endingVector: 'accord' },
      run.choiceLog.map((entry) => entry.choiceId),
      highStats
    );

    expect(snapshots[0]?.step).toBe(0);
    expect(snapshots[snapshots.length - 1]?.run.flags.act3_start_state).toBe('TREATY_REGENT');
    expect(snapshots).toHaveLength(run.choiceLog.length + 1);
  });
});
