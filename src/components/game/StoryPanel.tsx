import { motion, useReducedMotion } from 'framer-motion';

import { GameButton } from '../ui/GameButton';
import { cn } from '../../lib/cn';
import type { Node, Quest } from '../../game/types';

interface StoryPanelProps {
  quest: Quest;
  node: Node;
  selectedChoiceId: string | null;
  onSelect: (choiceId: string) => void;
  onConfirm: () => void;
}

function summarizeChoice(choice: Node['choices'][number]): string {
  const deltas = (choice.effects ?? []).map((effect) => {
    const sign = effect.value >= 0 ? '+' : '';
    return `${effect.target} ${sign}${effect.value}`;
  });

  const flagChanges = Object.entries(choice.set_flags ?? {}).map(([key, value]) => `${key}=${String(value)}`);
  return [...deltas, ...flagChanges].join(' | ');
}

export function StoryPanel({ quest, node, selectedChoiceId, onSelect, onConfirm }: StoryPanelProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="rounded-3xl border border-white/10 bg-fjord-900/70 p-5 shadow-2xl backdrop-blur-sm">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-amber-300/80">Quest {quest.order}</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-100">{quest.title}</h2>
        <div className="mt-3 space-y-1">
          {quest.beat.map((line) => (
            <p key={line} className="text-sm italic text-slate-300/95">
              {line}
            </p>
          ))}
        </div>
      </header>

      <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Decision</p>
        <p className="mt-2 text-lg text-slate-100">{node.prompt}</p>
      </div>

      <div className="mt-4 grid gap-3">
        {node.choices.map((choice, index) => {
          const selected = selectedChoiceId === choice.choice_id;
          return (
            <motion.button
              key={choice.choice_id}
              type="button"
              onClick={() => onSelect(choice.choice_id)}
              className={cn(
                'rounded-xl border px-4 py-3 text-left transition',
                selected
                  ? 'border-amber-300/80 bg-amber-200/10'
                  : 'border-white/10 bg-black/20 hover:border-white/25 hover:bg-white/5'
              )}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <p className="text-sm font-medium text-slate-100">{choice.text}</p>
              <p className="mt-1 text-xs text-slate-400">{summarizeChoice(choice) || 'No direct stat deltas.'}</p>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <GameButton tone="secondary" onClick={onConfirm} disabled={!selectedChoiceId}>
          Confirm Choice
        </GameButton>
      </div>
    </section>
  );
}
