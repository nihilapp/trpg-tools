<script setup lang="ts">
import type { DiceRollerTab } from '~/types/dice-roller.types';

defineProps<{
  activeTab: DiceRollerTab;
}>();

defineEmits<{
  select: [tab: DiceRollerTab];
}>();
</script>

<template>
  <div class='flex gap-2 rounded-2xl border border-black-200 bg-white p-2'>
    <button
      class='flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition'
      :class="activeTab === 'preset'
        ? 'bg-blue-600 text-white shadow-sm'
        : 'bg-black-50 text-black-700 hover:bg-black-100'"
      @click="$emit('select', 'preset')"
    >
      프리셋 롤
    </button>
    <button
      class='flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition'
      :class="activeTab === 'custom'
        ? 'bg-blue-600 text-white shadow-sm'
        : 'bg-black-50 text-black-700 hover:bg-black-100'"
      @click="$emit('select', 'custom')"
    >
      커스텀 주사위
    </button>
  </div>
</template>
