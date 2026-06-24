import { readInteractiveMapData } from '../../utils/interactive-map-storage';

export default defineEventHandler(async () => {
  return await readInteractiveMapData();
});
