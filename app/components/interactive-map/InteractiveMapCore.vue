<template>
  <div class='flex h-full w-full overflow-hidden bg-[#141311] text-white'>

    <aside
      :class="[
        'relative z-[1100] flex h-full shrink-0 flex-col border-r border-[#7f7457]/40 bg-[#1a1815] shadow-2xl transition-[width] duration-300',
        isSidebarOpen ? 'w-[22rem]' : 'w-[4.5rem]',
      ]"
    >
      <div
        :class="[
          'flex border-b border-[#7f7457]/30',
          isSidebarOpen ? 'items-start justify-between px-5 pb-4 pt-5' : 'justify-center px-3 py-4',
        ]"
      >
        <div v-if='isSidebarOpen'>
          <p class='text-[11px] uppercase tracking-[0.35em] text-[#d7c9a2]/60'>
            Luxterra Atlas
          </p>
          <h1 class='mt-2 font-serif text-3xl leading-none text-[#e8d8aa]'>
            인터렉티브 맵
          </h1>
          <p class='mt-3 text-sm text-[#d8d1c0]/75'>
            국가, 도시, 세력과 세션 흔적을 한 화면에서 정리합니다.
          </p>
        </div>
        <button
          :aria-label="isSidebarOpen ? '사이드바 접기' : '사이드바 펼치기'"
          :class="[
            'rounded-md border border-[#7f7457]/30 bg-black/20 p-2 text-[#d8d1c0] transition-colors hover:bg-white/10',
            isSidebarOpen ? 'mt-1' : '',
          ]"
          @click='toggleSidebar'
        >
          <Icon :icon="isSidebarOpen ? 'lucide:panel-left-close' : 'lucide:panel-left-open'" class='h-4 w-4' />
        </button>
      </div>

      <div v-if='isSidebarOpen' class='border-b border-[#7f7457]/30 px-5 py-4'>
        <div class='flex gap-2'>
          <NuxtLink
            to='/'
            class='inline-flex items-center gap-2 rounded-md border border-[#7f7457]/40 bg-[#24211b] px-3 py-2 text-xs font-medium text-[#f0e6c5] transition-colors hover:bg-[#2f2a22]'
          >
            <Icon icon='lucide:arrow-left' class='h-3.5 w-3.5' />
            앱 목록으로
          </NuxtLink>
          <button
            class='inline-flex items-center gap-2 rounded-md border border-[#7f7457]/40 bg-[#24211b] px-3 py-2 text-xs font-medium text-[#f0e6c5] transition-colors hover:bg-[#2f2a22]'
            @click='fitToMapBounds'
          >
            <Icon icon='lucide:scan-search' class='h-3.5 w-3.5' />
            전체 보기
          </button>
        </div>

        <div class='mt-4'>
          <label class='mb-2 block text-[11px] uppercase tracking-[0.28em] text-[#d7c9a2]/55'>
            Search
          </label>
          <div class='relative'>
            <input
              v-model='searchQuery'
              type='text'
              placeholder='장소, 태그, 설명 검색'
              class='w-full rounded-md border border-[#7f7457]/40 bg-[#110f0d] px-3 py-2 pr-10 text-sm text-[#f5f0df] outline-none transition-colors placeholder:text-[#8c836f] focus:border-[#c6ad69]'
            >
            <button
              v-if='searchQuery'
              class='absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[#8c836f] hover:text-[#f5f0df]'
              @click="searchQuery = ''"
            >
              <Icon icon='lucide:x' class='h-4 w-4' />
            </button>
          </div>
        </div>
      </div>

      <div
        v-if='isSidebarOpen'
        class='flex-1 overflow-y-auto px-5 py-4'
      >
        <div v-if='isDevelopment' class='mb-5 rounded-xl border border-[#7f7457]/30 bg-[#221f19] p-3'>
          <p class='text-[11px] uppercase tracking-[0.28em] text-[#d7c9a2]/55'>
            Development
          </p>
          <div class='mt-3 space-y-2'>
            <button
              :class="[
                'flex w-full items-center justify-between rounded-lg border px-3 py-3 text-left transition-colors',
                createModeEnabled
                  ? 'border-emerald-500/60 bg-emerald-900/40 text-white'
                  : 'border-[#4b4336] bg-[#302a21] text-[#f0e6c5] hover:bg-[#3b3429]',
              ]"
              @click='enableCreateMode'
            >
              <span class='flex items-center gap-3'>
                <span
                  :class="[
                    'flex h-5 w-5 items-center justify-center rounded border transition-colors',
                    createModeEnabled
                      ? 'border-emerald-300 bg-emerald-500 text-[#0f140f]'
                      : 'border-[#8f8164] bg-transparent text-transparent',
                  ]"
                >
                  <Icon icon='lucide:check' class='h-3.5 w-3.5' />
                </span>
                <span class='text-sm font-medium'>생성 모드</span>
              </span>
              <span class='text-xs font-semibold tracking-[0.18em]'>
                {{ createModeEnabled ? 'ON' : 'OFF' }}
              </span>
            </button>

            <button
              :class="[
                'flex w-full items-center justify-between rounded-lg border px-3 py-3 text-left transition-colors',
                isDraggingMode
                  ? 'border-amber-500/60 bg-amber-900/40 text-white'
                  : 'border-[#4b4336] bg-[#302a21] text-[#f0e6c5] hover:bg-[#3b3429]',
              ]"
              @click='toggleDragMode'
            >
              <span class='flex items-center gap-3'>
                <span
                  :class="[
                    'flex h-5 w-5 items-center justify-center rounded border transition-colors',
                    isDraggingMode
                      ? 'border-amber-300 bg-amber-500 text-[#1a1208]'
                      : 'border-[#8f8164] bg-transparent text-transparent',
                  ]"
                >
                  <Icon icon='lucide:check' class='h-3.5 w-3.5' />
                </span>
                <span class='text-sm font-medium'>마커 이동</span>
              </span>
              <span class='text-xs font-semibold tracking-[0.18em]'>
                {{ isDraggingMode ? 'ON' : 'OFF' }}
              </span>
            </button>
          </div>
        </div>

        <div class='mb-4 flex items-center justify-between'>
          <p class='text-[11px] uppercase tracking-[0.28em] text-[#d7c9a2]/55'>
            Marker Types
          </p>
          <div class='flex gap-2 text-[11px] font-medium text-[#d7c9a2]'>
            <button class='hover:text-white' @click='enableAllFilters'>
              전체 표시
            </button>
            <button class='hover:text-white' @click='disableAllFilters'>
              전체 숨김
            </button>
          </div>
        </div>

        <div class='grid grid-cols-2 gap-2'>
          <button
            v-for='filter in filters'
            :key='filter.kind'
            :class="[
              'flex min-h-[4.25rem] w-full items-start gap-2 rounded-xl border px-2.5 py-2 text-left transition-colors',
              filter.enabled
                ? 'border-[#7f7457]/50 bg-[#2b261f] text-white'
                : 'border-[#3b352a] bg-[#181613] text-[#91866d]',
            ]"
            @click='toggleFilter(filter.kind)'
          >
            <span :class="['mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white', filter.accentClass]">
              <Icon :icon='filter.icon' class='h-3.5 w-3.5' />
            </span>
            <span class='min-w-0 flex-1'>
              <span class='block text-[11px] font-semibold leading-4'>{{ filter.label }}</span>
              <span class='mt-0.5 block text-[10px] leading-3 text-[#c8bea6]/65'>{{ getPinCountByKind(filter.kind) }}개</span>
            </span>
            <span class='ml-auto text-[10px] font-semibold leading-4'>
              {{ filter.enabled ? 'ON' : 'OFF' }}
            </span>
          </button>
        </div>

        <div class='mt-6 rounded-xl border border-[#7f7457]/30 bg-[#161411] p-4'>
          <div class='flex items-center justify-between'>
            <p class='text-[11px] uppercase tracking-[0.28em] text-[#d7c9a2]/55'>
              Visible Markers
            </p>
            <span class='text-sm font-semibold text-[#f0e6c5]'>{{ filteredPins.length }}</span>
          </div>

          <div class='mt-3 space-y-2 pr-1'>
            <button
              v-for='pin in filteredPins'
              :key='pin.id'
              :class="[
                'w-full rounded-lg border px-3 py-2 text-left transition-colors',
                selectedPin?.id === pin.id
                  ? 'border-[#c6ad69] bg-[#2d271f]'
                  : 'border-[#393327] bg-[#1d1a16] hover:bg-[#26221c]',
              ]"
              @click='selectPin(pin)'
            >
              <span class='flex items-center gap-2 text-xs text-[#d7c9a2]'>
                <Icon :icon='getKindMeta(pin.kind).icon' class='h-3.5 w-3.5' />
                {{ getKindMeta(pin.kind).label }}
              </span>
              <span class='mt-1 block text-sm font-medium text-white'>{{ pin.name }}</span>
            </button>
            <p v-if='filteredPins.length === 0' class='py-4 text-sm text-[#8f8674]'>
              현재 조건에 맞는 마커가 없습니다.
            </p>
          </div>
        </div>
      </div>
    </aside>

    <div class='relative min-w-0 flex-1'>
      <div ref='mapContainer' class='h-full w-full' />

      <div class='absolute bottom-4 right-4 z-[1000] rounded-lg bg-[#1a1815]/88 px-3 py-2 text-[10px] text-[#d8d1c0] shadow-lg backdrop-blur-sm'>
        <p v-if='isDevelopment && isDraggingMode'>
          클릭 후 드래그: 마커 이동
        </p>
        <p v-else-if='isDevelopment && createModeEnabled'>
          지도 클릭: 새 마커 배치
        </p>
        <p>마커 클릭: 상세 정보</p>
        <p>휠: 확대/축소</p>
      </div>

      <div
        v-if='isLoading'
        class='absolute inset-0 z-[2000] flex items-center justify-center bg-black/70'
      >
        <div class='rounded-xl border border-[#7f7457]/40 bg-[#1a1815] px-5 py-4 text-sm text-[#f0e6c5] shadow-2xl'>
          지도 데이터를 불러오는 중입니다.
        </div>
      </div>
    </div>

    <InteractiveMapPinModal
      v-if='selectedPin'
      :pin='selectedPin'
      :is-editing='isEditing'
      :can-manage='isDevelopment'
      @close='closeModal'
      @edit='startEditing'
      @delete='deletePin'
      @save='savePin'
    />

    <InteractiveMapCreateModal
      v-if='isDevelopment && isCreating'
      :position='createPosition'
      @close='cancelCreate'
      @save='createPin'
    />

  </div>
