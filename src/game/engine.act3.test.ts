import { describe, expect, it } from 'vitest';

import { advanceRun, createRun, getCurrentNode } from './engine';
import { storyPacks } from './storyPacks';
import type { SetupInput } from './types';

const act3Pack = storyPacks.act3;

const setup: SetupInput = {
  endingVector: 'accord',
  chapter1: 'stable',
  famine: false,
  oathShattered: false,
  oathCracked: false,
  mutiny: false,
  sickness: false
};

const accordAct3Path: Record<string, string> = {
  Q11_C1: 'Q11_C1_B',
  Q11_C2: 'Q11_C2_B',
  Q11_C3: 'Q11_C3_B',
  Q12_C1: 'Q12_C1_B',
  Q12_C2: 'Q12_C2_B',
  Q12_C3: 'Q12_C3_B',
  Q13_C1: 'Q13_C1_B',
  Q13_C2: 'Q13_C2_B',
  Q13_C3: 'Q13_C3_B',
  Q14_C1: 'Q14_C1_B',
  Q14_C2: 'Q14_C2_B',
  Q14_C3: 'Q14_C3_C',
  Q15_C1: 'Q15_C1_B',
  Q15_C2: 'Q15_C2_B',
  Q15_C3: 'Q15_C3_B'
};

function playAct3() {
  let run = createRun(act3Pack, setup);

  while (true) {
    const node = getCurrentNode(act3Pack, run);
    if (!node) {
      break;
    }

    const choiceId = accordAct3Path[node.node_id];
    expect(choiceId).toBeDefined();

    const result = advanceRun(act3Pack, run, choiceId);
    run = result.run;

    if (result.actComplete) {
      break;
    }
  }

  return run;
}

describe('act 3 scaffold runtime', () => {
  it('completes all scaffold quests and resolves act 4 seed', () => {
    const run = playAct3();

    expect(run.questResults).toHaveLength(5);
    expect(run.flags.act4_start_state).toBe('CHARTER_COMMONWEALTH');
  });

  it('is deterministic for the same setup and path', () => {
    const first = playAct3();
    const second = playAct3();

    expect(first).toEqual(second);
  });
});
