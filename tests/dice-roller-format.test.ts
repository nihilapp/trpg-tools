import type { DiceExpressionResult } from '@nihilapp/diceroll-v3';
import { describe, expect, it } from 'vitest';

import {
  appendDiceHistory,
  buildDiceHistoryEntry,
  formatDiceExpressionResult
} from '../app/utils/dice-roller-format';

describe('dice-roller-format', () => {
  it('keep/drop, modifiers, success blocks를 화면 모델로 변환한다', () => {
    const result = {
      expression: '2D20kh1+5',
      total: 22,
      modifiers: [ { sign: '+', value: 5, }, ],
      rollDetails: [
        {
          block: '2D20kh1',
          kind: 'keepHighest',
          contribution: 17,
          rollResult: {
            kind: 'keepHighest',
            minNumber: 1,
            maxNumber: 20,
            all: [
              { minNumber: 1, maxNumber: 20, result: 17, isFumble: false, isCritical: false, },
              { minNumber: 1, maxNumber: 20, result: 4, isFumble: false, isCritical: false, },
            ],
            kept: [
              { minNumber: 1, maxNumber: 20, result: 17, isFumble: false, isCritical: false, },
            ],
            dropped: [
              { minNumber: 1, maxNumber: 20, result: 4, isFumble: false, isCritical: false, },
            ],
            total: 17,
          },
        },
      ],
    } satisfies DiceExpressionResult;

    const formatted = formatDiceExpressionResult(result);

    expect(formatted.expression).toBe('2D20kh1+5');
    expect(formatted.total).toBe(22);
    expect(formatted.modifierText).toBe('+5');
    expect(formatted.blocks).toHaveLength(1);
    expect(formatted.blocks[0].dice.map((die) => ({
      value: die.value,
      kept: die.isKept,
      dropped: die.isDropped,
    }))).toEqual([
      { value: 17, kept: true, dropped: false, },
      { value: 4, kept: false, dropped: true, },
    ]);
  });

  it('여러 식 결과를 히스토리 엔트리와 복사 텍스트로 구성한다', () => {
    const results = [
      {
        expression: '5D10>7',
        total: 2,
        modifiers: [],
        rollDetails: [
          {
            block: '5D10>7',
            kind: 'success',
            contribution: 2,
            rollResult: {
              kind: 'success',
              minNumber: 1,
              maxNumber: 10,
              rolls: [
                { minNumber: 1, maxNumber: 10, result: 8, isFumble: false, isCritical: false, },
                { minNumber: 1, maxNumber: 10, result: 9, isFumble: false, isCritical: false, },
                { minNumber: 1, maxNumber: 10, result: 2, isFumble: false, isCritical: false, },
              ],
              successCount: 2,
            },
          },
        ],
      },
      {
        expression: '5D10>8f1',
        total: 1,
        modifiers: [],
        rollDetails: [
          {
            block: '5D10>8f1',
            kind: 'netSuccess',
            contribution: 1,
            rollResult: {
              kind: 'netSuccess',
              minNumber: 1,
              maxNumber: 10,
              rolls: [
                { minNumber: 1, maxNumber: 10, result: 10, isFumble: false, isCritical: false, },
                { minNumber: 1, maxNumber: 10, result: 1, isFumble: true, isCritical: false, },
                { minNumber: 1, maxNumber: 10, result: 9, isFumble: false, isCritical: false, },
              ],
              successCount: 2,
              failureCount: 1,
              total: 1,
            },
          },
        ],
      },
    ] satisfies DiceExpressionResult[];

    const entry = buildDiceHistoryEntry('5d10>7 5d10>8f1', results);

    expect(entry.results).toHaveLength(2);
    expect(entry.results[0].blocks[0].successCount).toBe(2);
    expect(entry.results[1].blocks[0].failureCount).toBe(1);
    expect(entry.copyText).toBe('[주사위] 5D10>7 = 2\n[주사위] 5D10>8f1 = 1');
  });

  it('히스토리를 최신순 20개로 유지한다', () => {
    const entries = Array.from({ length: 20, }, (_, index) =>
      buildDiceHistoryEntry(`D20+${index}`, [
        {
          expression: `D20+${index}`,
          total: index,
          modifiers: [],
          rollDetails: [],
        },
      ])
    ).reverse();

    const nextEntry = buildDiceHistoryEntry('D20+20', [
      {
        expression: 'D20+20',
        total: 20,
        modifiers: [],
        rollDetails: [],
      },
    ]);

    const history = appendDiceHistory(entries, nextEntry);

    expect(history).toHaveLength(20);
    expect(history[0].input).toBe('D20+20');
    expect(history.at(-1)?.input).toBe('D20+1');
  });
});
