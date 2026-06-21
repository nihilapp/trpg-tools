<script setup lang="ts">
import { onMounted, ref } from 'vue';

import RollEmptyState from '~/components/roll-table/RollEmptyState.vue';
import RollLockControls from '~/components/roll-table/RollLockControls.vue';
import RollPrimaryButton from '~/components/roll-table/RollPrimaryButton.vue';
import RollTableShell from '~/components/roll-table/RollTableShell.vue';
import type { LockState, MonsterResult } from '~/types/monster-roll-table.types';
import { generateMonster } from '~/utils/monster-roll-table/generator';

const result = ref<MonsterResult | null>(null);
const isRolling = ref(false);
const locks = ref<LockState>({
  originContext: false,
  fieldState: false,
  majorType: false,
  subtypes: false,
  size: false,
  leaderStatus: false,
  socialPattern: false,
  behaviorPatterns: false,
  movements: false,
  senses: false,
  attackRanges: false,
  attackDeliveries: false,
  damageTypes: false,
  traces: false,
  resources: false,
  riskSignals: false,
});
const lockControls = [
  { key: 'originContext', label: '출현 맥락' },
  { key: 'fieldState', label: '현장 상태' },
  { key: 'majorType', label: '대분류' },
  { key: 'subtypes', label: '하위 분류' },
  { key: 'size', label: '크기' },
  { key: 'leaderStatus', label: '우두머리' },
  { key: 'socialPattern', label: '사회성' },
  { key: 'behaviorPatterns', label: '행동 패턴' },
  { key: 'movements', label: '이동 방식' },
  { key: 'senses', label: '감각' },
  { key: 'attackRanges', label: '공격 방식' },
  { key: 'traces', label: '흔적' },
  { key: 'resources', label: '자원' },
  { key: 'riskSignals', label: '위험 징후' },
] satisfies { key: keyof LockState; label: string }[];

const {
  tables,
  isLoading,
  loadError,
  loadCSV,
} = useMonsterRollTableData();

async function generateAll() {
  if (isLoading.value) {
    return;
  }

  isRolling.value = true;

  try {
    result.value = generateMonster(tables.value);
  }
  catch (error) {
    loadError.value = error instanceof Error ? error.message : '알 수 없는 오류';
  }
  finally {
    isRolling.value = false;
  }
}

function toggleLock(step: keyof LockState) {
  locks.value[step] = !locks.value[step];
}

onMounted(() => {
  loadCSV();
});
</script>

