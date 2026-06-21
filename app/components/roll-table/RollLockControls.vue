<script setup lang="ts">
export interface RollLockControlItem {
  key: string;
  label: string;
}

defineProps<{
  items: RollLockControlItem[];
  locks: Record<string, boolean>;
}>();

const emit = defineEmits<{
  toggle: [key: string];
}>();
</script>

<template>
  <div class='mt-4 pt-3 border-t border-black-100 flex gap-2 flex-wrap'>
    <button
      v-for='item in items'
      :key='item.key'
      @click='emit("toggle", item.key)'
      class='text-xs px-3 py-1 rounded border whitespace-nowrap'
      :class="locks[item.key] ? 'bg-yellow-100 border-yellow-300' : 'bg-black-50 border-black-200'"
    >
      {{ locks[item.key] ? '🔒' : '🔓' }} {{ item.label }}
    </button>
  </div>
</template>
