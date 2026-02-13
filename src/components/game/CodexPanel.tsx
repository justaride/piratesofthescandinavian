import type { GameRun, QuestPack } from '../../game/types';

interface CodexPanelProps {
  run: GameRun;
  pack: QuestPack;
}

function formatValue(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return 'n/a';
  }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  return String(value);
}

export function CodexPanel({ run, pack }: CodexPanelProps) {
  const results = [...run.questResults].reverse();

  return (
    <section className="rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Scoring Codex</p>

      <div className="mt-2 space-y-2">
        {results.length === 0 ? (
          <p className="text-xs text-slate-500">Complete a quest to inspect formula contributions.</p>
        ) : (
          results.map((result, index) => {
            const quest = pack.quests.find((item) => item.quest_id === result.questId);
            const rules = [...(quest?.derived ?? []), ...(quest?.scoring.rules ?? [])];

            return (
              <details
                key={result.questId}
                open={index === 0}
                className="rounded-lg border border-white/10 bg-fjord-900/55 p-2"
              >
                <summary className="cursor-pointer list-none text-sm text-slate-200">
                  <div className="flex items-center justify-between gap-2">
                    <span>{result.title}</span>
                    <span className="font-mono text-xs text-amber-200">
                      {result.score.toFixed(1)} ({result.band.label})
                    </span>
                  </div>
                </summary>

                <div className="mt-2 space-y-1.5">
                  {rules.map((rule) => (
                    <div key={rule.id} className="rounded-md border border-white/10 bg-black/25 p-2" title={rule.expression}>
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-mono text-slate-300">{rule.id}</span>
                        <span className="font-mono text-amber-200">
                          {formatValue(result.formulaValues?.[rule.id])}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500">{rule.expression}</p>
                    </div>
                  ))}

                  <div className="rounded-md border border-amber-200/20 bg-amber-200/5 p-2">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-mono text-amber-100">{quest?.scoring.final_score ?? 'final_score'}</span>
                      <span className="font-mono text-amber-100">
                        {formatValue(result.formulaValues?.[quest?.scoring.final_score ?? 'final_score'])}
                      </span>
                    </div>
                  </div>
                </div>
              </details>
            );
          })
        )}
      </div>
    </section>
  );
}
