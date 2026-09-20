import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SOURCE_IMAGE = "C:/Users/brent/.gemini/antigravity-ide/brain/b5c7b326-1a5b-46ad-9cee-4f1398896776/.user_uploaded/media_1789897701594.png";
const PUBLIC_BRAND_DIR = path.resolve(process.cwd(), "public/brand");
const APP_DIR = path.resolve(process.cwd(), "src/app");

async function main() {
  console.log("Reading source logo image...");
  if (!fs.existsSync(SOURCE_IMAGE)) {
    throw new Error(`Source image not found at ${SOURCE_IMAGE}`);
  }

  fs.mkdirSync(PUBLIC_BRAND_DIR, { recursive: true });

  // 1. Copy original full asset
  fs.copyFileSync(SOURCE_IMAGE, path.join(PUBLIC_BRAND_DIR, "logo-original.png"));
  console.log("Saved original to public/brand/logo-original.png");

  // 2. Crop tightly to squircle boundary: (left: 107, top: 76, width: 286, height: 286)
  const croppedBuffer = await sharp(SOURCE_IMAGE)
    .extract({ left: 107, top: 76, width: 286, height: 286 })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();

  // Save main logo.png
  fs.writeFileSync(path.join(PUBLIC_BRAND_DIR, "logo.png"), croppedBuffer);
  console.log("Saved cropped master logo to public/brand/logo.png (286x286)");

  // Save src/app/icon.png & src/app/apple-icon.png for Next.js App Router metadata conventions
  fs.writeFileSync(path.join(APP_DIR, "icon.png"), croppedBuffer);
  fs.writeFileSync(path.join(APP_DIR, "apple-icon.png"), croppedBuffer);
  console.log("Saved src/app/icon.png and src/app/apple-icon.png");

  // 3. Generate standard sizes: 512x512, 192x192, 64x64, 32x32, 16x16
  const sizes = [
    { name: "logo-512.png", size: 512 },
    { name: "logo-192.png", size: 192 },
    { name: "logo-64.png", size: 64 },
    { name: "logo-32.png", size: 32 },
    { name: "logo-16.png", size: 16 },
  ];

  for (const { name, size } of sizes) {
    const resized = await sharp(croppedBuffer)
      .resize(size, size, {
        kernel: sharp.kernel.lanczos3,
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png({ compressionLevel: 9 })
      .toFile(path.join(PUBLIC_BRAND_DIR, name));
    console.log(`Generated public/brand/${name} (${size}x${size}, ${resized.size} bytes)`);
  }

  // 4. Generate multi-resolution ICO file for src/app/favicon.ico and public/favicon.ico
  // An ICO file can contain multiple PNG images (e.g. 16x16, 32x32, 48x48)
  const icoSizes = [16, 32, 48];
  const pngBuffers: { size: number; buffer: Buffer }[] = [];

  for (const s of icoSizes) {
    const buf = await sharp(croppedBuffer)
      .resize(s, s, {
        kernel: sharp.kernel.lanczos3,
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();
    pngBuffers.push({ size: s, buffer: buf });
  }

  // Construct standard ICO header and directory
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = ICO
  header.writeUInt16LE(count, 4); // count of images

  let currentOffset = 6 + count * 16;
  const directoryEntries: Buffer[] = [];
  const imageBuffers: Buffer[] = [];

  for (const item of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(item.size >= 256 ? 0 : item.size, 0); // width
    entry.writeUInt8(item.size >= 256 ? 0 : item.size, 1); // height
    entry.writeUInt8(0, 2); // color palette count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(item.buffer.length, 8); // size of image data
    entry.writeUInt32LE(currentOffset, 12); // offset of image data
    directoryEntries.push(entry);
    imageBuffers.push(item.buffer);
    currentOffset += item.buffer.length;
  }

  const icoBuffer = Buffer.concat([header, ...directoryEntries, ...imageBuffers]);
  fs.writeFileSync(path.join(APP_DIR, "favicon.ico"), icoBuffer);
  fs.writeFileSync(path.join(process.cwd(), "public/favicon.ico"), icoBuffer);
  console.log("Saved multi-res favicon.ico to src/app/favicon.ico and public/favicon.ico");

  console.log("All brand assets successfully generated!");
}

main().catch((err) => {
  console.error("Error generating brand assets:", err);
  process.exit(1);
});