</template>

<script setup lang="ts">
import 'leaflet/dist/leaflet.css';
import { Icon } from '@iconify/vue';
import type { Map as LeafletMap, Marker as LeafletMarker, LeafletEvent } from 'leaflet';

import {
  interactiveMapKindLabelMap,
  interactiveMapKindOptions,
} from '~/data/interactive-map/kinds';
import { interactiveMapConfig as fallbackMapConfig } from '~/data/interactive-map/map-config';
import type {
  InteractiveMapData,
  MapConfig,
  MapPinData,
  MapPinKind,
} from '~/types/interactive-map.types';

type LeafletModule = typeof import('leaflet');

const isDevelopment = import.meta.dev;

const mapContainer = ref<HTMLDivElement | null>(null);
const isLoading = ref(true);
const isSidebarOpen = ref(true);
const mapConfig = ref<MapConfig>(fallbackMapConfig);
const pins = ref<MapPinData[]>([]);
const selectedPin = ref<MapPinData | null>(null);
const isEditing = ref(false);
const isCreating = ref(false);
const createPosition = ref<{ x: number; y: number } | null>(null);
const searchQuery = ref('');
const createModeEnabled = ref(false);
const isDraggingMode = ref(false);

const filters = ref(interactiveMapKindOptions.map(option => ({
  ...option,
  enabled: true,
})));

