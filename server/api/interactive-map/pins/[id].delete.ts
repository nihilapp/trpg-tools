import {
  assertDevelopmentWriteAllowed,
  readInteractiveMapData,
  writeInteractiveMapData
} from '../../../utils/interactive-map-storage';

export default defineEventHandler(async (event) => {
  assertDevelopmentWriteAllowed();

  const pinId = getRouterParam(event, 'id');

  if (!pinId) {
    throw createError({
      statusCode: 400,
      statusMessage: '마커 ID가 필요합니다.',
    });
  }

  const mapData = await readInteractiveMapData();
  const nextPins = mapData.pins.filter((pin) => pin.id !== pinId);
  const deleted = nextPins.length !== mapData.pins.length;

  if (!deleted) {
    return {
      success: true,
      id: pinId,
      deleted: false,
    };
  }

  mapData.pins = nextPins;
  await writeInteractiveMapData(mapData);

  return {
    success: true,
    id: pinId,
    deleted: true,
  };
});
