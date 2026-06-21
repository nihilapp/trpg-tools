import { ref } from 'vue';

import { monsterRollTableFiles } from '~/data/monster-roll-table/files';
import type {
  AttackMode,
  BehaviorPattern,
  DamageType,
  FieldState,
  FieldStateTraceLink,
  LeaderStatus,
  MajorType,
  MonsterRollTables,
  Movement,
  OriginContext,
  Resource,
  RiskSignal,
  Sense,
  Size,
  SocialPattern,
  SpecialConditionDrop,
  Subtype,
  SubtypeResourceLink,
  SubtypeTraceLink,
  SubtypeUniqueDrop,
  Trace,
  TraceResourceLink,
  TypeCommonDrop
} from '~/types/monster-roll-table.types';
import { parseCsvObjects } from '~/utils/csv';

function createEmptyTables(): MonsterRollTables {
  return {
    originContexts: [],
    fieldStates: [],
    majorTypes: [],
    subtypes: [],
    sizes: [],
    leaderStatuses: [],
    socialPatterns: [],
    behaviorPatterns: [],
    movements: [],
    senses: [],
    attackModes: [],
    damageTypes: [],
    traces: [],
    resources: [],
    riskSignals: [],
    subtypeTraceLinks: [],
    subtypeResourceLinks: [],
    fieldStateTraceLinks: [],
    traceResourceLinks: [],
    typeCommonDrops: [],
    subtypeUniqueDrops: [],
    specialConditionDrops: [],
  };
}

export function useMonsterRollTableData() {
  const tables = ref<MonsterRollTables>(createEmptyTables());
  const isLoading = ref(true);
  const loadError = ref<string | null>(null);

  async function loadCSV() {
    isLoading.value = true;

    try {
      const responses = await Promise.all(
        monsterRollTableFiles.map((file) => fetch(file.url).then((response) => {
          if (!response.ok) {
            throw new Error(`${file.name} 파일 로드 실패`);
          }

          return response.text();
        }))
      );

      tables.value = {
        originContexts: parseCsvObjects<OriginContext>(responses[0]),
        fieldStates: parseCsvObjects<FieldState>(responses[1]),
        majorTypes: parseCsvObjects<MajorType>(responses[2]),
        subtypes: parseCsvObjects<Subtype>(responses[3]),
        sizes: parseCsvObjects<Size>(responses[4]),
        leaderStatuses: parseCsvObjects<LeaderStatus>(responses[5]),
        socialPatterns: parseCsvObjects<SocialPattern>(responses[6]),
        behaviorPatterns: parseCsvObjects<BehaviorPattern>(responses[7]),
        movements: parseCsvObjects<Movement>(responses[8]),
        senses: parseCsvObjects<Sense>(responses[9]),
        attackModes: parseCsvObjects<AttackMode>(responses[10]),
        damageTypes: parseCsvObjects<DamageType>(responses[11]),
        traces: parseCsvObjects<Trace>(responses[12]),
        resources: parseCsvObjects<Resource>(responses[13]),
        riskSignals: parseCsvObjects<RiskSignal>(responses[14]),
        subtypeTraceLinks: parseCsvObjects<SubtypeTraceLink>(responses[15]),
        subtypeResourceLinks: parseCsvObjects<SubtypeResourceLink>(responses[16]),
        fieldStateTraceLinks: parseCsvObjects<FieldStateTraceLink>(responses[17]),
        traceResourceLinks: parseCsvObjects<TraceResourceLink>(responses[18]),
        typeCommonDrops: parseCsvObjects<TypeCommonDrop>(responses[19]),
        subtypeUniqueDrops: parseCsvObjects<SubtypeUniqueDrop>(responses[20]),
        specialConditionDrops: parseCsvObjects<SpecialConditionDrop>(responses[21]),
      };
      loadError.value = null;
    }
    catch (error) {
      loadError.value = error instanceof Error
        ? error.message
        : '알 수 없는 오류';
    }
    finally {
      isLoading.value = false;
    }
  }

  return {
    tables,
    isLoading,
    loadError,
    loadCSV,
  };
}
