<script setup lang="ts">
import type { DicePreset } from '~/types/dice-roller.types';

const props = defineProps<{
  basicPresets: DicePreset[];
  specialPresets: DicePreset[];
  counts: Record<string, number>;
  isRolling: boolean;
}>();

const emit = defineEmits<{
  rollBasic: [preset: DicePreset];
  rollSpecial: [preset: DicePreset];
  updateCount: [presetId: string, value: number];
}>();

function handleCountInput(event: Event, presetId: string) {
  const target = event.target as HTMLInputElement | null;
  const value = Number(target?.value ?? props.counts[presetId] ?? 1);

  emit('updateCount', presetId, value);
}
</script>

<template>
  <div class='space-y-6'>
    <section class='space-y-3'>
      <div>
        <h2 class='text-base font-semibold text-black-900'>
          기본 주사위
        </h2>
        <p class='text-sm text-black-600'>
          각 카드에서 개수를 정하고 바로 굴립니다.
        </p>
      </div>

      <div class='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
        <article
          v-for='preset in basicPresets'
          :key='preset.id'
          class='rounded-2xl border border-black-200 bg-white p-4 shadow-sm'
        >
          <div class='mb-4 flex items-start justify-between gap-3'>
            <div>
              <h3 class='text-lg font-bold text-black-900'>
                {{ preset.label }}
              </h3>
              <p class='text-xs text-black-500'>
                {{ preset.description }}
              </p>
            </div>
          </div>

          <label :for='`preset-count-${preset.id}`' class='mb-3 block text-xs font-medium text-black-600'>
            개수
            <input
              :id='`preset-count-${preset.id}`'
              :value='counts[preset.id]'
              type='number'
              min='1'
              max='20'
              class='mt-1 w-full rounded-xl border border-black-200 px-3 py-2 text-sm text-black-900 outline-none transition focus:border-blue-500'
              @input='handleCountInput($event, preset.id)'
            >
          </label>

          <button
            class='w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-black-300'
            :disabled='isRolling'
            @click="$emit('rollBasic', preset)"
          >
            {{ counts[preset.id] }}{{ preset.expression }} 굴리기
          </button>
        </article>
      </div>
    </section>

    <section class='space-y-3'>
      <div>
        <h2 class='text-base font-semibold text-black-900'>
          자주 쓰는 프리셋
        </h2>
        <p class='text-sm text-black-600'>
          엔진 기본 문법 안에서 자주 쓰는 식만 추려 둡니다.
        </p>
      </div>

      <div class='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
        <article
          v-for='preset in specialPresets'
          :key='preset.id'
          class='rounded-2xl border border-black-200 bg-white p-4 shadow-sm'
        >
          <div class='mb-4'>
            <h3 class='text-lg font-bold text-black-900'>
              {{ preset.label }}
            </h3>
            <p class='text-xs text-black-500'>
              {{ preset.description }}
            </p>
          </div>

          <div class='mb-3 rounded-xl bg-black-50 px-3 py-2 text-sm font-medium text-black-700'>
            {{ preset.expression }}
          </div>

          <button
            class='w-full rounded-xl bg-black-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black-800 disabled:cursor-not-allowed disabled:bg-black-300'
            :disabled='isRolling'
            @click="$emit('rollSpecial', preset)"
          >
            굴리기
          </button>
        </article>
      </div>
    </section>
  </div>
</template>
