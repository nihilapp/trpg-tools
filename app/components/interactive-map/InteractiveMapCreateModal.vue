<template>
  <div
    class='absolute inset-0 z-[1500] flex items-center justify-center overflow-hidden bg-black/60 p-4 backdrop-blur-sm'
    @click.self="$emit('close')"
  >
    <div class='flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-neutral-900 shadow-2xl'>
      <!-- Header -->
      <div class='flex items-start justify-between px-6 pb-4 pt-6'>
        <div>
          <p class='text-xs text-neutral-400'>
            새 마커 생성
          </p>
          <h2 class='text-2xl font-semibold text-white'>
            마커 정보 입력
          </h2>
        </div>
        <button
          class='rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white'
          @click="$emit('close')"
        >
          <Icon icon='lucide:x' class='h-5 w-5' />
        </button>
      </div>

      <div class='min-h-0 flex-1 overflow-y-auto px-6 pb-6'>
        <!-- Form -->
        <div class='space-y-4'>
        <!-- Type Selection -->
        <div>
          <label class='mb-2 block text-sm text-neutral-400'>
            마커 종류
          </label>
          <div class='grid grid-cols-2 gap-2'>
            <button
              v-for='option in interactiveMapKindOptions'
              :key='option.kind'
              :data-active='formData.kind === option.kind'
              :class="[
                'flex items-center gap-2 rounded-lg px-3 py-3 text-left text-sm font-medium text-neutral-200 transition-colors hover:bg-neutral-700',
                'bg-neutral-800',
                option.buttonClass,
              ]"
              @click='formData.kind = option.kind'
            >
              <Icon :icon='option.icon' class='h-4 w-4' />
              {{ option.label }}
            </button>
          </div>
        </div>

        <div>
          <label class='mb-1 block text-sm text-neutral-400'>
            이름
          </label>
          <input
            v-model='formData.name'
            type='text'
            class='w-full rounded-lg bg-neutral-800 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600'
            placeholder='마커 이름을 입력하세요'
          >
        </div>

        <div>
          <label class='mb-1 block text-sm text-neutral-400'>
            설명
          </label>
          <textarea
            v-model='formData.description'
            rows='4'
            class='w-full rounded-lg bg-neutral-800 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600'
            placeholder='상세 설명을 입력하세요'
          />
        </div>

        <div>
          <label class='mb-1 block text-sm text-neutral-400'>
            이미지 URL (선택)
          </label>
          <input
            v-model='formData.imageUrl'
            type='text'
            class='w-full rounded-lg bg-neutral-800 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600'
            placeholder='/images/...'
          >
        </div>

        <div>
          <label class='mb-1 block text-sm text-neutral-400'>
            문서 링크 (선택)
          </label>
          <input
            v-model='formData.documentUrl'
            type='text'
            class='w-full rounded-lg bg-neutral-800 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600'
            placeholder='https://...'
          >
        </div>

        <div>
          <label class='mb-1 block text-sm text-neutral-400'>
            태그 (쉼표로 구분, 선택)
          </label>
          <input
            v-model='tagsInput'
            type='text'
            class='w-full rounded-lg bg-neutral-800 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600'
            placeholder='태그 1, 태그 2, 태그 3'
          >
        </div>

        <!-- Coordinates Preview -->
        <div class='rounded-xl bg-neutral-800 p-3 text-sm'>
          <p class='text-neutral-400'>
            생성 위치
          </p>
          <p class='font-mono text-white'>
            ({{ position?.x }}, {{ position?.y }})
          </p>
        </div>
      </div>
      </div>

      <!-- Actions -->
      <div class='flex gap-3 border-t border-white/10 px-6 py-4'>
        <button
          class='flex-1 rounded-lg bg-neutral-700 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-600'
          @click="$emit('close')"
        >
          취소
        </button>
        <button
          class='flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700'
          @click='handleCreate'
        >
          생성
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';

import { interactiveMapKindOptions } from '~/data/interactive-map/kinds';
import type { MapPinData, MapPinKind } from '~/types/interactive-map.types';

const props = defineProps<{
  position: { x: number; y: number } | null;
}>();

const emit = defineEmits<{
  close: [];
  save: [data: Omit<MapPinData, 'id' | 'createdAt' | 'updatedAt'>];
}>();

const formData = ref({
  kind: 'nation' as MapPinKind,
  name: '',
  description: '',
  imageUrl: '',
  documentUrl: '',
  tags: [] as string[],
  visibility: 'public' as const,
});

const tagsInput = computed({
  get: () => formData.value.tags.join(', '),
  set: (value) => {
    formData.value.tags = value.split(',').map(t => t.trim()).filter(Boolean);
  },
});

const handleCreate = () => {
  if (!formData.value.name.trim()) {
    alert('이름을 입력하세요.');
    return;
  }

  if (!props.position) {
    alert('위치를 선택하세요.');
    return;
  }

  emit('save', {
    kind: formData.value.kind,
    name: formData.value.name,
    x: props.position.x,
    y: props.position.y,
    description: formData.value.description || undefined,
    imageUrl: formData.value.imageUrl || undefined,
    documentUrl: formData.value.documentUrl || undefined,
    tags: formData.value.tags.length > 0 ? formData.value.tags : undefined,
    visibility: formData.value.visibility,
  });
};
</script>
