import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height, r, g, b, a = 255) {
  const rowSize = width * 4 + 1;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type: None
    
    // Draw an elegant emerald/gold Islamic gradient badge
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - width / 2;
      const dy = y - height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxR = width / 2;

      // Outer squircle or circular frame
      const isInside = Math.abs(dx) < width * 0.45 && Math.abs(dy) < height * 0.45;
      const isGoldRing = Math.abs(dist - maxR * 0.72) < Math.max(2, width * 0.02);
      
      // Central play triangle check
      const tx = (x - width * 0.42) / (width * 0.22);
      const ty = (y - height * 0.5) / (height * 0.18);
      const isPlayTriangle = tx >= 0 && tx <= 1 && Math.abs(ty) <= (1 - tx);

      if (isPlayTriangle) {
        // Gold play icon
        rawData[pxOffset] = 255;
        rawData[pxOffset + 1] = 224;
        rawData[pxOffset + 2] = 130;
        rawData[pxOffset + 3] = 255;
      } else if (isGoldRing) {
        // Gold ornament ring
        rawData[pxOffset] = 255;
        rawData[pxOffset + 1] = 215;
        rawData[pxOffset + 2] = 100;
        rawData[pxOffset + 3] = 230;
      } else if (isInside) {
        // Islamic deep emerald gradient
        const t = y / height;
        rawData[pxOffset] = Math.round(0 * (1 - t) + 18 * t);
        rawData[pxOffset + 1] = Math.round(108 * (1 - t) + 43 * t);
        rawData[pxOffset + 2] = Math.round(76 * (1 - t) + 34 * t);
        rawData[pxOffset + 3] = 255;
      } else {
        // Border padding for maskable
        rawData[pxOffset] = 0;
        rawData[pxOffset + 1] = 74;
        rawData[pxOffset + 2] = 51;
        rawData[pxOffset + 3] = 255;
      }
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = createChunk('IHDR', ihdr);

  // IDAT
  const idatChunk = createChunk('IDAT', deflated);

  // IEND
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4);
  data.copy(chunk, 8);
  const typeAndData = Buffer.concat([Buffer.from(type), data]);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate PWA icons
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, 192));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, 512));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPNG(512, 512));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPNG(32, 32));

console.log('PWA icons created successfully in public/');
