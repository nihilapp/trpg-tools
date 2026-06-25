<script setup lang="ts">
interface AppCard {
  name: string;
  description: string;
  path: string;
  icon: string;
}

const apps: AppCard[] = [
  {
    name: '세션 롤 테이블',
    description: 'TRPG 세션을 위한 랜덤 롤 테이블 도구',
    path: '/tools/session-roll-table',
    icon: 'lucide:dice-5',
  },
  {
    name: '몬스터 롤 테이블',
    description: '몬스터 관찰 데이터 생성 및 도감 기록 도구',
    path: '/tools/monster-roll-table',
    icon: 'lucide:book-open',
  },
  {
    name: '인터렉티브 맵',
    description: '세션 지도 및 랜드마크 관리 도구',
    path: '/tools/interactive-map',
    icon: 'lucide:map',
  },
  {
    name: 'PNG to WebP 변환기',
    description: 'PNG 이미지를 WebP 파일로 변환하는 로컬 변환 도구',
    path: '/tools/png-to-webp',
    icon: 'lucide:image',
  },
  {
    name: '주사위 롤러',
    description: '프리셋과 커스텀 수식으로 TRPG 주사위를 굴리는 도구',
    path: '/tools/dice-roller',
    icon: 'lucide:dices',
  },
];
</script>

<template>
  <div class='p-6 max-w-6xl mx-auto'>
    <h1 class='text-2xl font-bold text-black-900 mb-6'>
      D&D 마스터 도구
    </h1>

    <div class='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
      <NuxtLink
        v-for='app in apps'
        :key='app.path'
        :to='app.path'
        class='block p-5 border border-black-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all bg-white group'
      >
        <div class='flex items-start gap-3'>
          <div class='p-2 bg-black-50 rounded-lg group-hover:bg-blue-50 transition-colors'>
            <Icon :name='app.icon' class='w-6 h-6 text-black-700 group-hover:text-blue-500' />
          </div>
          <div class='flex-1'>
            <h2 class='text-lg font-semibold text-black-900 group-hover:text-blue-600'>
              {{ app.name }}
            </h2>
            <p class='text-sm text-black-600 mt-1'>
              {{ app.description }}
            </p>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
