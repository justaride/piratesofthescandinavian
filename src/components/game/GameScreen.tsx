import { useEffect } from 'react';

import { getCurrentNode, getCurrentQuest } from '../../game/engine';
import { useAnnounce } from '../../game/useAnnounce';
import type { GameRun, QuestPack, QuestResult } from '../../game/types';
import { Hud } from './Hud';
import { QuestResultModal } from './QuestResultModal';
import { SidePanel } from './SidePanel';
import { StoryPanel } from './StoryPanel';

interface GameScreenProps {
  pack: QuestPack;
  run: GameRun;
  selectedChoiceId: string | null;
  result: QuestResult | null;
  phase: 'playing' | 'quest_result';
  onSelectChoice: (choiceId: string) => void;
  onConfirmChoice: () => void;
  onContinue: () => void;
}

export function GameScreen({
  pack,
  run,
  selectedChoiceId,
  result,
  phase,
  onSelectChoice,
  onConfirmChoice,
  onContinue
}: GameScreenProps) {
  const { announce, AnnouncerRegion } = useAnnounce();
  const quest = getCurrentQuest(pack, run);
  const node = getCurrentNode(pack, run);

  useEffect(() => {
    if (!node) {
      return;
    }

    announce(`Quest ${quest?.order ?? ''}: ${node.prompt}`);
  }, [announce, node, quest?.order]);

  useEffect(() => {
    if (!result) {
      return;
    }
    announce(`${result.title} resolved with ${result.band.label.replaceAll('_', ' ')}`);
  }, [announce, result]);

  return (
    <div className="mx-auto grid w-full max-w-[1400px] gap-4 px-4 pb-10 pt-5 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <Hud run={run} />

        {quest && node ? (
          <StoryPanel
            quest={quest}
            node={node}
            selectedChoiceId={selectedChoiceId}
            onSelect={onSelectChoice}
            onConfirm={onConfirmChoice}
          />
        ) : null}
      </div>

      <SidePanel run={run} pack={pack} />

      <QuestResultModal
        open={phase === 'quest_result'}
        result={result}
        actComplete={false}
        onContinue={onContinue}
      />

      <AnnouncerRegion />
    </div>
  );
}
