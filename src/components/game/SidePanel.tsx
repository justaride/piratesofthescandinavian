import { Meter } from '../ui/Meter';
import type { GameRun, QuestPack } from '../../game/types';
import { CodexPanel } from './CodexPanel';

interface SidePanelProps {
  run: GameRun;
  pack: QuestPack;
}

function formatFlagValue(value: string | number | boolean | null): string {
  if (value === null) {
    return 'unset';
  }
  if (typeof value === 'boolean') {
    return value ? 'yes' : 'no';
  }
  return String(value);
}

export function SidePanel({ run, pack }: SidePanelProps) {
  const shownFlags = Object.entries(run.flags)
    .filter(([, value]) => value !== null)
    .slice(-12)
    .reverse();

  const currentQuest = pack.quests[run.questIndex];
  const firstOrder = pack.quests[0]?.order ?? 1;
  const lastOrder = pack.quests[pack.quests.length - 1]?.order ?? firstOrder;
  const currentOrder = currentQuest?.order ?? lastOrder;

  const alignmentKeys = ['vector_align', 'faction_fit', 'rift_fit', 'pact_fit', 'settlement_fit', 'route_fit', 'plan_fit'];
  const routeAlignmentValue = (() => {
    for (const key of alignmentKeys) {
      const value = run.computed[key];
      if (typeof value === 'number') {
        return Math.min(100, Math.max(0, 50 + value * 3));
      }
    }
    return 50;
  })();

  return (
    <aside className="space-y-4 rounded-2xl border border-white/10 bg-fjord-900/70 p-4 shadow-xl">
      <section className="rounded-xl border border-white/10 bg-black/20 p-3">
        <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Progress</p>
        <div className="mt-2 text-lg font-semibold text-slate-100">
          Quest {currentOrder} / {lastOrder}
        </div>
        <div className="text-xs text-slate-400">Completed {run.questResults.length} of {pack.quests.length}</div>
        <div className="mt-1 text-xs text-slate-500">Act {pack.act} range starts at Q{firstOrder}</div>
      </section>

      <section className="rounded-xl border border-white/10 bg-black/20 p-3">
        <Meter value={routeAlignmentValue} label="Alignment Signal" />
      </section>

      <section className="rounded-xl border border-white/10 bg-black/20 p-3">
        <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Recent Flags</p>
        <div className="mt-2 grid gap-1.5">
          {shownFlags.length === 0 ? (
            <p className="text-xs text-slate-500">No resolved flags yet.</p>
          ) : (
            shownFlags.map(([key, value]) => (
              <div key={key} className="flex items-center justify-between gap-2 text-xs">
                <span className="text-slate-300">{key}</span>
                <span className="font-mono text-amber-200">{formatFlagValue(value)}</span>
              </div>
            ))
          )}
        </div>
      </section>

      <CodexPanel run={run} pack={pack} />
    </aside>
  );
}
