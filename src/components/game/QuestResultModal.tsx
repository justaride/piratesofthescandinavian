import { GameButton } from '../ui/GameButton';
import { GameModal } from '../ui/GameModal';
import type { QuestResult } from '../../game/types';

interface QuestResultModalProps {
  open: boolean;
  result: QuestResult | null;
  actComplete: boolean;
  onContinue: () => void;
}

const bandTone: Record<string, string> = {
  clean_success: 'text-emerald-300',
  costly_success: 'text-amber-300',
  contested: 'text-sky-300',
  failure: 'text-rose-300'
};

export function QuestResultModal({ open, result, actComplete, onContinue }: QuestResultModalProps) {
  if (!result) {
    return null;
  }

  return (
    <GameModal
      open={open}
      title={`${result.title} Resolved`}
      footer={
        <div className="flex justify-end">
          <GameButton onClick={onContinue}>{actComplete ? 'Open Final Outcome' : 'Continue'}</GameButton>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Score</p>
          <p className="mt-1 font-mono text-3xl text-amber-100">{result.score.toFixed(1)}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Outcome Band</p>
          <p className={`mt-1 text-lg font-semibold ${bandTone[result.band.label] ?? 'text-slate-100'}`}>
            {result.band.label.replaceAll('_', ' ')}
          </p>
        </div>
      </div>
    </GameModal>
  );
}
