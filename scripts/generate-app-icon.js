#!/usr/bin/env node
/**
 * Generate platform app icons from assets/icon-full-size.png.
 *
 * Input:  assets/icon-full-size.png (square PNG, ideally 1024×1024+)
 * Output: resources/icon.png, icon-256.png, icon-1024.png, icon.ico, icon.icns (macOS)
 *         src/renderer/public/favicon.png
 *         (all outputs clipped with subtle rounded corners)
 *
 * Usage: yarn generate:icons
 */

import { execSync } from "child_process";
import { existsSync, mkdirSync, rmSync, statSync, writeFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import pngToIco from "png-to-ico";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SOURCE = join(ROOT, "assets", "icon-full-size.png");
const RESOURCES_DIR = join(ROOT, "resources");
const PUBLIC_DIR = join(ROOT, "src", "renderer", "public");

const RESOURCE_PNGS = [
  { file: "icon.png", size: 512 },
  { file: "icon-256.png", size: 256 },
  { file: "icon-1024.png", size: 1024 },
];

/** Apple iconset entries for iconutil (macOS). */
const MAC_ICONSET = [
  { file: "icon_16x16.png", size: 16 },
  { file: "icon_16x16@2x.png", size: 32 },
  { file: "icon_32x32.png", size: 32 },
  { file: "icon_32x32@2x.png", size: 64 },
  { file: "icon_128x128.png", size: 128 },
  { file: "icon_128x128@2x.png", size: 256 },
  { file: "icon_256x256.png", size: 256 },
  { file: "icon_256x256@2x.png", size: 512 },
  { file: "icon_512x512.png", size: 512 },
  { file: "icon_512x512@2x.png", size: 1024 },
];

/** Corner radius as a fraction of icon size (squircle was ~22%+ and looked too round). */
const ICON_CORNER_RADIUS_RATIO = 0.2;

function createAppIconMaskSvg(size) {
  const radius = Math.max(1, Math.round(size * ICON_CORNER_RADIUS_RATIO));
  return Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="white"/>
    </svg>`
  );
}

async function resizeToPng(input, outputPath, size) {
  const resized = await sharp(input)
    .ensureAlpha()
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  await sharp(resized)
    .composite([{ input: createAppIconMaskSvg(size), blend: "dest-in" }])
    .png()
    .toFile(outputPath);
}

async function generatePngs() {
  console.log("[generate-app-icon] PNG outputs");

  for (const { file, size } of RESOURCE_PNGS) {
    const outputPath = join(RESOURCES_DIR, file);
    await resizeToPng(SOURCE, outputPath, size);
    console.log(`  ✓ resources/${file} (${size}px)`);
  }

  const faviconPath = join(PUBLIC_DIR, "favicon.png");
  await resizeToPng(SOURCE, faviconPath, 32);
  console.log("  ✓ src/renderer/public/favicon.png (32px)");
}

async function generateIco() {
  console.log("[generate-app-icon] Windows icon.ico");

  const square1024 = join(RESOURCES_DIR, "icon-1024.png");
  const ico = await pngToIco(square1024);
  writeFileSync(join(RESOURCES_DIR, "icon.ico"), ico);
  console.log("  ✓ resources/icon.ico (16, 32, 48, 256px)");
}

async function generateIcns() {
  console.log("[generate-app-icon] macOS icon.icns");

  const iconsetDir = join(RESOURCES_DIR, "icon.iconset");
  if (existsSync(iconsetDir)) {
    rmSync(iconsetDir, { recursive: true });
  }
  mkdirSync(iconsetDir, { recursive: true });

  for (const { file, size } of MAC_ICONSET) {
    await resizeToPng(SOURCE, join(iconsetDir, file), size);
  }

  if (process.platform !== "darwin") {
    console.warn("  ⊘ icon.icns skipped (iconutil requires macOS)");
    console.warn(
      "    Kept resources/icon.iconset — run this script on a Mac to produce .icns"
    );
    return;
  }

  const icnsPath = join(RESOURCES_DIR, "icon.icns");
  try {
    execSync(`iconutil -c icns "${iconsetDir}" -o "${icnsPath}"`, {
      stdio: "pipe",
    });
    rmSync(iconsetDir, { recursive: true });
    console.log("  ✓ resources/icon.icns");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("  ✗ iconutil failed:", message);
    console.error("    Kept resources/icon.iconset — retry manually:");
    console.error(`    iconutil -c icns "${iconsetDir}" -o "${icnsPath}"`);
  }
}

const OUTPUT_MARKERS = [
  join(RESOURCES_DIR, "icon.icns"),
  join(RESOURCES_DIR, "icon.png"),
  join(PUBLIC_DIR, "favicon.png"),
];

function iconsNeedRegeneration() {
  if (!existsSync(SOURCE)) return false;

  const existingOutputs = OUTPUT_MARKERS.filter((path) => existsSync(path));
  if (existingOutputs.length === 0) return true;

  const sourceMtime = statSync(SOURCE).mtimeMs;
  return existingOutputs.some((path) => sourceMtime > statSync(path).mtimeMs);
}

/**
 * @param {{ force?: boolean, strict?: boolean }} [options]
 * - force: regenerate even when outputs are up to date
 * - strict: exit process on missing source or failure (CLI mode)
 */
export async function generateAppIcons(options = {}) {
  const { force = false, strict = false } = options;

  if (!existsSync(SOURCE)) {
    const message = `Source not found: ${SOURCE}`;
    if (strict) {
      console.error(`[generate-app-icon] ${message}`);
      console.error(
        "Add a square PNG at assets/icon-full-size.png (1024×1024 recommended)."
      );
      process.exit(1);
    }
    console.warn(`[generate-app-icon] Skip — ${message}`);
    return { ok: false, skipped: true, reason: "no-source" };
  }

  if (!force && !iconsNeedRegeneration()) {
    console.log("[generate-app-icon] Up to date — skip");
    return { ok: true, skipped: true, reason: "up-to-date" };
  }

  const metadata = await sharp(SOURCE).metadata();
  if (!metadata.width || !metadata.height) {
    const message = "Could not read image dimensions.";
    if (strict) {
      console.error(`[generate-app-icon] ${message}`);
      process.exit(1);
    }
    console.warn(`[generate-app-icon] Skip — ${message}`);
    return { ok: false, skipped: true, reason: "invalid-source" };
  }

  if (metadata.width !== metadata.height) {
    console.warn(
      `[generate-app-icon] Source is ${metadata.width}×${metadata.height} (not square); outputs letterbox with transparency.`
    );
  }

  mkdirSync(RESOURCES_DIR, { recursive: true });
  mkdirSync(PUBLIC_DIR, { recursive: true });

  await generatePngs();
  await generateIcns();
  await generateIco();

  console.log("[generate-app-icon] Done.");
  return { ok: true, skipped: false };
}

const isDirectRun =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  const force = process.argv.includes("--force");
  generateAppIcons({ force, strict: true }).catch((error) => {
    console.error("[generate-app-icon] Failed:", error);
    process.exit(1);
  });
}
