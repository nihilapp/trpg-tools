import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { interactiveMapConfig } from '~/data/interactive-map/map-config';
import type {
  InteractiveMapData,
  MapPinData,
  MapPinKind,
} from '~/types/interactive-map.types';

const interactiveMapDataDir = path.join(process.cwd(), 'public', 'data', 'interactive-map');
const interactiveMapDataPath = path.join(interactiveMapDataDir, 'luxterra.json');

const initialPins: MapPinData[] = [
  {
    id: 'landmark-1',
    kind: 'nation',
    name: '쿠아리온 왕국',
    x: 8190,
    y: 4646,
    description: '선조의 석상을 중심으로 기억과 혈통의 권위를 보존하는 신성 왕국입니다.',
    tags: [ '왕국', '신성 왕국' ],
    visibility: 'public',
    createdAt: '2026-06-25T00:00:00.000Z',
    updatedAt: '2026-06-25T00:00:00.000Z',
  },
  {
    id: 'session-1',
    kind: 'session-area',
    name: '세션 1: 시작',
    x: 7530,
    y: 4218,
    description: '모험이 시작된 장소입니다.',
    tags: [ '세션 기록' ],
    visibility: 'public',
    createdAt: '2026-06-25T00:00:00.000Z',
    updatedAt: '2026-06-25T00:00:00.000Z',
  },
];

function createInitialInteractiveMapData(): InteractiveMapData {
  return {
    mapConfig: interactiveMapConfig,
    pins: initialPins,
  };
}

function normalizeLegacyKind(kind: string): MapPinKind {
  if (kind === 'landmark') {
    return 'nation';
  }

  if (kind === 'session') {
    return 'session-area';
  }

  return kind as MapPinKind;
}

async function ensureInteractiveMapFile() {
  await mkdir(interactiveMapDataDir, { recursive: true });

  try {
    await readFile(interactiveMapDataPath, 'utf8');
  }
  catch {
    await writeInteractiveMapData(createInitialInteractiveMapData());
  }
}

export async function readInteractiveMapData() {
  await ensureInteractiveMapFile();

  const raw = await readFile(interactiveMapDataPath, 'utf8');
  const data = JSON.parse(raw) as InteractiveMapData;

  return {
    ...data,
    pins: data.pins.map(pin => ({
      ...pin,
      kind: normalizeLegacyKind(pin.kind),
    })),
  };
}

export async function writeInteractiveMapData(data: InteractiveMapData) {
  await mkdir(interactiveMapDataDir, { recursive: true });
  await writeFile(
    interactiveMapDataPath,
    JSON.stringify(data, null, 2),
    'utf8',
  );
}

export function assertDevelopmentWriteAllowed() {
  if (!import.meta.dev) {
    throw createError({
      statusCode: 403,
      statusMessage: '개발 모드에서만 마커를 수정할 수 있습니다.',
    });
  }
}

export function normalizePinCoordinates<TPin extends { x: number; y: number }>(pin: TPin) {
  return {
    ...pin,
    x: Math.round(pin.x),
    y: Math.round(pin.y),
  };
}

export function createPinId() {
  return randomUUID();
}

