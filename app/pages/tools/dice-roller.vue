<script setup lang="ts">
definePageMeta({
  layout: 'common',
});

useSetMeta({
  title: '주사위 롤러',
  url: '/tools/dice-roller',
});
</script>

<template>
  <DiceRollerView />
</template>
