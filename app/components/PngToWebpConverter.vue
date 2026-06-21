<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';

import ToolShell from '~/components/tools/ToolShell.vue';

type ConversionStatus = 'pending' | 'converting' | 'done' | 'error';

interface ConvertedImage {
  id: string;
  sourceFile: File;
  sourceUrl: string;
  outputBlob: Blob | null;
  outputUrl: string | null;
  outputName: string;
  status: ConversionStatus;
  errorMessage: string | null;
}

const quality = ref(0.85);
const items = ref<ConvertedImage[]>([]);
const isDragging = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const hasItems = computed(() => items.value.length > 0);
const isConverting = computed(() => items.value.some(item => item.status === 'converting'));
const convertibleCount = computed(() => {
  return items.value.filter(item => item.status === 'pending' || item.status === 'error').length;
});
const completedItems = computed(() => items.value.filter(item => item.status === 'done'));
const totalSourceSize = computed(() => items.value.reduce((sum, item) => sum + item.sourceFile.size, 0));
const totalOutputSize = computed(() => {
  return completedItems.value.reduce((sum, item) => sum + (item.outputBlob?.size ?? 0), 0);
});
const totalSavedPercent = computed(() => {
  if (totalSourceSize.value === 0 || totalOutputSize.value === 0) {
    return 0;
  }

  return Math.max(0, Math.round((1 - totalOutputSize.value / totalSourceSize.value) * 100));
});

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getOutputName(fileName: string): string {
  return fileName.replace(/\.png$/i, '') + '.webp';
}