let leafletModule: LeafletModule | null = null;
const markers = new Map<string, LeafletMarker>();
let map: LeafletMap | null = null;
let escHandler: ((event: KeyboardEvent) => void) | null = null;
let resizeObserver: ResizeObserver | null = null;
let resizeFrameId: number | null = null;

const emptyTileDataUrl = 'data:image/svg+xml;charset=UTF-8,'
  + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"></svg>');

const filteredPins = computed(() => {
  return pins.value.filter((pin) => {
    const filter = filters.value.find(item => item.kind === pin.kind);
    if (!filter?.enabled) {
      return false;
    }

    if (!searchQuery.value) {
      return true;
    }

    const query = searchQuery.value.toLowerCase();

    return (
      pin.name.toLowerCase().includes(query)
      || pin.description?.toLowerCase().includes(query)
      || pin.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  });
});

async function getLeaflet() {
  if (!leafletModule) {
    leafletModule = await import('leaflet');
  }

  return leafletModule;
}

function getKindMeta(kind: MapPinKind) {
  const matched = filters.value.find(item => item.kind === kind);
  return matched ?? interactiveMapKindOptions[0]!;
}

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
}

function toggleFilter(kind: MapPinKind) {
  const filter = filters.value.find(item => item.kind === kind);
  if (!filter) {
    return;
  }

  filter.enabled = !filter.enabled;
  updateMarkers();
}

