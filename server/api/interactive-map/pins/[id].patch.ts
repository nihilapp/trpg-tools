import type { MapPinData } from '~/types/interactive-map.types';
import {
  assertDevelopmentWriteAllowed,
  normalizePinCoordinates,
  readInteractiveMapData,
  writeInteractiveMapData,
} from '../../../utils/interactive-map-storage';

type UpdateMapPinBody = Partial<Omit<MapPinData, 'id' | 'createdAt' | 'updatedAt'>>;

export default defineEventHandler(async (event) => {
  assertDevelopmentWriteAllowed();

  const pinId = getRouterParam(event, 'id');
  const body = await readBody<UpdateMapPinBody>(event);

  if (!pinId) {
    throw createError({
      statusCode: 400,
      statusMessage: '마커 ID가 필요합니다.',
    });
  }

  const mapData = await readInteractiveMapData();
  const pinIndex = mapData.pins.findIndex(pin => pin.id === pinId);

  if (pinIndex === -1) {
    throw createError({
      statusCode: 404,
      statusMessage: '마커를 찾을 수 없습니다.',
    });
  }

  const currentPin = mapData.pins[pinIndex]!;
  const tags = body.tags?.map(tag => tag.trim()).filter(Boolean);
  const updatedPin = normalizePinCoordinates({
    ...currentPin,
    ...body,
    name: body.name !== undefined ? body.name.trim() : currentPin.name,
    description: body.description !== undefined
      ? body.description.trim() || undefined
      : currentPin.description,
    imageUrl: body.imageUrl !== undefined
      ? body.imageUrl.trim() || undefined
      : currentPin.imageUrl,
    documentUrl: body.documentUrl !== undefined
      ? body.documentUrl.trim() || undefined
      : currentPin.documentUrl,
    tags: body.tags !== undefined
      ? (tags?.length ? tags : undefined)
      : currentPin.tags,
    updatedAt: new Date().toISOString(),
  });

  mapData.pins[pinIndex] = updatedPin;
  await writeInteractiveMapData(mapData);

  return updatedPin;
});
