import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { advanceRun, createRun } from './engine';
import { packTitles, storyPacks } from './storyPacks';
import type { GameRun, PackId, QuestResult, SetupInput } from './types';

export type GamePhase = 'setup' | 'playing' | 'quest_result' | 'finished';

interface GameStore {
  phase: GamePhase;
  activePackId: PackId;
  setup: SetupInput | null;
  run: GameRun | null;
  selectedChoiceId: string | null;
  latestResult: QuestResult | null;
  error: string | null;
  startRun: (setup: SetupInput, packId: PackId) => void;
  selectChoice: (choiceId: string) => void;
  confirmChoice: () => void;
  continueAfterQuest: () => void;
  restart: () => void;
  returnToSetup: () => void;
}

export const initialSetup: SetupInput = {
  endingVector: 'accord',
  chapter1: 'stable',
  famine: false,
  oathShattered: false,
  oathCracked: false,
  mutiny: false,
  sickness: false
};

const defaultPackId: PackId = 'act2';

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      phase: 'setup',
      activePackId: defaultPackId,
      setup: null,
      run: null,
      selectedChoiceId: null,
      latestResult: null,
      error: null,

      startRun: (setup, packId) => {
        const run = createRun(storyPacks[packId], setup);
        set({
          activePackId: packId,
          setup,
          run,
          phase: 'playing',
          selectedChoiceId: null,
          latestResult: null,
          error: null
        });
      },

      selectChoice: (choiceId) => {
        if (get().phase !== 'playing') {
          return;
        }

        set({ selectedChoiceId: choiceId });
      },

      confirmChoice: () => {
        const state = get();
        if (state.phase !== 'playing' || !state.run || !state.selectedChoiceId) {
          return;
        }

        try {
          const pack = storyPacks[state.activePackId];
          const result = advanceRun(pack, state.run, state.selectedChoiceId);

          if (result.questResult) {
            set({
              run: result.run,
              latestResult: result.questResult,
              selectedChoiceId: null,
              phase: result.actComplete ? 'finished' : 'quest_result',
              error: null
            });
            return;
          }

          set({
            run: result.run,
            selectedChoiceId: null,
            error: null
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown runtime error';
          set({ error: message });
        }
      },

      continueAfterQuest: () => {
        if (get().phase !== 'quest_result') {
          return;
        }

        set({
          phase: 'playing',
          latestResult: null,
          selectedChoiceId: null
        });
      },

      restart: () => {
        const state = get();
        const setup = state.setup ?? initialSetup;
        const packId = state.activePackId;
        const run = createRun(storyPacks[packId], setup);

        set({
          phase: 'playing',
          setup,
          run,
          selectedChoiceId: null,
          latestResult: null,
          error: null
        });
      },

      returnToSetup: () => {
        set({
          phase: 'setup',
          run: null,
          selectedChoiceId: null,
          latestResult: null,
          error: null
        });
      }
    }),
    {
      name: 'pirates-of-scandinavian-runtime-v1',
      version: 2,
      partialize: (state) => ({
        phase: state.phase,
        activePackId: state.activePackId,
        setup: state.setup,
        run: state.run,
        selectedChoiceId: state.selectedChoiceId,
        latestResult: state.latestResult
      })
    }
  )
);

export { defaultPackId, packTitles };