<template>
  <RollTableShell
    title='몬스터 롤 테이블'
    description='몬스터 관찰 데이터를 무작위로 생성하여 도감 기록을 만드세요'
    :is-loading='isLoading'
    :load-error='loadError'
    @retry='loadCSV'
  >
    <div class='flex gap-4 mb-6'>
      <RollPrimaryButton
        label='전체 생성하기'
        loading-label='생성 중...'
        :is-loading='isRolling'
        :disabled='isRolling'
        @click='generateAll'
      />
    </div>

    <div v-if='result' class='p-6 bg-white rounded-lg border border-black-200'>
      <div class='flex items-center justify-between mb-4 pb-3 border-b border-black-100'>
        <h2 class='text-xl font-bold text-blue-700'>
          {{ result?.observedName }}
        </h2>
        <button @click='generateAll' :disabled='isRolling' class='text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-black-300 text-white rounded transition'>
          전체 재생성
        </button>
      </div>

      <div class='space-y-3 text-sm'>
        <p class='text-black-800 leading-relaxed'>
          {{ result?.summaryText }}
        </p>

        <p class='text-black-600'>
          <span class='font-semibold text-black-900'>
            출현 맥락:
          </span>
          <span class='ml-2'>
            {{ result?.originContext?.origin_ko }}
          </span>
          <span class='mx-2 text-black-300'>
            |
          </span>
          <span class='font-semibold text-black-900'>
            현장 상태:
          </span>
          <span class='ml-2'>
            {{ result?.fieldState?.state_ko }}
          </span>
        </p>

        <p class='text-black-600'>
          <span class='font-semibold text-black-900'>
            분류:
          </span>
          <span class='ml-2'>
            {{ result?.majorType?.type_ko }}
          </span>
          <span class='text-black-400'>
            ─
          </span>
          <span>{{ result?.primarySubtype?.subtype_ko.replace(result?.majorType?.type_ko ?? '', '').trim() }}</span>
          <span v-for='subtype in result?.secondarySubtypes ?? []' :key='subtype.subtype_id'>
            , {{ subtype.subtype_ko.replace(result?.majorType?.type_ko ?? '', '').trim() }}
          </span>
        </p>

        <p class='text-black-600'>
          <span class='font-semibold text-black-900'>
            크기:
          </span>
          <span class='ml-2'>
            {{ result?.size?.size_ko }} ({{ result?.size?.size_en }})
          </span>
          <span class='mx-2 text-black-300'>
            |
          </span>
          <span class='font-semibold text-black-900'>
            우두머리:
          </span>
          <span class='ml-2'>
            {{ result?.leaderStatus?.leader_grade_ko }}
          </span>
        </p>

        <p class='text-black-600'>
          <span class='font-semibold text-black-900'>
            사회성:
          </span>
          <span class='ml-2'>
            {{ result?.socialPattern?.social_ko }}
          </span>
        </p>

        <p class='text-black-600'>
          <span class='font-semibold text-black-900'>
            행동:
          </span>
          <span class='ml-2' v-for='(behavior, i) in result?.behaviorPatterns ?? []' :key='behavior.behavior_id'>
            <span v-if='i > 0'>
              ,
            </span>{{ behavior.behavior_ko }}
          </span>
        </p>

        <p class='text-black-600'>
          <span class='font-semibold text-black-900'>
            이동:
          </span>
          <span class='ml-2' v-for='(move, i) in result?.movements ?? []' :key='move.movement_id'>
            <span v-if='i > 0'>
              ,
            </span>{{ move.movement_ko }}
          </span>
        </p>

        <p class='text-black-600'>
          <span class='font-semibold text-black-900'>
            감각:
          </span>
          <span class='ml-2' v-for='(sense, i) in result?.senses ?? []' :key='sense.sense_id'>
            <span v-if='i > 0'>
              ,
            </span>{{ sense.sense_ko }}
          </span>
        </p>

        <p class='text-black-600'>
          <span class='font-semibold text-black-900'>
            공격:
          </span>
          <span class='ml-2'>
            거리 {{ (result?.attackRanges ?? []).map(r => r.attack_mode_ko).join(', ') }}
          </span>
          <span class='mx-2 text-black-300'>
            |
          </span>
          <span>전달 {{ (result?.attackDeliveries ?? []).map(d => d.attack_mode_ko).join(', ') }}</span>
          <span class='mx-2 text-black-300'>
            |
          </span>
          <span>피해 {{ (result?.damageTypes ?? []).map(d => d.damage_type_ko).join(', ') }}</span>
        </p>

        <p class='text-black-600'>
          <span class='font-semibold text-black-900'>
            흔적:
          </span>
          <span class='ml-2' v-for='(trace, i) in result?.traces ?? []' :key='trace.trace_id'>
            <span v-if='i > 0'>
              ,
            </span>{{ trace.trace_ko }}
          </span>
        </p>

        <p class='text-black-600'>
          <span class='font-semibold text-black-900'>
            위험 징후:
          </span>
          <span class='ml-2' v-if='(result?.riskSignals ?? []).length === 0'>
            없음
          </span>
          <span class='ml-2' v-for='(risk, i) in result?.riskSignals ?? []' :key='risk.risk_id'>
            <span v-if='i > 0'>
              ,
            </span>{{ risk.risk_ko }}
          </span>
        </p>

        <p class='text-black-600'>
          <span class='font-semibold text-black-900'>
            드랍:
          </span>
          <span class='ml-2' v-for='(drop, i) in result?.drops ?? []' :key='drop'>
            <span v-if='i > 0'>
              ,
            </span>{{ drop }}
          </span>
        </p>

        <p class='text-black-600'>
          <span class='font-semibold text-black-900'>
            자원:
          </span>
          <span class='ml-2' v-for='(resource, i) in result?.resources ?? []' :key='resource.resource_id'>
            <span v-if='i > 0'>
              ,
            </span>{{ resource.resource_ko }}
          </span>
        </p>
      </div>

      <RollLockControls
        :items='lockControls'
        :locks='locks'
        @toggle='toggleLock($event as keyof LockState)'
      />
    </div>

    <RollEmptyState v-else message='상단 버튼을 눌러 몬스터 관찰 데이터를 생성하세요' />
  </RollTableShell>
</template>
