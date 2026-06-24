/**
 * 대형 이미지를 타일로 분할하는 스크립트
 *
 * 사용법:
 * 1. 원본 이미지를 public/maps/luxterra-map.webp 로 배치
 * 2. pnpm tsx scripts/generate-tiles.ts 실행
 * 3. public/tiles/luxterra/ 폴더에 Leaflet 표준 줌 순서(0=가장 축소)로 타일 생성됨
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// 설정
const CONFIG = {
  inputImage: path.join(rootDir, 'public/maps/luxterra-map.webp'),
  outputDir: path.join(rootDir, 'public/tiles/luxterra'),
  tileSize: 512,
  maxZoom: 4,
  quality: 85,
  encodeConcurrency: 4,
  progressEvery: 25,
};

interface ZoomDimensions {
  width: number;
  height: number;
}

interface RawImageBuffer {
  data: Buffer;
  channels: number;
  width: number;
  height: number;
}

function getZoomDimensions(width: number, height: number, zoom: number) {
  const divisor = Math.pow(2, CONFIG.maxZoom - zoom);

  return {
    width: Math.max(1, Math.ceil(width / divisor)),
    height: Math.max(1, Math.ceil(height / divisor)),
  } satisfies ZoomDimensions;
}

function extractTileBuffer(
  source: RawImageBuffer,
  left: number,
  top: number,
  tileWidth: number,
  tileHeight: number,
) {
  const tileBuffer = Buffer.allocUnsafe(tileWidth * tileHeight * source.channels);
  const sourceRowStride = source.width * source.channels;
  const targetRowStride = tileWidth * source.channels;

  for (let row = 0; row < tileHeight; row++) {
    const sourceStart = ((top + row) * sourceRowStride) + (left * source.channels);
    const sourceEnd = sourceStart + targetRowStride;
    const targetStart = row * targetRowStride;

    source.data.copy(tileBuffer, targetStart, sourceStart, sourceEnd);
  }

  return tileBuffer;
}

async function createRawZoomImage(
  inputImage: string,
  zoomDimensions: ZoomDimensions,
  hasAlpha: boolean,
) {
  let pipeline = sharp(inputImage, { sequentialRead: true });

  pipeline = pipeline.resize({
    width: zoomDimensions.width,
    height: zoomDimensions.height,
    fit: 'fill',
  });

  if (hasAlpha) {
    pipeline = pipeline.removeAlpha();
  }

  const result = await pipeline
    .raw()
    .toBuffer({ resolveWithObject: true });

  return {
    data: result.data,
    channels: result.info.channels,
    width: result.info.width,
    height: result.info.height,
  } satisfies RawImageBuffer;
}

async function generateTiles() {
  if (!fs.existsSync(CONFIG.inputImage)) {
    console.error('❌ 원본 이미지를 찾을 수 없습니다:', CONFIG.inputImage);
    console.log('원본 이미지를 public/maps/luxterra-map.webp 로 배치해주세요.');
    return;
  }

  // 이미지 메타데이터 읽기
  const metadata = await sharp(CONFIG.inputImage).metadata();
  const width = metadata.width!;
  const height = metadata.height!;
  const hasAlpha = metadata.hasAlpha ?? false;

  console.log(`📐 원본 이미지 크기: ${width} x ${height}`);
  console.log(`🗺️ 줌 범위: 0 ~ ${CONFIG.maxZoom} (0 = 가장 축소, ${CONFIG.maxZoom} = 최대 확대)`);

  // 출력 디렉토리 생성
  if (fs.existsSync(CONFIG.outputDir)) {
    fs.rmSync(CONFIG.outputDir, { recursive: true, });
  }
  fs.mkdirSync(CONFIG.outputDir, { recursive: true, });

  // 각 줌 레벨마다 타일 생성
  for (let zoom = 0; zoom <= CONFIG.maxZoom; zoom++) {
    const zoomDimensions = getZoomDimensions(width, height, zoom);
    const scaledWidth = zoomDimensions.width;
    const scaledHeight = zoomDimensions.height;

    console.log(`\n🔍 Zoom ${zoom}: ${scaledWidth} x ${scaledHeight}`);

    const zoomDir = path.join(CONFIG.outputDir, zoom.toString());
    fs.mkdirSync(zoomDir, { recursive: true, });

    // 타일 개수 계산
    const tilesX = Math.ceil(scaledWidth / CONFIG.tileSize);
    const tilesY = Math.ceil(scaledHeight / CONFIG.tileSize);

    console.log(`   타일 수: ${tilesX} x ${tilesY} = ${tilesX * tilesY} 개`);

    const rawZoomImage = await createRawZoomImage(CONFIG.inputImage, zoomDimensions, hasAlpha);
    const pendingWrites: Promise<unknown>[] = [];
    let processedTiles = 0;

    for (let y = 0; y < tilesY; y++) {
      for (let x = 0; x < tilesX; x++) {
        const left = x * CONFIG.tileSize;
        const top = y * CONFIG.tileSize;
        const tileWidth = Math.min(CONFIG.tileSize, scaledWidth - left);
        const tileHeight = Math.min(CONFIG.tileSize, scaledHeight - top);
        const tileBuffer = extractTileBuffer(rawZoomImage, left, top, tileWidth, tileHeight);
        const tilePath = path.join(zoomDir, `${x}-${y}.webp`);

        pendingWrites.push(
          sharp(tileBuffer, {
            raw: {
              width: tileWidth,
              height: tileHeight,
              channels: rawZoomImage.channels,
            },
          })
            .extend({
              top: 0,
              bottom: CONFIG.tileSize - tileHeight,
              left: 0,
              right: CONFIG.tileSize - tileWidth,
              background: {
                r: 0,
                g: 0,
                b: 0,
                alpha: 0,
              },
            })
            .webp({ quality: CONFIG.quality })
            .toFile(tilePath),
        );

        processedTiles++;

        if (processedTiles % CONFIG.progressEvery === 0 || processedTiles === tilesX * tilesY) {
          console.log(`   진행: ${processedTiles}/${tilesX * tilesY}`);
        }

        if (pendingWrites.length >= CONFIG.encodeConcurrency) {
          await Promise.all(pendingWrites.splice(0, pendingWrites.length));
        }
      }
    }

    if (pendingWrites.length > 0) {
      await Promise.all(pendingWrites);
    }

    console.log(`   완료: Zoom ${zoom}`);
  }

  console.log('\n✅ 타일 생성 완료!');
  console.log(`📁 출력 위치: ${CONFIG.outputDir}`);

  // 총 파일 수 계산
  let totalTiles = 0;
  for (let z = 0; z <= CONFIG.maxZoom; z++) {
    const zoomDir = path.join(CONFIG.outputDir, z.toString());
    const files = fs.readdirSync(zoomDir);
    totalTiles += files.length;
  }
  console.log(`📊 총 타일 수: ${totalTiles} 개`);
}

generateTiles().catch(console.error);
