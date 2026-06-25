<script setup lang="ts">
import type { DiceRollHistoryEntry } from '~/types/dice-roller.types';

defineProps<{
  history: DiceRollHistoryEntry[];
  selectedId: string | null;
}>();

defineEmits<{
  select: [entry: DiceRollHistoryEntry];
}>();

function formatTimestamp(value: string): string {
  return new Date(value).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
</script>

<template>
  <section class='rounded-3xl border border-black-200 bg-white p-5 shadow-sm'>
    <div class='mb-4'>
      <h2 class='text-lg font-bold text-black-900'>
        히스토리
      </h2>
      <p class='text-sm text-black-600'>
        최근 20개까지 유지됩니다.
      </p>
    </div>

    <div v-if='history.length > 0' class='space-y-2'>
      <button
        v-for='entry in history'
        :key='entry.id'
        class='w-full rounded-2xl border px-4 py-3 text-left transition'
        :class="selectedId === entry.id
          ? 'border-blue-500 bg-blue-50'
          : 'border-black-200 bg-white hover:border-blue-300 hover:bg-black-50'"
        @click="$emit('select', entry)"
      >
        <div class='flex items-start justify-between gap-3'>
          <div class='min-w-0'>
            <p class='truncate text-sm font-semibold text-black-900'>
              {{ entry.input }}
            </p>
            <p class='mt-1 line-clamp-2 whitespace-pre-line text-xs text-black-500'>
              {{ entry.copyText }}
            </p>
          </div>
          <span class='shrink-0 text-xs text-black-400'>
            {{ formatTimestamp(entry.rolledAt) }}
          </span>
        </div>
      </button>
    </div>

    <div v-else class='rounded-2xl border border-dashed border-black-200 bg-black-50 px-4 py-8 text-center text-sm text-black-500'>
      히스토리가 아직 없습니다.
    </div>
  </section>
</template>
