<script setup lang="ts">
withDefaults(defineProps<{
  message: string;
  paddingClass?: string;
}>(), {
  paddingClass: 'py-12',
});
</script>

<template>
  <div :class="['p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 text-center text-black-400', paddingClass]">
    {{ message }}
  </div>
</template>
