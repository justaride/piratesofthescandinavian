import { Suspense, lazy, useMemo } from 'react';

import { useGameStore } from './game/store';
import { storyPacks } from './game/storyPacks';

const SetupScreen = lazy(() =>
  import('./components/game/SetupScreen').then((module) => ({ default: module.SetupScreen }))
);
const GameScreen = lazy(() =>
  import('./components/game/GameScreen').then((module) => ({ default: module.GameScreen }))
);
const FinalScreen = lazy(() =>
  import('./components/game/FinalScreen').then((module) => ({ default: module.FinalScreen }))
);

export default function App() {
  const phase = useGameStore((state) => state.phase);
  const activePackId = useGameStore((state) => state.activePackId);
  const setup = useGameStore((state) => state.setup);
  const run = useGameStore((state) => state.run);
  const selectedChoiceId = useGameStore((state) => state.selectedChoiceId);
  const latestResult = useGameStore((state) => state.latestResult);
  const error = useGameStore((state) => state.error);

  const startRun = useGameStore((state) => state.startRun);
  const selectChoice = useGameStore((state) => state.selectChoice);
  const confirmChoice = useGameStore((state) => state.confirmChoice);
  const continueAfterQuest = useGameStore((state) => state.continueAfterQuest);
  const restart = useGameStore((state) => state.restart);
  const returnToSetup = useGameStore((state) => state.returnToSetup);

  const activePack = storyPacks[activePackId];

  const body = useMemo(() => {
    if (phase === 'setup' || !run) {
      return <SetupScreen onStart={startRun} />;
    }

    if (phase === 'finished') {
      return <FinalScreen run={run} pack={activePack} setup={setup} onRestart={restart} onReturnToSetup={returnToSetup} />;
    }

    return (
      <GameScreen
        pack={activePack}
        run={run}
        selectedChoiceId={selectedChoiceId}
        result={latestResult}
        phase={phase}
        onSelectChoice={selectChoice}
        onConfirmChoice={confirmChoice}
        onContinue={continueAfterQuest}
      />
    );
  }, [
    phase,
    run,
    activePack,
    setup,
    startRun,
    restart,
    returnToSetup,
    selectedChoiceId,
    latestResult,
    selectChoice,
    confirmChoice,
    continueAfterQuest
  ]);

  return (
    <div className="min-h-screen bg-fjord-900 text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(246,171,93,0.18),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(56,189,248,0.14),transparent_30%),linear-gradient(165deg,#050a0f_0%,#0b1720_55%,#102330_100%)]" />
      {error ? (
        <div className="mx-auto mt-4 w-full max-w-4xl rounded-xl border border-rose-400/35 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          Runtime error: {error}
        </div>
      ) : null}
      <Suspense
        fallback={(
          <div className="mx-auto mt-8 w-full max-w-4xl rounded-xl border border-white/10 bg-black/20 px-4 py-6 text-center text-slate-300">
            Loading campaign view...
          </div>
        )}
      >
        {body}
      </Suspense>
    </div>
  );
}
