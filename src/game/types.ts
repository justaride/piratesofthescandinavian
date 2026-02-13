export const ACT2_STAT_KEYS = [
  'P',
  'V',
  'O',
  'W',
  'S',
  'M',
  'Food',
  'Med',
  'Tar',
  'Timber',
  'Wounds',
  'A2'
] as const;

export type StatKey = (typeof ACT2_STAT_KEYS)[number];
export type FlagValue = string | number | boolean | null;

export interface Effect {
  target: string;
  op: 'add';
  value: number;
}

export interface Choice {
  choice_id: string;
  text: string;
  effects?: Effect[];
  set_flags?: Record<string, FlagValue>;
  notes?: string;
}

export interface Node {
  node_id: string;
  prompt: string;
  choices: Choice[];
}

export interface FormulaRule {
  id: string;
  expression: string;
}

export interface OutcomeBand {
  min: number;
  max: number;
  label: string;
  effects: Effect[];
  set_flags?: Record<string, FlagValue>;
}

export interface Quest {
  quest_id: string;
  order: number;
  title: string;
  beat: string[];
  nodes: Node[];
  derived?: FormulaRule[];
  scoring: {
    rules: FormulaRule[];
    final_score: string;
    bands: OutcomeBand[];
  };
  post_rules?: FormulaRule[];
}

export interface QuestPack {
  version: string;
  formula_language: string;
  act: number;
  stats: string[];
  flags: string[];
  meta?: Record<string, string | number | boolean | null>;
  quests: Quest[];
}

export type PackId = 'act2' | 'act3';

export interface SetupInput {
  endingVector: 'conquest' | 'accord' | 'ashen' | 'exile';
  chapter1: 'dominant' | 'stable' | 'fragile' | 'broken';
  famine: boolean;
  oathShattered: boolean;
  oathCracked: boolean;
  mutiny: boolean;
  sickness: boolean;
}

export interface ChoiceLog {
  questId: string;
  nodeId: string;
  choiceId: string;
  choiceText: string;
}

export interface QuestResult {
  questId: string;
  title: string;
  score: number;
  band: OutcomeBand;
  formulaValues: Record<string, FlagValue>;
}

export interface GameRun {
  stats: Record<StatKey, number>;
  flags: Record<string, FlagValue>;
  questIndex: number;
  nodeIndex: number;
  choicesByNode: Record<string, string>;
  choiceLog: ChoiceLog[];
  questResults: QuestResult[];
  computed: Record<string, FlagValue>;
}

export interface ReplaySnapshot {
  step: number;
  label: string;
  run: GameRun;
  choice?: ChoiceLog;
}
