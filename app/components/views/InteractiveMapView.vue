<template>
  <div class='h-full min-h-0 w-full overflow-hidden bg-neutral-950'>
    <InteractiveMapCore />
  </div>
</template>

<script setup lang="ts">
let previousBodyOverflow = '';
let previousHtmlOverflow = '';

onMounted(() => {
  previousBodyOverflow = document.body.style.overflow;
  previousHtmlOverflow = document.documentElement.style.overflow;

  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
});

onBeforeUnmount(() => {
  document.body.style.overflow = previousBodyOverflow;
  document.documentElement.style.overflow = previousHtmlOverflow;
});
</script>