function enableAllFilters() {
  filters.value.forEach((filter) => {
    filter.enabled = true;
  });
  updateMarkers();
}

function disableAllFilters() {
  filters.value.forEach((filter) => {
    filter.enabled = false;
  });
  updateMarkers();
}

function getPinCountByKind(kind: MapPinKind) {
  return pins.value.filter(pin => pin.kind === kind).length;
}

function resetInteractionModes() {
  createModeEnabled.value = false;
  isDraggingMode.value = false;

  if (map) {
    map.getContainer().style.cursor = '';
  }

  markers.forEach((marker) => {
    marker.dragging?.disable();
    marker.off('drag', handleMarkerDrag);
    marker.off('dragend', handleMarkerDragEnd);
  });
}

function toggleDragMode() {
  if (!isDevelopment) {
    return;
  }

  isDraggingMode.value = !isDraggingMode.value;
  createModeEnabled.value = false;

  if (map) {
    map.getContainer().style.cursor = isDraggingMode.value ? 'move' : '';
  }

  updateMarkerDraggableState();
}

function enableCreateMode() {
  if (!isDevelopment) {
    return;
  }

  const nextValue = !createModeEnabled.value;
  createModeEnabled.value = nextValue;

  if (nextValue) {
    isDraggingMode.value = false;
    updateMarkerDraggableState();
  }

  if (map) {
    map.getContainer().style.cursor = nextValue ? 'crosshair' : '';
  }
}

function disableCreateMode() {
  createModeEnabled.value = false;

  if (map && !isDraggingMode.value) {
    map.getContainer().style.cursor = '';
  }
}

function openCreateModal(x: number, y: number) {
  if (!isDevelopment) {
    return;
  }

  createPosition.value = { x, y };
  isCreating.value = true;
}

function cancelCreate() {
  isCreating.value = false;
  createPosition.value = null;
}

function selectPin(pin: MapPinData) {
  if (createModeEnabled.value) {
    return;
  }

  if (isDraggingMode.value) {
    return;
  }

  selectedPin.value = pin;
  isEditing.value = false;
}

function startEditing() {
  if (!isDevelopment) {
    return;
  }

  isEditing.value = true;
}

function closeModal() {
  selectedPin.value = null;
  isEditing.value = false;
}

function getMarkerSvg(kind: MapPinKind, isSelected: boolean) {
  const meta = getKindMeta(kind);
  const size = isSelected ? 48 : 40;
  const innerSize = size * 0.34;

  return `
    <div style="position: relative; width: ${size}px; height: ${size + 10}px;">
      <svg width="${size}" height="${size + 10}" viewBox="0 0 40 50" style="position: absolute;">
        <path
          d="M20 0C8.954 0 0 8.954 0 20C0 33.75 20 50 20 50C20 50 40 33.75 40 20C40 8.954 31.046 0 20 0Z"
          fill="${meta.color}"
          stroke="${isSelected ? '#f2d694' : 'white'}"
          stroke-width="${isSelected ? '3.2' : '2.5'}"
        />
        <circle cx="20" cy="18" r="9" fill="rgba(255,255,255,0.22)"/>
      </svg>
      <div style="
        position: absolute;
        top: ${size * 0.35}px;
        left: ${size * 0.35}px;
        width: ${size * 0.3}px;
        height: ${size * 0.3}px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="${innerSize}" height="${innerSize}" viewBox="0 0 32 32" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          ${meta.markerSvg}
        </svg>
      </div>
    </div>
  `;
}