function isPngFile(file: File): boolean {
  return file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ['KB', 'MB', 'GB'];
  let size = bytes / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 ? 1 : 2)} ${units[unitIndex]}`;
}

function getSavedPercent(item: ConvertedImage): number {
  if (!item.outputBlob) {
    return 0;
  }

  return Math.max(0, Math.round((1 - item.outputBlob.size / item.sourceFile.size) * 100));
}

function revokeItemUrls(item: ConvertedImage) {
  URL.revokeObjectURL(item.sourceUrl);

  if (item.outputUrl) {
    URL.revokeObjectURL(item.outputUrl);
  }
}

function addFiles(fileList: FileList | File[]) {
  const pngFiles = Array.from(fileList).filter(isPngFile);

  const nextItems = pngFiles.map(file => ({
    id: createId(),
    sourceFile: file,
    sourceUrl: URL.createObjectURL(file),
    outputBlob: null,
    outputUrl: null,
    outputName: getOutputName(file.name),
    status: 'pending' as const,
    errorMessage: null,
  }));

  items.value.push(...nextItems);
}

function handleFileInput(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    addFiles(target.files);
  }

  target.value = '';
}

function handleDrop(event: DragEvent) {
  isDragging.value = false;

  if (event.dataTransfer?.files) {
    addFiles(event.dataTransfer.files);
  }
}

async function loadImage(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    return createImageBitmap(file);
  }

  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('이미지를 읽을 수 없습니다.'));
    };
    image.src = url;
  });
}

async function convertItem(item: ConvertedImage) {
  item.status = 'converting';
  item.errorMessage = null;

  try {
    const image = await loadImage(item.sourceFile);
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas를 초기화할 수 없습니다.');
    }

    context.drawImage(image, 0, 0);

    if ('close' in image) {
      image.close();
    }

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => {
        if (!result) {
          reject(new Error('WebP 변환을 지원하지 않는 브라우저입니다.'));
          return;
        }

        resolve(result);
      }, 'image/webp', quality.value);
    });

    if (item.outputUrl) {
      URL.revokeObjectURL(item.outputUrl);
    }

    item.outputBlob = blob;
    item.outputUrl = URL.createObjectURL(blob);
    item.status = 'done';
  }
  catch (error) {
    item.status = 'error';
    item.errorMessage = error instanceof Error ? error.message : '변환 중 오류가 발생했습니다.';
  }
}

async function convertAll() {
  const targets = items.value.filter(item => item.status === 'pending' || item.status === 'error');

  for (const item of targets) {
    await convertItem(item);
  }
}

function downloadItem(item: ConvertedImage) {
  if (!item.outputUrl) {
    return;
  }

  const anchor = document.createElement('a');
  anchor.href = item.outputUrl;
  anchor.download = item.outputName;
  anchor.click();
}

function downloadAll() {
  completedItems.value.forEach(downloadItem);
}

function removeItem(item: ConvertedImage) {
  revokeItemUrls(item);
  items.value = items.value.filter(current => current.id !== item.id);
}

function clearAll() {
  items.value.forEach(revokeItemUrls);
  items.value = [];
}

onBeforeUnmount(() => {
  items.value.forEach(revokeItemUrls);
});
</script>

<template>
  <ToolShell
    title='PNG to WebP 변환기'
    description='PNG 이미지를 브라우저 안에서 WebP 파일로 변환합니다. 파일은 서버로 업로드되지 않습니다.'
  >
    <div class='grid gap-4 lg:grid-cols-[1fr_320px]'>
      <section
        @dragenter.prevent='isDragging = true'
        @dragover.prevent='isDragging = true'
        @dragleave.prevent='isDragging = false'
        @drop.prevent='handleDrop'
        :class="[
          'min-h-72 rounded-lg border-2 border-dashed bg-white p-8 flex flex-col items-center justify-center text-center transition-colors',
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-black-200 hover:border-blue-300'
        ]"
      >
        <input
          ref='fileInput'
          type='file'
          accept='image/png,.png'
          multiple
          class='hidden'
          @change='handleFileInput'
        >
        <div class='w-14 h-14 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4'>
          <Icon name='lucide:image-plus' class='w-7 h-7' />
        </div>
        <h2 class='text-lg font-semibold text-black-900'>
          PNG 파일을 끌어오거나 선택하세요
        </h2>
        <p class='text-sm text-black-500 mt-2 max-w-md'>
          여러 PNG 파일을 한 번에 추가할 수 있고, 변환은 현재 품질 설정으로 실행됩니다.
        </p>
        <button
          @click='fileInput?.click()'
          class='mt-5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors'
        >
          파일 선택
        </button>
      </section>

      <aside class='bg-white border border-black-200 rounded-lg p-5 h-fit'>
        <div class='flex items-center justify-between gap-3 mb-3'>
          <h2 class='text-sm font-semibold text-black-900'>
            변환 옵션
          </h2>
          <span class='text-sm font-semibold text-blue-700'>
            {{ Math.round(quality * 100) }}%
          </span>
        </div>
        <input
          v-model.number='quality'
          type='range'
          min='0.4'
          max='1'
          step='0.05'
          class='w-full accent-blue-600'
        >
        <div class='flex justify-between text-xs text-black-500 mt-1'>
          <span>작은 용량</span>
          <span>높은 품질</span>
        </div>

        <div class='grid grid-cols-2 gap-3 mt-5 text-sm'>
          <div class='rounded-lg bg-black-50 p-3'>
            <div class='text-xs text-black-500'>
              파일
            </div>
            <div class='font-semibold text-black-900'>
              {{ items.length }}개
            </div>
          </div>
          <div class='rounded-lg bg-black-50 p-3'>
            <div class='text-xs text-black-500'>
              완료
            </div>
            <div class='font-semibold text-black-900'>
              {{ completedItems.length }}개
            </div>
          </div>
          <div class='rounded-lg bg-black-50 p-3'>
            <div class='text-xs text-black-500'>
              원본
            </div>
            <div class='font-semibold text-black-900'>
              {{ formatBytes(totalSourceSize) }}
            </div>
          </div>
          <div class='rounded-lg bg-black-50 p-3'>
            <div class='text-xs text-black-500'>
              절감
            </div>
            <div class='font-semibold text-black-900'>
              {{ totalSavedPercent }}%
            </div>
          </div>
        </div>

        <button
          @click='convertAll'
          :disabled='!hasItems || convertibleCount === 0 || isConverting'
          class='w-full mt-5 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-black-300 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors'
        >
          {{ isConverting ? '변환 중...' : 'WebP로 변환' }}
        </button>
        <button
          v-if='completedItems.length > 0'
          @click='downloadAll'
          class='w-full mt-2 py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors'
        >
          완료된 파일 모두 다운로드
        </button>
        <button
          v-if='hasItems'
          @click='clearAll'
          class='w-full mt-2 py-2 text-sm text-black-600 hover:text-red-600 border border-black-200 rounded-lg hover:bg-red-50 transition-colors'
        >
          목록 비우기
        </button>
      </aside>
    </div>

    <section v-if='hasItems' class='mt-5 bg-white border border-black-200 rounded-lg overflow-hidden'>
      <div class='px-5 py-3 border-b border-black-100 flex items-center justify-between'>
        <h2 class='text-sm font-semibold text-black-900'>
          변환 목록
        </h2>
        <span class='text-xs text-black-500'>
          {{ completedItems.length }} / {{ items.length }}
        </span>
      </div>

      <div class='divide-y divide-black-100'>
        <div
          v-for='item in items'
          :key='item.id'
          class='p-4 flex items-center gap-4'
        >
          <img :src='item.sourceUrl' :alt='item.sourceFile.name' class='w-16 h-16 rounded border border-black-100 object-contain bg-black-50'>

          <div class='min-w-0 flex-1'>
            <div class='font-medium text-black-900 truncate'>
              {{ item.sourceFile.name }}
            </div>
            <div class='text-xs text-black-500 mt-1'>
              PNG {{ formatBytes(item.sourceFile.size) }}
              <template v-if='item.outputBlob'>
                → WebP {{ formatBytes(item.outputBlob.size) }} · {{ getSavedPercent(item) }}% 감소
              </template>
            </div>
            <div v-if='item.status === "error"' class='text-xs text-red-600 mt-1'>
              {{ item.errorMessage }}
            </div>
          </div>

          <span
            :class="[
              'text-xs px-2 py-1 rounded-full whitespace-nowrap',
              item.status === 'done' ? 'bg-green-100 text-green-700' :
              item.status === 'error' ? 'bg-red-100 text-red-700' :
              item.status === 'converting' ? 'bg-blue-100 text-blue-700' :
              'bg-black-100 text-black-600'
            ]"
          >
            {{
              item.status === 'done'
                ? '완료'
                : item.status === 'error'
                  ? '오류'
                  : item.status === 'converting'
                    ? '변환 중'
                    : '대기'
            }}
          </span>

          <button
            v-if='item.outputUrl'
            @click='downloadItem(item)'
            class='p-2 text-green-700 hover:bg-green-50 rounded-lg transition-colors'
            title='다운로드'
          >
            <Icon name='lucide:download' class='w-5 h-5' />
          </button>
          <button
            @click='removeItem(item)'
            class='p-2 text-black-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors'
            title='삭제'
          >
            <Icon name='lucide:x' class='w-5 h-5' />
          </button>
        </div>
      </div>
    </section>
  </ToolShell>
</template>
