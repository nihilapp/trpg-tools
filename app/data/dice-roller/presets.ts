import type { DicePreset } from '../../types/dice-roller.types';

export const basicDicePresets: DicePreset[] = [
  { id: 'd4', label: 'd4', expression: 'd4', description: '사면체', supportsCount: true, defaultCount: 1, minCount: 1, maxCount: 20, },
  { id: 'd6', label: 'd6', expression: 'd6', description: '육면체', supportsCount: true, defaultCount: 1, minCount: 1, maxCount: 20, },
  { id: 'd8', label: 'd8', expression: 'd8', description: '팔면체', supportsCount: true, defaultCount: 1, minCount: 1, maxCount: 20, },
  { id: 'd10', label: 'd10', expression: 'd10', description: '십면체', supportsCount: true, defaultCount: 1, minCount: 1, maxCount: 20, },
  { id: 'd12', label: 'd12', expression: 'd12', description: '십이면체', supportsCount: true, defaultCount: 1, minCount: 1, maxCount: 20, },
  { id: 'd20', label: 'd20', expression: 'd20', description: '이십면체', supportsCount: true, defaultCount: 1, minCount: 1, maxCount: 20, },
  { id: 'd100', label: 'd100', expression: 'd100', description: '백면체', supportsCount: true, defaultCount: 1, minCount: 1, maxCount: 20, },
];

export const specialDicePresets: DicePreset[] = [
  { id: 'percentile', label: 'd%', expression: 'd%', description: '퍼센타일', supportsCount: false, },
  { id: 'advantage', label: '유리함', expression: '2d20kh1', description: '상위 1개 유지', supportsCount: false, },
  { id: 'disadvantage', label: '불리함', expression: '2d20kl1', description: '하위 1개 유지', supportsCount: false, },
  { id: 'd20plus5', label: 'd20+5', expression: 'd20+5', description: '보정 포함 판정', supportsCount: false, },
  { id: 'ability', label: '능력치', expression: '4d6kh3', description: '상위 3개 합산', supportsCount: false, },
  { id: 'success', label: '성공수', expression: '5d10>7', description: '성공 개수 계산', supportsCount: false, },
  { id: 'net-success', label: '순성공', expression: '5d10>8f1', description: '성공-실패 합산', supportsCount: false, },
  { id: 'fate', label: 'Fate', expression: '4dF', description: '페이트 주사위', supportsCount: false, },
];