async function getMarkerIcon(kind: MapPinKind, isSelected = false) {
  const L = await getLeaflet();
  const size = isSelected ? 48 : 40;

  return L.divIcon({
    className: 'custom-marker',
    html: getMarkerSvg(kind, isSelected),
    iconSize: [ size, size + 10 ],
    iconAnchor: [ size / 2, size + 10 ],
    popupAnchor: [ 0, -(size + 10) ],
  });
}

async function addMarker(pin: MapPinData) {
  if (!map) {
    return;
  }

  const L = await getLeaflet();
  const marker = L.marker([ -toMapCoordinateY(pin.y), toMapCoordinateX(pin.x) ], {
    icon: await getMarkerIcon(pin.kind, selectedPin.value?.id === pin.id),
    draggable: isDevelopment && isDraggingMode.value,
  });

  marker.on('click', () => selectPin(pin));

  if (isDevelopment && isDraggingMode.value) {
    marker.dragging?.enable();
    marker.on('drag', handleMarkerDrag);
    marker.on('dragend', handleMarkerDragEnd);
  }

  marker.addTo(map);
  markers.set(pin.id, marker);
}

async function updateMarker(pin: MapPinData) {
  const marker = markers.get(pin.id);
  if (!marker) {
    return;
  }

  marker.setLatLng([ -toMapCoordinateY(pin.y), toMapCoordinateX(pin.x) ]);
  marker.setIcon(await getMarkerIcon(pin.kind, selectedPin.value?.id === pin.id));
}

async function updateMarkers() {
  markers.forEach(marker => marker.remove());
  markers.clear();

  for (const pin of filteredPins.value) {
    await addMarker(pin);
  }
}

function updateMarkerDraggableState() {
  markers.forEach((marker) => {
    if (isDevelopment && isDraggingMode.value) {
      marker.dragging?.enable();
      marker.on('drag', handleMarkerDrag);
      marker.on('dragend', handleMarkerDragEnd);
    }
    else {
      marker.dragging?.disable();
      marker.off('drag', handleMarkerDrag);
      marker.off('dragend', handleMarkerDragEnd);
    }
  });
}

function handleMarkerDrag() {
  if (map) {
    map.getContainer().style.cursor = 'grabbing';
  }
}

async function handleMarkerDragEnd(event: LeafletEvent & { target: LeafletMarker }) {
  if (!map) {
    return;
  }

  map.getContainer().style.cursor = isDraggingMode.value ? 'move' : '';

  const pinId = Array.from(markers.entries())
    .find(([, marker]) => marker === event.target)?.[0];

  if (!pinId) {
    return;
  }

  const pin = pins.value.find(item => item.id === pinId);
  if (!pin) {
    return;
  }

  const latlng = event.target.getLatLng();
  const nextPin: MapPinData = {
    ...pin,
    x: toStoredCoordinateX(latlng.lng),
    y: toStoredCoordinateY(-latlng.lat),
  };

  try {
    const savedPin = await $fetch<MapPinData>(`/api/interactive-map/pins/${pin.id}`, {
      method: 'PATCH',
      body: nextPin,
    });

    replacePin(savedPin);
  }
  catch (error) {
    await updateMarker(pin);
    showRequestError(error, '마커 이동 저장에 실패했습니다.');
  }
}

function replacePin(pin: MapPinData) {
  const pinIndex = pins.value.findIndex(item => item.id === pin.id);
  if (pinIndex === -1) {
    return;
  }

  pins.value[pinIndex] = pin;

  if (selectedPin.value?.id === pin.id) {
    selectedPin.value = pin;
  }

  void updateMarkers();
}

async function loadMapData() {
  const data = await $fetch<InteractiveMapData>('/api/interactive-map');
  mapConfig.value = data.mapConfig;
  pins.value = data.pins;
}

