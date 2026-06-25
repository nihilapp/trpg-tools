import type {
  DiceBlockRollDetail,
  DiceExpressionResult,
  ModifierEntry,
  RollKind,
  RollResult
} from '@nihilapp/diceroll-v3';

import type {
  DiceRollHistoryEntry,
  FormattedDiceBlock,
  FormattedDie,
  FormattedExpressionResult
} from '../types/dice-roller.types';

type ComparisonOperator = '>' | '>=' | '=' | '<' | '<=';

interface ComparisonCondition {
  operator: ComparisonOperator;
  value: number;
}

interface SuccessConditions {
  success?: ComparisonCondition;
  failure?: ComparisonCondition;
}

interface NumericDie {
  result: number;
  isCritical: boolean;
  isFumble: boolean;
}

function toModifierText(modifiers: ModifierEntry[]): string {
  return modifiers.map((modifier) => `${modifier.sign}${modifier.value}`).join('');
}

function makeDieKey(die: NumericDie): string {
  return `${die.result}:${die.isCritical
    ? '1'
    : '0'}:${die.isFumble
    ? '1'
    : '0'}`;
}

function buildDieCounts(dice: NumericDie[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const die of dice) {
    const key = makeDieKey(die);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return counts;
}

function consumeDieCount(counts: Map<string, number>, die: NumericDie): boolean {
  const key = makeDieKey(die);
  const current = counts.get(key) ?? 0;

  if (current <= 0) {
    return false;
  }

  counts.set(key, current - 1);
  return true;
}

function parseCondition(fragment: string | undefined): ComparisonCondition | undefined {
  if (!fragment) {
    return undefined;
  }

  const match = fragment.match(/^(>=|<=|>|<|=)?(\d+)$/);

  if (!match) {
    return undefined;
  }

  return {
    operator: (match[1] ?? '=') as ComparisonOperator,
    value: Number(match[2]),
  };
}

function matchesCondition(value: number, condition: ComparisonCondition | undefined): boolean {
  if (!condition) {
    return false;
  }

  switch (condition.operator) {
    case '>':
      return value > condition.value;
    case '>=':
      return value >= condition.value;
    case '=':
      return value === condition.value;
    case '<':
      return value < condition.value;
    case '<=':
      return value <= condition.value;
  }
}

function parseSuccessConditions(block: string): SuccessConditions {
  const [ , successFragment = '', failureFragment = '', ] = block.match(/^[^><=f]+((?:>=|<=|>|<|=)\d+)(?:f((?:>=|<=|>|<|=)?\d+))?$/i) ?? [];

  return {
    success: parseCondition(successFragment),
    failure: parseCondition(failureFragment),
  };
}

function formatNumericDice(
  dice: NumericDie[],
  keptDice: NumericDie[] = [],
  droppedDice: NumericDie[] = [],
  conditions?: SuccessConditions
): FormattedDie[] {
  const keptCounts = buildDieCounts(keptDice);
  const droppedCounts = buildDieCounts(droppedDice);

  return dice.map((die) => {
    const isKept = keptDice.length === 0
      ? true
      : consumeDieCount(keptCounts, die);
    const isDropped = droppedDice.length > 0 && consumeDieCount(droppedCounts, die);

    return {
      value: die.result,
      isKept,
      isDropped,
      isCritical: die.isCritical,
      isFumble: die.isFumble,
      isSuccess: matchesCondition(die.result, conditions?.success),
      isFailure: matchesCondition(die.result, conditions?.failure),
    };
  });
}

function formatBasicLikeBlock(detail: DiceBlockRollDetail): FormattedDiceBlock {
  const rollResult = detail.rollResult as Extract<RollResult, { rolls: NumericDie[] }>;
  const conditions = detail.kind === 'success' || detail.kind === 'netSuccess'
    ? parseSuccessConditions(detail.block)
    : undefined;

  const successCount = 'successCount' in rollResult
    ? rollResult.successCount
    : undefined;
  const failureCount = 'failureCount' in rollResult
    ? rollResult.failureCount
    : undefined;

  return {
    block: detail.block,
    kind: detail.kind,
    contribution: detail.contribution,
    summary: describeBlock(detail.kind, detail.contribution, successCount, failureCount),
    dice: formatNumericDice(rollResult.rolls, [], [], conditions),
    successCount,
    failureCount,
  };
}

function formatKeepDropBlock(detail: DiceBlockRollDetail): FormattedDiceBlock {
  const rollResult = detail.rollResult as Extract<RollResult, { all: NumericDie[]; kept: NumericDie[]; dropped: NumericDie[] }>;

  return {
    block: detail.block,
    kind: detail.kind,
    contribution: detail.contribution,
    summary: describeBlock(detail.kind, detail.contribution, rollResult.kept.length, rollResult.dropped.length),
    dice: formatNumericDice(rollResult.all, rollResult.kept, rollResult.dropped),
  };
}

function formatPercentileBlock(detail: DiceBlockRollDetail): FormattedDiceBlock {
  const rollResult = detail.rollResult as Extract<RollResult, { result: number; isCritical: boolean; isFumble: boolean }>;

  return {
    block: detail.block,
    kind: detail.kind,
    contribution: detail.contribution,
    summary: `결과 ${rollResult.result}`,
    dice: [ {
      value: rollResult.result,
      isKept: true,
      isDropped: false,
      isCritical: rollResult.isCritical,
      isFumble: rollResult.isFumble,
    }, ],
  };
}

function formatFateBlock(detail: DiceBlockRollDetail): FormattedDiceBlock {
  const rollResult = detail.rollResult as Extract<RollResult, { dice: Array<-1 | 0 | 1> }>;

  return {
    block: detail.block,
    kind: detail.kind,
    contribution: detail.contribution,
    summary: `합계 ${detail.contribution}`,
    dice: rollResult.dice.map((value) => ({
      value: value === 1
        ? '+1'
        : value === -1
          ? '-1'
          : '0',
      isKept: true,
      isDropped: false,
      isCritical: false,
      isFumble: false,
    })),
  };
}

function describeBlock(kind: RollKind, contribution: number, firstCount?: number, secondCount?: number): string {
  switch (kind) {
    case 'keepHighest':
    case 'keepLowest':
      return `유지 ${firstCount ?? 0}개, 제외 ${secondCount ?? 0}개, 합계 ${contribution}`;
    case 'dropHighest':
    case 'dropLowest':
      return `사용 ${firstCount ?? 0}개, 제외 ${secondCount ?? 0}개, 합계 ${contribution}`;
    case 'success':
      return `성공 ${firstCount ?? contribution}개`;
    case 'netSuccess':
      return `성공 ${firstCount ?? 0}개, 실패 ${secondCount ?? 0}개, 순성공 ${contribution}`;
    case 'percentile':
      return `결과 ${contribution}`;
    default:
      return `합계 ${contribution}`;
  }
}

function formatBlock(detail: DiceBlockRollDetail): FormattedDiceBlock {
  switch (detail.kind) {
    case 'keepHighest':
    case 'keepLowest':
    case 'dropHighest':
    case 'dropLowest':
      return formatKeepDropBlock(detail);
    case 'fate':
      return formatFateBlock(detail);
    case 'percentile':
      return formatPercentileBlock(detail);
    default:
      return formatBasicLikeBlock(detail);
  }
}

function formatCopyLine(result: FormattedExpressionResult): string {
  return `[주사위] ${result.expression} = ${result.total}`;
}

export function formatDiceExpressionResult(result: DiceExpressionResult): FormattedExpressionResult {
  return {
    expression: result.expression,
    total: result.total,
    modifierText: toModifierText(result.modifiers),
    blocks: result.rollDetails.map(formatBlock),
  };
}

export function buildDiceHistoryEntry(input: string, results: DiceExpressionResult[]): DiceRollHistoryEntry {
  const formattedResults = results.map(formatDiceExpressionResult);

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    input: input.trim(),
    rolledAt: new Date().toISOString(),
    results: formattedResults,
    rawResults: results,
    copyText: formattedResults.map(formatCopyLine).join('\n'),
  };
}

export function appendDiceHistory(
  history: DiceRollHistoryEntry[],
  entry: DiceRollHistoryEntry,
  limit = 20
): DiceRollHistoryEntry[] {
  return [ entry, ...history, ].slice(0, limit);
}
