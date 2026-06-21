import type {
  AttackMode,
  BehaviorPattern,
  DamageType,
  FieldState,
  LeaderStatus,
  MajorType,
  MonsterResult,
  MonsterRollTables,
  Movement,
  OriginContext,
  Resource,
  RiskSignal,
  Sense,
  Size,
  SocialPattern,
  Subtype,
  Trace
} from '~/types/monster-roll-table.types';

function randomSelect<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function rollDice(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

function toNumber(value: number | string | undefined, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed)
    ? parsed
    : fallback;
}

function rollWithWeight<T extends { roll_min?: number; roll_max?: number }>(array: T[]): T {
  const roll = rollDice(100);

  for (const item of array) {
    const min = toNumber(item.roll_min, 1);
    const max = toNumber(item.roll_max, 100);

    if (roll >= min && roll <= max) {
      return item;
    }
  }

  return array[0];
}

function selectMultiple<T>(array: T[], count: number): T[] {
  const shuffled = [ ...array, ].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateFieldState(tables: MonsterRollTables, origin: OriginContext): FieldState {
  const originId = origin.origin_id.toLowerCase();
  const allowedStateIds: Record<string, string[]> = {
    field: [ 'field_normal', 'leader_individual', 'alpha_individual', ],
    settlement_edge: [ 'settlement_edge', 'leader_individual', 'alpha_individual', ],
    ruin: [ 'field_normal', 'leader_individual', ],
    dungeon_inner: [ 'dungeon_interior', 'dungeon_guardian_bound', 'dungeon_boss', ],
    dungeon_guardian: [ 'dungeon_guardian', 'dungeon_guardian_bound', ],
    angra_fog: [ 'angra_fog_creature', 'angra_predator', 'totem_minion', ],
    totem_guardian: [ 'totem_guardian', ],
    resonance_zone: [ 'resonance_1', 'resonance_2', 'resonance_3', 'guardian_precursor', ],
    blackstone_site: [ 'blackstone_reactive', 'blackstone_crystallized', ],
  };
  const filtered = tables.fieldStates.filter((state) => {
    const stateId = state.state_id.toLowerCase();
    const allowed = allowedStateIds[originId];
    return allowed
      ? allowed.includes(stateId)
      : true;
  });

  return filtered.length > 0
    ? randomSelect(filtered)
    : randomSelect(tables.fieldStates);
}

function generateMajorType(tables: MonsterRollTables, fieldState: FieldState): MajorType {
  const stateId = fieldState.state_id.toLowerCase();
  let filtered = tables.majorTypes;

  if ([ 'dungeon_guardian', 'totem_guardian', ].includes(stateId)) {
    filtered = tables.majorTypes.filter((type) => [
      'Monstrosity',
      'Undead',
      'Construct',
      'Dragon',
      'Aberration',
      'Elemental',
      'Giant',
    ].includes(type.type_en));
  }
  else if ([ 'dungeon_interior', 'dungeon_guardian_bound', ].includes(stateId)) {
    filtered = tables.majorTypes.filter((type) => [
      'Monstrosity',
      'Undead',
      'Ooze',
      'Construct',
      'Aberration',
      'Beast',
    ].includes(type.type_en));
  }
  else if ([ 'angra_fog_creature', 'angra_predator', 'totem_minion', ].includes(stateId)) {
    filtered = tables.majorTypes.filter((type) => [
      'Monstrosity',
      'Beast',
      'Plant',
      'Aberration',
      'Undead',
      'Ooze',
      'Elemental',
    ].includes(type.type_en));
  }

  return rollWithWeight(filtered);
}

function generateSubtypes(tables: MonsterRollTables, majorType: MajorType, count: number): Subtype[] {
  const filtered = tables.subtypes.filter((subtype) => subtype.major_type_en === majorType.type_en);

  if (filtered.length === 0) {
    return [];
  }

  const selected: Subtype[] = [];
  const available = [ ...filtered, ];

  for (let i = 0; i < Math.min(count, available.length); i++) {
    const subtype = randomSelect(available);
    selected.push(subtype);

    const index = available.indexOf(subtype);

    if (index > -1) {
      available.splice(index, 1);
    }
  }

  return selected;
}

function generateSize(tables: MonsterRollTables, majorType: MajorType, fieldState: FieldState): Size {
  const stateId = fieldState.state_id.toLowerCase();

  if ([ 'dungeon_guardian', 'totem_guardian', ].includes(stateId)) {
    const filtered = tables.sizes.filter((size) => [ 'Large', 'Huge', 'Gargantuan', ].includes(size.size_en));

    if (filtered.length > 0) {
      return randomSelect(filtered);
    }
  }

  if ([ 'Dragon', 'Giant', ].includes(majorType.type_en)) {
    const filtered = tables.sizes.filter((size) => [ 'Large', 'Huge', 'Gargantuan', ].includes(size.size_en));

    if (filtered.length > 0 && Math.random() > 0.3) {
      return randomSelect(filtered);
    }
  }

  return rollWithWeight(tables.sizes);
}

function generateLeaderStatus(tables: MonsterRollTables, fieldState: FieldState): LeaderStatus {
  const stateId = fieldState.state_id.toLowerCase();

  if ([ 'dungeon_guardian', 'totem_guardian', ].includes(stateId)) {
    const filtered = tables.leaderStatuses.filter((leader) => leader.leader_grade_ko === '가디언급');

    if (filtered.length > 0) {
      return randomSelect(filtered);
    }
  }

  if (stateId === 'guardian_precursor') {
    const filtered = tables.leaderStatuses.filter((leader) => [
      '알파 개체',
      '군주 개체',
      '가디언급',
    ].includes(leader.leader_grade_ko));

    if (filtered.length > 0) {
      return randomSelect(filtered);
    }
  }

  return rollWithWeight(tables.leaderStatuses);
}

function generateSocialPattern(tables: MonsterRollTables, leaderStatus: LeaderStatus): SocialPattern {
  const allowedByGrade: Record<string, string[]> = {
    '개체': [ '단독', '쌍', '소규모 무리', ],
    '무리 우두머리': [ '소규모 무리', '둥지', '위계 집단', ],
    '알파 개체': [ '대규모 무리', '위계 집단', '군락', ],
    '군주 개체': [ '대규모 무리', '위계 집단', '지역 지배', ],
    '가디언급': [ '단독', '하위 개체 동반', ],
  };
  const allowed = allowedByGrade[leaderStatus.leader_grade_ko];

  if (allowed) {
    const filtered = tables.socialPatterns.filter((pattern) => allowed.includes(pattern.social_ko));

    if (filtered.length > 0) {
      return randomSelect(filtered);
    }
  }

  return randomSelect(tables.socialPatterns);
}

function generateBehaviorPatterns(tables: MonsterRollTables, fieldState: FieldState, count: number): BehaviorPattern[] {
  const stateId = fieldState.state_id.toLowerCase();
  let filtered = tables.behaviorPatterns;

  if ([ 'dungeon_guardian', 'totem_guardian', ].includes(stateId)) {
    filtered = tables.behaviorPatterns.filter((behavior) => [
      '수호형',
      '영역형',
      '지휘형',
      '광폭형',
    ].includes(behavior.behavior_ko));
  }
  else if (stateId.includes('angra')) {
    filtered = tables.behaviorPatterns.filter((behavior) => [
      '추격형',
      '매복형',
      '유인형',
      '오염 확산형',
    ].includes(behavior.behavior_ko));
  }

  return selectMultiple(filtered, count);
}

function generateMovements(tables: MonsterRollTables, majorType: MajorType, count: number): Movement[] {
  const filtered = tables.movements.filter((movement) => {
    if (majorType.type_en === 'Undead') {
      return [ 'floating', 'teleport', 'burrow', ].includes(movement.movement_id);
    }

    if (majorType.type_en === 'Construct') {
      return [ 'mechanical', 'floating', ].includes(movement.movement_id);
    }

    if (majorType.type_en === 'Ooze') {
      return [ 'oozing', 'burrow', ].includes(movement.movement_id);
    }

    return true;
  });

  return selectMultiple(filtered.length > 0
    ? filtered
    : tables.movements, count);
}

function generateSenses(tables: MonsterRollTables, origin: OriginContext, count: number): Sense[] {
  const originId = origin.origin_id.toLowerCase();
  let filtered = tables.senses;

  if (originId === 'dungeon_inner' || originId === 'dungeon_guardian') {
    filtered = tables.senses.filter((sense) => [ 'darkvision', 'tremorsense', 'blindsight', ].includes(sense.sense_id));
  }
  else if (originId === 'angra_fog') {
    filtered = tables.senses.filter((sense) => [ 'darkvision', 'smell', 'vibration', ].includes(sense.sense_id));
  }

  return selectMultiple(filtered.length > 0
    ? filtered
    : tables.senses, count);
}

function generateAttackRanges(tables: MonsterRollTables, count: number): AttackMode[] {
  const ranged = tables.attackModes.filter((attack) => attack.attack_mode_id.includes('range'));
  const melee = tables.attackModes.filter((attack) => attack.attack_mode_id.includes('melee'));
  const selected: AttackMode[] = [];

  if (ranged.length > 0 && Math.random() > 0.4) {
    selected.push(randomSelect(ranged));
  }

  if (melee.length > 0) {
    selected.push(...selectMultiple(melee, Math.max(1, count - selected.length)));
  }

  return selected;
}

function generateAttackDeliveries(tables: MonsterRollTables, count: number): AttackMode[] {
  const deliveryModes = tables.attackModes.filter((attack) => attack.attack_mode_id.includes('deliver'));

  if (deliveryModes.length === 0) {
    return tables.attackModes.slice(0, count);
  }

  return selectMultiple(deliveryModes, count);
}

function generateDamageTypes(tables: MonsterRollTables, majorType: MajorType, count: number): DamageType[] {
  if (majorType.type_en === 'Undead') {
    const necrotic = tables.damageTypes.filter((damageType) => damageType.damage_type_ko === '사령');

    if (necrotic.length > 0) {
      return [
        randomSelect(necrotic),
        ...selectMultiple(tables.damageTypes.filter((damageType) => damageType.damage_type_ko !== '사령'), count - 1),
      ];
    }
  }

  return selectMultiple(tables.damageTypes, count);
}

function generateTraces(
  tables: MonsterRollTables,
  primarySubtype: Subtype,
  secondarySubtypes: Subtype[],
  fieldState: FieldState,
  count: number
): Trace[] {
  const traceMap = new Map<string, { trace_id: string; weight: number }>();
  const primaryLinks = tables.subtypeTraceLinks.filter((link) => (
    link.subtype_id === primarySubtype.subtype_id
    && link.major_type_en === primarySubtype.major_type_en
  ));

  primaryLinks.forEach((link) => {
    traceMap.set(link.trace_id, {
      trace_id: link.trace_id,
      weight: toNumber(link.weight),
    });
  });

  secondarySubtypes.forEach((subtype) => {
    const secondaryLinks = tables.subtypeTraceLinks.filter((link) => (
      link.subtype_id === subtype.subtype_id
      && link.major_type_en === subtype.major_type_en
    ));

    secondaryLinks.forEach((link) => {
      const existing = traceMap.get(link.trace_id);

      if (existing) {
        existing.weight += toNumber(link.weight) * 0.5;
      }
      else {
        traceMap.set(link.trace_id, {
          trace_id: link.trace_id,
          weight: toNumber(link.weight) * 0.5,
        });
      }
    });
  });

  const fieldLinks = tables.fieldStateTraceLinks.filter((link) => link.field_state_id === fieldState.state_id);

  fieldLinks.forEach((link) => {
    const existing = traceMap.get(link.trace_id);

    if (existing) {
      existing.weight += toNumber(link.weight) * 0.3;
    }
    else {
      traceMap.set(link.trace_id, {
        trace_id: link.trace_id,
        weight: toNumber(link.weight) * 0.3,
      });
    }
  });

  return Array.from(traceMap.values())
    .sort((a, b) => b.weight - a.weight)
    .slice(0, count)
    .map((item) => tables.traces.find((trace) => trace.trace_id === item.trace_id))
    .filter((trace): trace is Trace => Boolean(trace));
}

function generateResources(
  tables: MonsterRollTables,
  primarySubtype: Subtype,
  secondarySubtypes: Subtype[],
  selectedTraces: Trace[],
  count: number
): Resource[] {
  const resourceMap = new Map<string, { weight: number }>();
  const primaryLinks = tables.subtypeResourceLinks.filter((link) => (
    link.subtype_id === primarySubtype.subtype_id
    && link.major_type_en === primarySubtype.major_type_en
  ));

  primaryLinks.forEach((link) => {
    resourceMap.set(link.resource_id, {
      weight: toNumber(link.weight),
    });
  });

  secondarySubtypes.forEach((subtype) => {
    const secondaryLinks = tables.subtypeResourceLinks.filter((link) => (
      link.subtype_id === subtype.subtype_id
      && link.major_type_en === subtype.major_type_en
    ));

    secondaryLinks.forEach((link) => {
      const existing = resourceMap.get(link.resource_id);

      if (existing) {
        existing.weight += toNumber(link.weight) * 0.5;
      }
      else {
        resourceMap.set(link.resource_id, {
          weight: toNumber(link.weight) * 0.5,
        });
      }
    });
  });

  selectedTraces.forEach((trace) => {
    const traceLinks = tables.traceResourceLinks.filter((link) => link.trace_id === trace.trace_id);

    traceLinks.forEach((link) => {
      const existing = resourceMap.get(link.resource_id);

      if (existing) {
        existing.weight += toNumber(link.weight_bonus) * 0.4;
      }
      else {
        resourceMap.set(link.resource_id, {
          weight: toNumber(link.weight_bonus) * 0.4,
        });
      }
    });
  });

  return Array.from(resourceMap.entries())
    .sort((a, b) => b[1].weight - a[1].weight)
    .slice(0, count)
    .map(([ id, ]) => tables.resources.find((resource) => resource.resource_id === id))
    .filter((resource): resource is Resource => Boolean(resource));
}

function generateRiskSignals(tables: MonsterRollTables, fieldState: FieldState, count: number): RiskSignal[] {
  const stateId = fieldState.state_id.toLowerCase();
  let filtered = tables.riskSignals;

  if (stateId.includes('dungeon')) {
    filtered = tables.riskSignals.filter((risk) => risk.risk_ko.includes('룬') || risk.risk_ko.includes('공간'));
  }
  else if (stateId.includes('angra')) {
    filtered = tables.riskSignals.filter((risk) => risk.risk_ko.includes('오염') || risk.risk_ko.includes('부식'));
  }

  if (filtered.length === 0 || count === 0) {
    return [];
  }

  return selectMultiple(filtered, Math.min(count, filtered.length));
}

function generateDrops(
  tables: MonsterRollTables,
  majorType: MajorType,
  primarySubtype: Subtype,
  secondarySubtypes: Subtype[],
  fieldState: FieldState
): string[] {
  const drops: string[] = [];
  const commonDrop = tables.typeCommonDrops.find((d) => d.major_type_en === majorType.type_en);

  if (commonDrop) {
    const items = commonDrop.type_common_drops.split(',').map((item) => item.trim());
    const count = 3 + Math.floor(Math.random() * 3);
    drops.push(...selectMultiple(items, Math.min(count, items.length)));
  }

  const primaryDrop = tables.subtypeUniqueDrops.find((d) => d.subtype_id === primarySubtype.subtype_id);

  if (primaryDrop) {
    const items = primaryDrop.subtype_unique_drops.split(',').map((item) => item.trim());
    const count = Math.min(toNumber(primaryDrop.drop_count, 3), items.length);
    drops.push(...selectMultiple(items, count));
  }

  secondarySubtypes.forEach((subtype) => {
    const subDrop = tables.subtypeUniqueDrops.find((d) => d.subtype_id === subtype.subtype_id);

    if (subDrop) {
      const items = subDrop.subtype_unique_drops.split(',').map((item) => item.trim());
      drops.push(...selectMultiple(items, Math.min(2, items.length)));
    }
  });

  tables.specialConditionDrops.forEach((special) => {
    const stateId = fieldState.state_id.toLowerCase();
    const conditionGroup = special.condition_group.toLowerCase();

    if (
      conditionGroup.includes('앙그라')
      && stateId.includes('angra')
      && special.drop_policy === 'always_add'
    ) {
      drops.push(special.drop_ko);
    }

    if (
      conditionGroup.includes('가디언')
      && [ 'dungeon_guardian', 'totem_guardian', ].includes(stateId)
      && special.drop_policy === 'always_add'
    ) {
      drops.push(special.drop_ko);
    }
  });

  return [ ...new Set(drops), ];
}

function validateCombinations(primarySubtype: Subtype, selectedResources: Resource[]): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  const subtypeKo = primarySubtype.subtype_ko;

  if (subtypeKo.includes('골격형') && primarySubtype.major_type_en === 'Undead') {
    const boneResources = selectedResources.filter((resource) => (
      resource.tags.includes('bone')
      || resource.resource_ko.includes('뼈')
      || resource.resource_ko.includes('두개골')
      || resource.resource_ko.includes('골')
    ));

    if (boneResources.length === 0) {
      issues.push('골격형 언데드인데 뼈 계열 자원이 없습니다.');
    }
  }

  if (subtypeKo.includes('점액') || subtypeKo.includes('점액성')) {
    const slimeResources = selectedResources.filter((resource) => (
      resource.resource_ko.includes('점액')
      || resource.resource_ko.includes('산성')
      || resource.resource_ko.includes('흡수')
    ));

    if (slimeResources.length === 0) {
      issues.push('점액형 몬스터인데 점액·산성 계열 자원이 없습니다.');
    }
  }

  return { valid: issues.length === 0, issues, };
}