async function createPin(data: Omit<MapPinData, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const newPin = await $fetch<MapPinData>('/api/interactive-map/pins', {
      method: 'POST',
      body: data,
    });

    pins.value.push(newPin);
    await updateMarkers();
    isCreating.value = false;
    createPosition.value = null;

    if (map) {
      map.getContainer().style.cursor = 'crosshair';
    }
  }
  catch (error) {
    showRequestError(error, '마커 생성에 실패했습니다.');
  }
}

async function savePin(updatedPin: MapPinData) {
  try {
    const savedPin = await $fetch<MapPinData>(`/api/interactive-map/pins/${updatedPin.id}`, {
      method: 'PATCH',
      body: updatedPin,
    });

    replacePin(savedPin);
    selectedPin.value = savedPin;
    isEditing.value = false;
  }
  catch (error) {
    showRequestError(error, '마커 저장에 실패했습니다.');
  }
}

async function deletePin(id: string) {
  try {
    const response = await fetch(`/api/interactive-map/pins/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('마커 삭제에 실패했습니다.');
    }

    pins.value = pins.value.filter(pin => pin.id !== id);
    selectedPin.value = null;
    await updateMarkers();
  }
  catch (error) {
    showRequestError(error, '마커 삭제에 실패했습니다.');
  }
}

function showRequestError(error: unknown, fallbackMessage: string) {
  const errorMessage = typeof error === 'object' && error !== null
    ? (
        ('statusMessage' in error && typeof error.statusMessage === 'string' && error.statusMessage)
        || ('message' in error && typeof error.message === 'string' && error.message)
      )
    : '';

  alert(errorMessage || fallbackMessage);
}

function fitToMapBounds() {
  if (!map) {
    return;
  }

  const normalizedWidth = getNormalizedMapWidth();
  const normalizedHeight = getNormalizedMapHeight();
  const bounds = [
    [ -normalizedHeight, 0 ],
    [ 0, normalizedWidth ],
  ] as [[number, number], [number, number]];

  map.fitBounds(bounds);
}

function handleMapViewportResize() {
  if (!map) {
    return;
  }

  map.invalidateSize({ animate: false });

  if (map.getZoom() <= mapConfig.value.minZoom + 0.001) {
    fitToMapBounds();
  }
}

function getBaseCoordinateDivisor() {
  return Math.pow(2, mapConfig.value.maxZoom);
}

function getNormalizedMapWidth() {
  return mapConfig.value.width / getBaseCoordinateDivisor();
}

function getNormalizedMapHeight() {
  return mapConfig.value.height / getBaseCoordinateDivisor();
}

function toMapCoordinateX(x: number) {
  return x / getBaseCoordinateDivisor();
}

function toMapCoordinateY(y: number) {
  return y / getBaseCoordinateDivisor();
}

function toStoredCoordinateX(x: number) {
  return Math.round(x * getBaseCoordinateDivisor());
}

function toStoredCoordinateY(y: number) {
  return Math.round(y * getBaseCoordinateDivisor());
}

function getTileGridSizeForFileZoom(fileZoom: number) {
  const divisor = Math.pow(2, mapConfig.value.maxZoom - fileZoom);

  const scaledWidth = Math.max(1, Math.ceil(mapConfig.value.width / divisor));
  const scaledHeight = Math.max(1, Math.ceil(mapConfig.value.height / divisor));

  return {
    tilesX: Math.ceil(scaledWidth / mapConfig.value.tileSize),
    tilesY: Math.ceil(scaledHeight / mapConfig.value.tileSize),
  };
}

async function buildMap() {
  if (!mapContainer.value) {
    return;
  }

  const L = await getLeaflet();
  const normalizedWidth = getNormalizedMapWidth();
  const normalizedHeight = getNormalizedMapHeight();
  const bounds: [[number, number], [number, number]] = [
    [ -normalizedHeight, 0 ],
    [ 0, normalizedWidth ],
  ];

  map = L.map(mapContainer.value, {
    crs: L.CRS.Simple,
    minZoom: mapConfig.value.minZoom,
    maxZoom: mapConfig.value.maxZoom,
    maxBounds: bounds,
    maxBoundsViscosity: 1,
    zoomControl: true,
    attributionControl: false,
    scrollWheelZoom: true,
    doubleClickZoom: false,
    zoomAnimation: false,
    fadeAnimation: false,
    markerZoomAnimation: false,
  });

  const tileLayer = L.tileLayer('', {
    tileSize: mapConfig.value.tileSize,
    noWrap: true,
    bounds,
    minZoom: 0,
    maxZoom: mapConfig.value.maxZoom,
    keepBuffer: 0,
    updateWhenIdle: true,
    updateWhenZooming: false,
  });

  tileLayer.getTileUrl = (coords) => {
    const fileZoom = coords.z;
    const { tilesX, tilesY } = getTileGridSizeForFileZoom(fileZoom);
    const fileY = coords.y;

    if (
      fileZoom < 0
      || fileZoom > mapConfig.value.maxZoom
      || coords.x < 0
      || fileY < 0
      || coords.x >= tilesX
      || fileY >= tilesY
    ) {
      return emptyTileDataUrl;
    }

    return `${mapConfig.value.tilePath}/${fileZoom}/${coords.x}-${fileY}.webp`;
  };

  tileLayer.addTo(map);

  map.fitBounds(bounds);
  await updateMarkers();

  map.on('click', (event) => {
    if (isDevelopment && createModeEnabled.value) {
      openCreateModal(
        toStoredCoordinateX(event.latlng.lng),
        toStoredCoordinateY(-event.latlng.lat),
      );
    }
  });

  map.on('dblclick', (event) => {
    if (isDevelopment && !isDraggingMode.value) {
      openCreateModal(
        toStoredCoordinateX(event.latlng.lng),
        toStoredCoordinateY(-event.latlng.lat),
      );
    }
  });

  map.on('contextmenu', () => {
    resetInteractionModes();
  });
}

watch(searchQuery, () => {
  void updateMarkers();
});

watch(selectedPin, () => {
  void updateMarkers();
});

watch(isDraggingMode, () => {
  updateMarkerDraggableState();
});

onMounted(async () => {
  try {
    await loadMapData();
    await buildMap();
  }
  catch (error) {
    showRequestError(error, '인터렉티브 맵 데이터를 불러오지 못했습니다.');
  }
  finally {
    isLoading.value = false;
  }

  escHandler = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      resetInteractionModes();
    }
  };

  document.addEventListener('keydown', escHandler);

  if (mapContainer.value) {
    resizeObserver = new ResizeObserver(() => {
      if (resizeFrameId !== null) {
        cancelAnimationFrame(resizeFrameId);
      }

      resizeFrameId = window.requestAnimationFrame(() => {
        resizeFrameId = null;
        handleMapViewportResize();
      });
    });

    resizeObserver.observe(mapContainer.value);
  }
});

onBeforeUnmount(() => {
  if (escHandler) {
    document.removeEventListener('keydown', escHandler);
  }

  if (resizeFrameId !== null) {
    cancelAnimationFrame(resizeFrameId);
    resizeFrameId = null;
  }

  resizeObserver?.disconnect();
  resizeObserver = null;

  map?.remove();
  map = null;
});
</script>

<style>
.custom-marker {
  background: transparent;
  border: none;
  transition: transform 0.2s;
}

.custom-marker:hover {
  transform: scale(1.08);
  cursor: pointer;
}

.leaflet-marker-pane img {
  max-width: none !important;
}

.leaflet-top.leaflet-right {
  margin-top: 1rem;
  margin-right: 1rem;
}

.leaflet-control-zoom {
  border: none !important;
}

.leaflet-control-zoom-in,
.leaflet-control-zoom-out {
  background-color: rgba(16, 15, 12, 0.92) !important;
  color: #f0e6c5 !important;
  border: 1px solid rgba(198, 173, 105, 0.35) !important;
}

.leaflet-control-zoom-in:hover,
.leaflet-control-zoom-out:hover {
  background-color: rgba(43, 38, 31, 0.96) !important;
}

.leaflet-marker-draggable {
  cursor: move !important;
}
</style>
