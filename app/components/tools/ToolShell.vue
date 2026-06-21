<script setup lang="ts">
withDefaults(defineProps<{
  title: string;
  description: string;
  maxWidthClass?: string;
}>(), {
  maxWidthClass: 'max-w-5xl',
});
</script>

<template>
  <div :class="['p-6 mx-auto', maxWidthClass]">
    <h1 class='text-2xl font-bold text-black-900 mb-2'>
      {{ title }}
    </h1>
    <p class='text-sm text-black-500 mb-6'>
      {{ description }}
    </p>

    <slot />
  </div>
</template>
