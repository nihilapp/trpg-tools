import type { DiceExpressionResult, RollKind } from '@nihilapp/diceroll-v3';

export type DiceRollerTab = 'preset' | 'custom';

export interface DicePreset {
  id: string;
  label: string;
  expression: string;
  description: string;
  supportsCount: boolean;
  defaultCount?: number;
  minCount?: number;
  maxCount?: number;
}

export interface FormattedDie {
  value: number | string;
  isKept: boolean;
  isDropped: boolean;
  isCritical: boolean;
  isFumble: boolean;
  isSuccess?: boolean;
  isFailure?: boolean;
}

export interface FormattedDiceBlock {
  block: string;
  kind: RollKind;
  contribution: number;
  summary: string;
  dice: FormattedDie[];
  successCount?: number;
  failureCount?: number;
}

export interface FormattedExpressionResult {
  expression: string;
  total: number;
  modifierText: string;
  blocks: FormattedDiceBlock[];
}

export interface DiceRollHistoryEntry {
  id: string;
  input: string;
  rolledAt: string;
  results: FormattedExpressionResult[];
  rawResults: DiceExpressionResult[];
  copyText: string;
}
