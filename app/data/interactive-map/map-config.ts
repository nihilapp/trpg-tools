import type { MapConfig } from '~/types/interactive-map.types';

export const interactiveMapConfig: MapConfig = {
  id: 'luxterra',
  name: '룩스테라 전도',
  width: 16380,
  height: 9292,
  minZoom: 0,
  maxZoom: 4,
  tileSize: 512,
  tilePath: '/tiles/luxterra',
};
