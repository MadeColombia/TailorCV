import fs from "node:fs";

function createIco(width, height, drawPixel) {
  // BITMAPINFOHEADER (40 bytes)
  const headerSize = 40;
  const imageSize = width * height * 4; // 32bpp BGRA
  const maskRowSize = Math.floor((width + 31) / 32) * 4;
  const maskSize = maskRowSize * height;
  const dibSize = headerSize + imageSize + maskSize;

  const dib = Buffer.alloc(dibSize);

  // biSize
  dib.writeUInt32LE(40, 0);
  // biWidth
  dib.writeInt32LE(width, 4);
  // biHeight (height * 2 for icon)
  dib.writeInt32LE(height * 2, 8);
  // biPlanes
  dib.writeUInt16LE(1, 12);
  // biBitCount
  dib.writeUInt16LE(32, 14);
  // biCompression (BI_RGB)
  dib.writeUInt32LE(0, 16);
  // biSizeImage
  dib.writeUInt32LE(imageSize + maskSize, 20);

  let offset = 40;
  // Draw pixels from bottom to top
  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawPixel(x, y, width, height);
      dib.writeUInt8(b, offset);
      dib.writeUInt8(g, offset + 1);
      dib.writeUInt8(r, offset + 2);
      dib.writeUInt8(a, offset + 3);
      offset += 4;
    }
  }

  // AND mask (all 0s because alpha channel in 32bpp handles transparency)
  dib.fill(0, offset, offset + maskSize);

  // ICONDIR (6 bytes) + ICONDIRENTRY (16 bytes)
  const icoHeader = Buffer.alloc(6 + 16);
  icoHeader.writeUInt16LE(0, 0); // reserved
  icoHeader.writeUInt16LE(1, 2); // type 1 = ICO
  icoHeader.writeUInt16LE(1, 4); // 1 image

  icoHeader.writeUInt8(width === 256 ? 0 : width, 6);
  icoHeader.writeUInt8(height === 256 ? 0 : height, 7);
  icoHeader.writeUInt8(0, 8); // color count
  icoHeader.writeUInt8(0, 9); // reserved
  icoHeader.writeUInt16LE(1, 10); // color planes
  icoHeader.writeUInt16LE(32, 12); // bits per pixel
  icoHeader.writeUInt32LE(dibSize, 14); // image size in bytes
  icoHeader.writeUInt32LE(22, 18); // offset to DIB header (6 + 16 = 22)

  return Buffer.concat([icoHeader, dib]);
}

// Design: Dark slate rounded card with white doc and teal AI spark badge
function tailorCvDrawer(x, y, w, h) {
  const nx = x / (w - 1);
  const ny = y / (h - 1);

  // Dark slate background with rounded corners
  const rad = 0.22;
  const dx = Math.max(0, Math.max(rad - nx, nx - (1 - rad)));
  const dy = Math.max(0, Math.max(rad - ny, ny - (1 - rad)));
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > rad) {
    return [0, 0, 0, 0]; // Transparent outside card
  }

  // Border check
  if (dist > rad - 0.05) {
    return [30, 41, 59, 255]; // Slate border #1e293b
  }

  // Badge check (bottom right circle: cx=0.72, cy=0.72, r=0.22)
  const bcx = 0.72,
    bcy = 0.72,
    br = 0.22;
  const bdist = Math.sqrt((nx - bcx) ** 2 + (ny - bcy) ** 2);
  if (bdist <= br) {
    if (bdist > br - 0.04) {
      return [15, 23, 42, 255]; // Badge ring
    }
    // Spark inside badge (star shape)
    const sx = Math.abs(nx - bcx);
    const sy = Math.abs(ny - bcy);
    if (
      sx + sy < 0.11 ||
      (sx < 0.035 && sy < 0.16) ||
      (sy < 0.035 && sx < 0.16)
    ) {
      return [255, 255, 255, 255]; // White spark
    }
    // Teal-cyan gradient badge
    return [45, 212, 191, 255]; // #2dd4bf Teal
  }

  // Document (white page)
  const docLeft = 0.22,
    docRight = 0.72,
    docTop = 0.12,
    docBottom = 0.88;
  if (nx >= docLeft && nx <= docRight && ny >= docTop && ny <= docBottom) {
    // Folded top-right corner
    if (nx > 0.54 && ny < 0.3) {
      if (nx - 0.54 + (0.3 - ny) > 0.18) {
        return [15, 23, 42, 255]; // Behind fold
      }
      return [148, 163, 184, 255]; // Fold color
    }

    // Content lines
    if (nx >= 0.32 && nx <= 0.62) {
      if (ny >= 0.38 && ny <= 0.42 && nx <= 0.52) return [100, 116, 139, 255]; // Header bar
      if (ny >= 0.48 && ny <= 0.51) return [203, 213, 225, 255]; // Line 1
      if (ny >= 0.56 && ny <= 0.59 && nx <= 0.58) return [203, 213, 225, 255]; // Line 2
      if (ny >= 0.64 && ny <= 0.67 && nx <= 0.5) return [203, 213, 225, 255]; // Line 3
    }

    return [248, 250, 252, 255]; // White document body
  }

  // Background gradient (slate-900 / #0f172a to #020617)
  const grad = Math.floor(15 - ny * 10);
  return [grad, grad + 8, grad + 24, 255];
}

const icoBuffer = createIco(32, 32, tailorCvDrawer);
fs.writeFileSync("public/favicon.ico", icoBuffer);
console.log(
  "Successfully generated public/favicon.ico (Size:",
  icoBuffer.length,
  "bytes)",
);
