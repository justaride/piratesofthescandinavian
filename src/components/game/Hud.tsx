import { ResourceBar } from '../ui/ResourceBar';
import type { GameRun, StatKey } from '../../game/types';

interface HudProps {
  run: GameRun;
}

const primaryStats: Array<{ key: StatKey; icon: string; label: string; color: 'gold' | 'green' | 'blue' | 'red' }> = [
  { key: 'P', icon: '☠', label: 'Pirate Rep', color: 'gold' as const },
  { key: 'V', icon: 'ᚠ', label: 'Viking Rep', color: 'blue' as const },
  { key: 'O', icon: '◉', label: 'Oath', color: 'green' as const },
  { key: 'W', icon: '❄', label: 'Winter', color: 'blue' as const },
  { key: 'S', icon: '✶', label: 'Seer', color: 'red' as const },
  { key: 'M', icon: '⚓', label: 'Morale', color: 'green' as const }
];

const resources: Array<{ key: StatKey; icon: string; label: string }> = [
  { key: 'Food', icon: '🍖', label: 'Food' },
  { key: 'Med', icon: '🧪', label: 'Med' },
  { key: 'Tar', icon: '🛢', label: 'Tar' },
  { key: 'Timber', icon: '🪵', label: 'Timber' },
  { key: 'Wounds', icon: '🩸', label: 'Wounds' },
  { key: 'A2', icon: 'ᛟ', label: 'A2' }
];

export function Hud({ run }: HudProps) {
  return (
    <header className="grid gap-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {primaryStats.map((stat) => (
          <ResourceBar
            key={stat.key}
            icon={stat.icon}
            label={stat.label}
            value={run.stats[stat.key]}
            color={stat.color}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-xl border border-white/10 bg-black/25 p-2 sm:grid-cols-6">
        {resources.map((resource) => (
          <div key={resource.key} className="rounded-lg bg-white/5 px-2 py-1.5 text-center text-xs text-slate-200">
            <div className="text-[11px] uppercase tracking-wide text-slate-400">
              {resource.icon} {resource.label}
            </div>
            <div className="mt-0.5 font-mono text-sm tabular-nums">{Math.round(run.stats[resource.key])}</div>
          </div>
        ))}
      </div>
    </header>
  );
}
