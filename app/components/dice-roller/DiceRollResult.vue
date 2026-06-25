<script setup lang="ts">
import type { DiceRollHistoryEntry } from '~/types/dice-roller.types';

defineProps<{
  entry: DiceRollHistoryEntry | null;
  copyFeedback: string | null;
}>();

defineEmits<{
  copy: [];
}>();

function formatTimestamp(value: string): string {
  return new Date(value).toLocaleString('ko-KR');
}

function dieClass(isDropped: boolean, isSuccess?: boolean, isFailure?: boolean): string {
  if (isDropped) {
    return 'border-black-200 bg-black-100 text-black-400 line-through';
  }

  if (isFailure) {
    return 'border-red-200 bg-red-50 text-red-700';
  }

  if (isSuccess) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }

  return 'border-blue-200 bg-blue-50 text-blue-700';
}
</script>

<template>
  <section class='rounded-3xl border border-black-200 bg-white p-5 shadow-sm'>
    <div class='mb-4 flex items-start justify-between gap-4'>
      <div>
        <h2 class='text-lg font-bold text-black-900'>
          결과
        </h2>
        <p v-if='entry' class='text-xs text-black-500'>
          {{ formatTimestamp(entry.rolledAt) }}
        </p>
      </div>

      <button
        v-if='entry'
        class='rounded-xl border border-black-200 px-3 py-2 text-sm font-medium text-black-700 transition hover:border-blue-500 hover:text-blue-600'
        @click="$emit('copy')"
      >
        복사
      </button>
    </div>

    <div v-if='entry' class='space-y-5'>
      <div class='rounded-2xl bg-black-50 p-4'>
        <p class='text-xs font-semibold uppercase tracking-wide text-black-500'>
          Input
        </p>
        <p class='mt-1 break-all text-base font-semibold text-black-900'>
          {{ entry.input }}
        </p>
      </div>

      <p v-if='copyFeedback' class='text-sm text-blue-600'>
        {{ copyFeedback }}
      </p>

      <div class='space-y-4'>
        <article
          v-for='result in entry.results'
          :key='`${entry.id}-${result.expression}`'
          class='rounded-2xl border border-black-200 p-4'
        >
          <div class='mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-black-100 pb-3'>
            <div>
              <p class='text-xs font-semibold uppercase tracking-wide text-black-500'>
                Expression
              </p>
              <h3 class='text-lg font-bold text-black-900'>
                {{ result.expression }}
              </h3>
              <p v-if='result.modifierText' class='text-sm text-black-500'>
                보정 {{ result.modifierText }}
              </p>
            </div>

            <div class='text-right'>
              <p class='text-xs font-semibold uppercase tracking-wide text-black-500'>
                Total
              </p>
              <p class='text-2xl font-bold text-blue-700'>
                {{ result.total }}
              </p>
            </div>
          </div>

          <div class='space-y-3'>
            <section
              v-for='block in result.blocks'
              :key='`${result.expression}-${block.block}`'
              class='rounded-2xl bg-black-50 p-3'
            >
              <div class='mb-2 flex flex-wrap items-center justify-between gap-2'>
                <div>
                  <p class='text-sm font-semibold text-black-900'>
                    {{ block.block }}
                  </p>
                  <p class='text-xs text-black-500'>
                    {{ block.summary }}
                  </p>
                </div>

                <div class='text-sm font-semibold text-blue-700'>
                  {{ block.contribution }}
                </div>
              </div>

              <div v-if='block.dice.length > 0' class='flex flex-wrap gap-2'>
                <span
                  v-for='(die, dieIndex) in block.dice'
                  :key='`${block.block}-${dieIndex}`'
                  class='rounded-lg border px-2.5 py-1 text-sm font-semibold'
                  :class='dieClass(die.isDropped, die.isSuccess, die.isFailure)'
                >
                  {{ die.value }}
                </span>
              </div>
            </section>
          </div>
        </article>
      </div>
    </div>

    <div v-else class='rounded-2xl border border-dashed border-black-200 bg-black-50 px-4 py-10 text-center text-sm text-black-500'>
      아직 굴린 결과가 없습니다.
    </div>
  </section>
</template>
