import { useEffect, useMemo, useState } from 'react';

import { buildReplaySnapshots } from '../../game/engine';
import { initialSetup } from '../../game/store';
import { GameButton } from '../ui/GameButton';
import type { GameRun, QuestPack, SetupInput } from '../../game/types';

interface FinalScreenProps {
  run: GameRun;
  pack: QuestPack;
  setup: SetupInput | null;
  onRestart: () => void;
  onReturnToSetup: () => void;
}

const replayStatKeys = ['P', 'V', 'O', 'W', 'S', 'M', 'A2'] as const;

export function FinalScreen({ run, pack, setup, onRestart, onReturnToSetup }: FinalScreenProps) {
  const [replayStep, setReplayStep] = useState(0);

  const snapshots = useMemo(() => {
    const choiceIds = run.choiceLog.map((entry) => entry.choiceId);
    return buildReplaySnapshots(pack, setup ?? initialSetup, choiceIds);
  }, [pack, run.choiceLog, setup]);

  useEffect(() => {
    setReplayStep(Math.max(0, snapshots.length - 1));
  }, [snapshots.length]);

  const activeSnapshot = snapshots[Math.min(replayStep, snapshots.length - 1)] ?? snapshots[0];
  const finalStartFlag = pack.act >= 3 ? 'act4_start_state' : 'act3_start_state';
  const finalStart = run.flags[finalStartFlag] ?? 'UNRESOLVED';

  return (
    <section className="mx-auto mt-8 w-full max-w-5xl rounded-3xl border border-white/10 bg-fjord-900/80 p-6 shadow-2xl">
      <p className="text-xs uppercase tracking-[0.2em] text-amber-200/80">Act {pack.act} Complete</p>
      <h1 className="mt-2 text-3xl font-semibold text-slate-100">Campaign Outcome Locked</h1>
      <p className="mt-2 text-slate-300">Next state seed:</p>
      <p className="mt-2 rounded-xl border border-amber-200/40 bg-black/30 px-4 py-3 font-mono text-xl text-amber-100">
        {String(finalStart)}
      </p>

      <div className="mt-5 grid gap-2 rounded-xl border border-white/10 bg-black/20 p-4">
        {run.questResults.map((result) => (
          <div key={result.questId} className="flex items-center justify-between text-sm text-slate-200">
            <span>{result.title}</span>
            <span className="font-mono tabular-nums">
              {result.score.toFixed(1)} ({result.band.label})
            </span>
          </div>
        ))}
      </div>

      <section className="mt-6 rounded-xl border border-white/10 bg-black/25 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Run Replay</p>
            <p className="text-sm text-slate-200">Step {activeSnapshot?.step ?? 0}: {activeSnapshot?.label ?? 'Run Start'}</p>
            {activeSnapshot?.choice ? (
              <p className="text-xs text-slate-400">Choice: {activeSnapshot.choice.choiceText}</p>
            ) : null}
          </div>

          <div className="flex gap-2">
            <GameButton
              tone="secondary"
              onClick={() => setReplayStep((current) => Math.max(0, current - 1))}
              disabled={replayStep <= 0}
            >
              Previous
            </GameButton>
            <GameButton
              tone="secondary"
              onClick={() => setReplayStep((current) => Math.min(snapshots.length - 1, current + 1))}
              disabled={replayStep >= snapshots.length - 1}
            >
              Next
            </GameButton>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-7">
          {replayStatKeys.map((key) => (
            <div key={key} className="rounded-lg border border-white/10 bg-fjord-900/60 px-2 py-1.5 text-center">
              <div className="text-[11px] uppercase tracking-wide text-slate-400">{key}</div>
              <div className="font-mono text-sm text-amber-100">{Math.round(activeSnapshot?.run.stats[key] ?? 0)}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <GameButton tone="ghost" onClick={onReturnToSetup}>Back to Setup</GameButton>
        <GameButton onClick={onRestart}>Run Again</GameButton>
      </div>
    </section>
  );
}
