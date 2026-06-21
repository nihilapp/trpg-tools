<script setup lang="ts">
withDefaults(defineProps<{
  title: string;
  description: string;
  isLoading: boolean;
  loadError: string | null;
  maxWidthClass?: string;
}>(), {
  maxWidthClass: 'max-w-4xl',
});

const emit = defineEmits<{
  retry: [];
}>();
</script>

<template>
  <div :class="['p-6 mx-auto', maxWidthClass]">
    <h1 class='text-2xl font-bold text-black-900 mb-2'>
      {{ title }}
    </h1>
    <p class='text-sm text-black-500 mb-6'>
      {{ description }}
    </p>

    <div v-if='isLoading' class='text-center py-12 text-black-500'>
      <svg class='w-8 h-8 mx-auto mb-3 animate-spin' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'>
        <circle cx='12' cy='12' r='10' stroke-opacity='0.25' />
        <path d='M12 2a10 10 0 0 1 10 10' stroke-linecap='round' />
      </svg>
      <p>데이터를 불러오는 중...</p>
    </div>

    <div v-else-if='loadError' class='text-center py-12'>
      <div class='text-red-600 mb-4'>
        <svg class='w-12 h-12 mx-auto mb-3' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'>
          <circle cx='12' cy='12' r='10' />
          <line x1='12' y1='8' x2='12' y2='12' />
          <circle cx='12' cy='16' r='1' />
        </svg>
        <p class='text-lg font-semibold'>
          데이터 로드 실패
        </p>
      </div>
      <p class='text-sm text-black-600 mb-4'>
        {{ loadError }}
      </p>
      <button @click='emit("retry")' class='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'>
        다시 시도
      </button>
    </div>

    <template v-else>
      <slot />
    </template>
  </div>
</template>
