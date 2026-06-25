<script setup lang="ts">
import { rollDiceExpression } from '@nihilapp/diceroll-v3';

import { basicDicePresets, specialDicePresets } from '../../data/dice-roller/presets';
import type {
  DicePreset,
  DiceRollHistoryEntry,
  DiceRollerTab,
} from '../../types/dice-roller.types';
import { appendDiceHistory, buildDiceHistoryEntry } from '../../utils/dice-roller-format';

const activeTab = ref<DiceRollerTab>('preset');
const customExpression = ref('');
const currentEntry = ref<DiceRollHistoryEntry | null>(null);
const history = ref<DiceRollHistoryEntry[]>([]);
const errorMessage = ref<string | null>(null);
const isRolling = ref(false);
const copyFeedback = ref<string | null>(null);
const presetCounts = ref<Record<string, number>>(
  Object.fromEntries(
    basicDicePresets.map(preset => [preset.id, preset.defaultCount ?? 1]),
  ),
);

function clampCount(value: number, preset: DicePreset): number {
  const min = preset.minCount ?? 1;
  const max = preset.maxCount ?? 20;

  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, Math.trunc(value)));
}

function setPresetCount(presetId: string, value: number) {
  const preset = basicDicePresets.find(item => item.id === presetId);

  if (!preset) {
    return;
  }

  presetCounts.value[presetId] = clampCount(value, preset);
}

function applyEntry(entry: DiceRollHistoryEntry) {
  currentEntry.value = entry;
  errorMessage.value = null;
  copyFeedback.value = null;
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return `주사위식을 처리하지 못했습니다: ${error.message}`;
  }

  return '주사위식을 처리하지 못했습니다. 입력식을 확인해주세요.';
}

function runRoll(input: string) {
  const expression = input.trim();

  if (!expression) {
    return;
  }

  isRolling.value = true;
  errorMessage.value = null;
  copyFeedback.value = null;

  try {
    const results = rollDiceExpression(expression);

    if (results.length === 0) {
      throw new Error('결과가 비어 있습니다.');
    }

    const entry = buildDiceHistoryEntry(expression, results);

    applyEntry(entry);
    history.value = appendDiceHistory(history.value, entry);
  }
  catch (error) {
    errorMessage.value = toErrorMessage(error);
  }
  finally {
    isRolling.value = false;
  }
}

function rollBasicPreset(preset: DicePreset) {
  const count = presetCounts.value[preset.id] ?? preset.defaultCount ?? 1;
  runRoll(`${count}${preset.expression}`);
}

function rollSpecialPreset(preset: DicePreset) {
  runRoll(preset.expression);
}

function submitCustomRoll() {
  runRoll(customExpression.value);
}

async function copyCurrentEntry() {
  if (!currentEntry.value) {
    return;
  }

  try {
    await navigator.clipboard.writeText(currentEntry.value.copyText);
    copyFeedback.value = '결과를 클립보드에 복사했습니다.';
  }
  catch {
    copyFeedback.value = '복사에 실패했습니다. 브라우저 권한을 확인해주세요.';
  }
}
</script>

<template>
  <div class='mx-auto max-w-7xl space-y-6 p-6'>
    <header class='space-y-2'>
      <h1 class='text-3xl font-bold text-black-900'>
        주사위 롤러
      </h1>
      <p class='text-sm text-black-600'>
        프리셋 롤과 커스텀 수식을 한 화면에서 관리합니다.
      </p>
    </header>

    <section class='space-y-4 rounded-3xl border border-black-200 bg-black-50 p-4 md:p-6'>
      <DiceRollerTabs :active-tab='activeTab' @select='activeTab = $event' />

      <DicePresetRoll
        v-if="activeTab === 'preset'"
        :basic-presets='basicDicePresets'
        :special-presets='specialDicePresets'
        :counts='presetCounts'
        :is-rolling='isRolling'
        @roll-basic='rollBasicPreset'
        @roll-special='rollSpecialPreset'
        @update-count='setPresetCount'
      />

      <DiceCustomRoll
        v-else
        v-model='customExpression'
        :is-rolling='isRolling'
        :error-message='errorMessage'
        @submit='submitCustomRoll'
      />

      <DiceRollHelp />
    </section>

    <section v-if="activeTab === 'preset' && errorMessage" class='rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
      {{ errorMessage }}
    </section>

    <section class='grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]'>
      <DiceRollResult
        :entry='currentEntry'
        :copy-feedback='copyFeedback'
        @copy='copyCurrentEntry'
      />

      <DiceRollHistory
        :history='history'
        :selected-id='currentEntry?.id ?? null'
        @select='applyEntry'
      />
    </section>
  </div>
</template>
