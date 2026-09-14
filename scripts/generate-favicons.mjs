import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const SRC = 'public/img/logos/jp-logo.png';
const OUT_DIR = 'public/ico';

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const meta = await sharp(SRC).metadata();
  console.log('[v0] source size', meta.width, meta.height);

  // The logo is a wordmark: "J&P" on top, "MORITZ CONSULTING GROUP" below.
  // For a small favicon mark, crop to the top "J&P" glyph only, then trim
  // whitespace and pad into a square on a white background.
  const cropHeight = Math.round(meta.height * 0.62);
  const croppedBuffer = await sharp(SRC)
    .extract({ left: 0, top: 0, width: meta.width, height: cropHeight })
    .png()
    .toBuffer();
  const trimmed = await sharp(croppedBuffer).trim({ threshold: 10 }).png().toBuffer();
  const trimmedMeta = await sharp(trimmed).metadata();
  console.log('[v0] trimmed size', trimmedMeta.width, trimmedMeta.height);

  const side = Math.max(trimmedMeta.width, trimmedMeta.height);
  const pad = Math.round(side * 0.18);
  const squareSide = side + pad * 2;

  const square = await sharp(trimmed)
    .resize({
      width: squareSide - pad * 2,
      height: squareSide - pad * 2,
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png()
    .toBuffer();

  const sizes = [
    ['favicon-16x16.png', 16],
    ['favicon-32x32.png', 32],
    ['apple-touch-icon.png', 180],
    ['android-chrome-192x192.png', 192],
    ['android-chrome-512x512.png', 512],
    ['mstile-150x150.png', 150],
  ];

  for (const [name, size] of sizes) {
    await sharp(square).resize(size, size).png().toFile(`${OUT_DIR}/${name}`);
    console.log('[v0] wrote', name);
  }

  // Build a valid .ico container embedding 16x16 and 32x32 PNG payloads directly
  // (supported by all modern browsers/OSes without needing a BMP re-encode).
  const png16 = await sharp(square).resize(16, 16).png().toBuffer();
  const png32 = await sharp(square).resize(32, 32).png().toBuffer();
  const ico = buildIco([
    { size: 16, data: png16 },
    { size: 32, data: png32 },
  ]);
  await import('node:fs/promises').then((fs) => fs.writeFile(`${OUT_DIR}/favicon.ico`, ico));
  console.log('[v0] wrote favicon.ico');

  console.log('[v0] done');
}

function buildIco(images) {
  const headerSize = 6;
  const entrySize = 16;
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);

  const entries = [];
  const dataParts = [];
  let offset = headerSize + entrySize * images.length;

  for (const { size, data } of images) {
    const entry = Buffer.alloc(entrySize);
    entry.writeUInt8(size === 256 ? 0 : size, 0);
    entry.writeUInt8(size === 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2); // color palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    dataParts.push(data);
    offset += data.length;
  }

  return Buffer.concat([header, ...entries, ...dataParts]);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