function generateSummary(
  origin: OriginContext,
  fieldState: FieldState,
  majorType: MajorType,
  selectedSubtypes: Subtype[],
  size: Size,
  leaderStatus: LeaderStatus
): string {
  const subtypeNames = selectedSubtypes
    .map((subtype) => subtype.subtype_ko.replace(majorType.type_ko, '').trim())
    .join(', ');
  const typeSubtypeCombo = selectedSubtypes.length > 0
    ? `${majorType.type_ko} - ${subtypeNames}`
    : majorType.type_ko;

  return `${origin.origin_ko}에서 확인된 ${size.size_ko} 크기의 ${typeSubtypeCombo}. ${fieldState.state_ko} 상태이다. ${leaderStatus.leader_grade_ko}로.`;
}

function generateObservedName(majorType: MajorType, primarySubtype: Subtype, fieldState: FieldState): string {
  const locationPrefixes: Record<string, string> = {
    field_normal: '평야',
    settlement_edge: '변경',
    dungeon_interior: '지하',
    angra_fog_creature: '안개',
    resonance_1: '공명',
    blackstone_reactive: '흑석',
  };
  const prefix = locationPrefixes[fieldState.state_id] || '야생';
  const subtypeName = primarySubtype.subtype_ko.replace(majorType.type_ko, '').trim();

  return `${majorType.type_ko} - ${subtypeName} (${prefix})`;
}

