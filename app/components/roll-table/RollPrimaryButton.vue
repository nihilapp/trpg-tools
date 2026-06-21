<script setup lang="ts">
withDefaults(defineProps<{
  disabled?: boolean;
  isLoading?: boolean;
  label: string;
  loadingLabel: string;
  size?: 'md' | 'lg';
}>(), {
  disabled: false,
  isLoading: false,
  size: 'md',
});

const emit = defineEmits<{
  click: [];
}>();
</script>

<template>
  <button
    @click='emit("click")'
    :disabled='disabled'
    :class="[
      'flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-black-300 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl',
      size === 'lg' ? 'py-4 px-8 text-lg' : 'py-3 px-6'
    ]"
  >
    <slot name='icon' />
    <span>{{ isLoading ? loadingLabel : label }}</span>
  </button>
</template>
