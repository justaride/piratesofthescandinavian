import { useMemo, useState } from 'react';

import { GameButton } from '../ui/GameButton';
import { defaultPackId, packTitles } from '../../game/store';
import type { PackId, SetupInput } from '../../game/types';

const startingOptions = {
  endingVector: ['conquest', 'accord', 'ashen', 'exile'] as const,
  chapter1: ['dominant', 'stable', 'fragile', 'broken'] as const
};

interface SetupScreenProps {
  onStart: (setup: SetupInput, packId: PackId) => void;
}

export function SetupScreen({ onStart }: SetupScreenProps) {
  const [packId, setPackId] = useState<PackId>(defaultPackId);
  const [setup, setSetup] = useState<SetupInput>({
    endingVector: 'accord',
    chapter1: 'stable',
    famine: false,
    oathShattered: false,
    oathCracked: false,
    mutiny: false,
    sickness: false
  });

  const crisisFlags = useMemo(
    () => [
      { key: 'famine', label: 'Famine pressure' },
      { key: 'oathShattered', label: 'Oath shattered legacy' },
      { key: 'oathCracked', label: 'Oath cracked legacy' },
      { key: 'mutiny', label: 'Mutiny risk active' },
      { key: 'sickness', label: 'Sickness in settlements' }
    ],
    []
  );

  return (
    <section className="mx-auto mt-8 w-full max-w-3xl rounded-3xl border border-white/10 bg-fjord-900/80 p-6 shadow-2xl backdrop-blur-sm">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-amber-200/80">Campaign Setup</p>
        <h1 className="mt-2 font-serif text-3xl text-slate-100">Pirates of the Scandinavian</h1>
        <p className="mt-2 text-sm text-slate-300">
          Choose a campaign pack, then seed your route and crisis state.
        </p>
      </header>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="space-y-1 md:col-span-2">
          <span className="text-xs uppercase tracking-wide text-slate-300">Campaign Pack</span>
          <select
            className="w-full rounded-xl border border-white/15 bg-fjord-800 px-3 py-2 text-slate-100"
            value={packId}
            onChange={(event) => {
              setPackId(event.target.value as PackId);
            }}
          >
            {(Object.keys(packTitles) as PackId[]).map((option) => (
              <option key={option} value={option}>
                {packTitles[option]}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs uppercase tracking-wide text-slate-300">Ending vector</span>
          <select
            className="w-full rounded-xl border border-white/15 bg-fjord-800 px-3 py-2 text-slate-100"
            value={setup.endingVector}
            onChange={(event) => {
              setSetup((current) => ({
                ...current,
                endingVector: event.target.value as SetupInput['endingVector']
              }));
            }}
          >
            {startingOptions.endingVector.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs uppercase tracking-wide text-slate-300">Chapter 1 footing</span>
          <select
            className="w-full rounded-xl border border-white/15 bg-fjord-800 px-3 py-2 text-slate-100"
            value={setup.chapter1}
            onChange={(event) => {
              setSetup((current) => ({
                ...current,
                chapter1: event.target.value as SetupInput['chapter1']
              }));
            }}
          >
            {startingOptions.chapter1.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 grid gap-2 rounded-xl border border-white/10 bg-black/20 p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Crisis Toggles</p>
        {crisisFlags.map((flag) => (
          <label key={flag.key} className="flex items-center gap-2 text-sm text-slate-200">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-400/50 bg-fjord-900"
              checked={Boolean(setup[flag.key as keyof SetupInput])}
              onChange={(event) => {
                const checked = event.target.checked;
                setSetup((current) => ({
                  ...current,
                  [flag.key]: checked
                }));
              }}
            />
            <span>{flag.label}</span>
          </label>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <GameButton onClick={() => onStart(setup, packId)}>Start Campaign</GameButton>
      </div>
    </section>
  );
}