export function generateMonster(tables: MonsterRollTables): MonsterResult {
  const originContext = randomSelect(tables.originContexts);
  const fieldState = generateFieldState(tables, originContext);
  const majorType = generateMajorType(tables, fieldState);
  const selectedSubtypes = generateSubtypes(tables, majorType, 1);
  const primarySubtype = selectedSubtypes[0];

  if (!primarySubtype) {
    throw new Error(`${majorType.type_ko}에 해당하는 하위 분류가 없습니다.`);
  }

  const size = generateSize(tables, majorType, fieldState);
  const leaderStatus = generateLeaderStatus(tables, fieldState);
  const socialPattern = generateSocialPattern(tables, leaderStatus);
  const selectedBehaviorPatterns = generateBehaviorPatterns(tables, fieldState, 1 + Math.floor(Math.random() * 2));
  const selectedMovements = generateMovements(tables, majorType, 1 + Math.floor(Math.random() * 2));
  const selectedSenses = generateSenses(tables, originContext, 2 + Math.floor(Math.random() * 2));
  const attackRanges = generateAttackRanges(tables, 1);
  const attackDeliveries = generateAttackDeliveries(tables, 1 + Math.floor(Math.random() * 2));
  const selectedDamageTypes = generateDamageTypes(tables, majorType, 1 + Math.floor(Math.random() * 2));
  const selectedRiskSignals = generateRiskSignals(tables, fieldState, Math.floor(Math.random() * 2));
  const selectedTraces = generateTraces(tables, primarySubtype, selectedSubtypes.slice(1), fieldState, 3 + Math.floor(Math.random() * 3));
  const selectedResources = generateResources(tables, primarySubtype, selectedSubtypes.slice(1), selectedTraces, 2 + Math.floor(Math.random() * 3));
  const drops = generateDrops(tables, majorType, primarySubtype, selectedSubtypes.slice(1), fieldState);
  const validation = validateCombinations(primarySubtype, selectedResources);

  if (!validation.valid) {
    console.warn('금지 조합 경고:', validation.issues);
  }

  return {
    originContext,
    fieldState,
    majorType,
    primarySubtype,
    secondarySubtypes: selectedSubtypes.slice(1),
    size,
    leaderStatus,
    socialPattern,
    behaviorPatterns: selectedBehaviorPatterns,
    movements: selectedMovements,
    senses: selectedSenses,
    attackRanges,
    attackDeliveries,
    damageTypes: selectedDamageTypes,
    traces: selectedTraces,
    resources: selectedResources,
    riskSignals: selectedRiskSignals,
    drops,
    observedName: generateObservedName(majorType, primarySubtype, fieldState),
    summaryText: generateSummary(originContext, fieldState, majorType, selectedSubtypes, size, leaderStatus),
  };
}
