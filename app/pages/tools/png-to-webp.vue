<script setup lang="ts">
definePageMeta({
  layout: 'common',
});

useSetMeta({
  title: 'PNG to WebP 변환기',
  url: '/tools/png-to-webp',
});
</script>

<template>
  <PngToWebpConverter />
</template>
