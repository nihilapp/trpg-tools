import type { MapPinData } from '~/types/interactive-map.types';
import {
  assertDevelopmentWriteAllowed,
  createPinId,
  normalizePinCoordinates,
  readInteractiveMapData,
  writeInteractiveMapData,
} from '../../../utils/interactive-map-storage';

type CreateMapPinBody = Omit<MapPinData, 'id' | 'createdAt' | 'updatedAt'>;

export default defineEventHandler(async (event) => {
  assertDevelopmentWriteAllowed();

  const body = await readBody<CreateMapPinBody>(event);

  if (!body?.name?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: '마커 이름은 필수입니다.',
    });
  }

  const now = new Date().toISOString();
  const mapData = await readInteractiveMapData();
  const tags = body.tags?.map(tag => tag.trim()).filter(Boolean);
  const pin: MapPinData = normalizePinCoordinates({
    ...body,
    id: createPinId(),
    name: body.name.trim(),
    description: body.description?.trim() || undefined,
    imageUrl: body.imageUrl?.trim() || undefined,
    documentUrl: body.documentUrl?.trim() || undefined,
    tags: tags?.length ? tags : undefined,
    createdAt: now,
    updatedAt: now,
  });

  mapData.pins.push(pin);
  await writeInteractiveMapData(mapData);

  return pin;
});
