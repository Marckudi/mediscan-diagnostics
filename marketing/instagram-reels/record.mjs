/* Graba cada Reel HTML a MP4 vertical (1080×1920) listo para Instagram.
   Usa Playwright (Chromium) para capturar la animación y ffmpeg para
   transcodificar a H.264 + pista de audio silenciosa.

   Uso:  node record.mjs [reel-1 reel-2 ...]   (por defecto: los tres)
*/
import { chromium } from 'playwright-core';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, readdirSync, renameSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dir, 'src');
const DIST = join(__dir, 'dist');
const TMP = join(__dir, '.rec-tmp');

const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const FFMPEG = ffmpegInstaller.path;   // ffmpeg completo (libx264 + aac) desde npm
const W = 1080, H = 1920, FPS = 30;

const reels = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['reel-1', 'reel-2', 'reel-3'];

mkdirSync(DIST, { recursive: true });

async function recordOne(name) {
  rmSync(TMP, { recursive: true, force: true });
  mkdirSync(TMP, { recursive: true });

  const browser = await chromium.launch({
    executablePath: CHROME,
    args: ['--no-sandbox', '--force-color-profile=srgb', '--disable-gpu'],
  });
  const context = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 1,
    recordVideo: { dir: TMP, size: { width: W, height: H } },
  });
  const page = await context.newPage();
  const url = pathToFileURL(join(SRC, `${name}.html`)).href + '?record=1';
  await page.goto(url, { waitUntil: 'load' });

  // Espera a que fuentes + reel estén listos
  await page.waitForFunction(() => window.__REEL_TOTAL > 0, null, { timeout: 15000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);          // colchón inicial (intro de marca)

  const total = await page.evaluate(() => window.__REEL_TOTAL);
  await page.evaluate(() => window.__reelPlay());
  await page.waitForFunction(() => window.__REEL_DONE === true, null, { timeout: total + 8000 });
  await page.waitForTimeout(500);          // colchón final (mantiene CTA)

  const video = page.video();
  await context.close();                   // finaliza el webm
  await browser.close();
  const webm = await video.path();

  const out = join(DIST, `astramedical-${name}.mp4`);
  const ff = spawnSync(FFMPEG, [
    '-y',
    '-i', webm,
    '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
    '-shortest',
    '-vf', `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},format=yuv420p,fps=${FPS}`,
    '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-crf', '18',
    '-c:a', 'aac', '-b:a', '128k',
    '-movflags', '+faststart',
    out,
  ], { encoding: 'utf8' });
  if (ff.status !== 0) {
    console.error(ff.stderr?.slice(-1200));
    throw new Error(`ffmpeg falló en ${name}`);
  }
  rmSync(TMP, { recursive: true, force: true });
  return out;
}

for (const name of reels) {
  if (!existsSync(join(SRC, `${name}.html`))) { console.error(`✗ no existe ${name}.html`); continue; }
  process.stdout.write(`▶ grabando ${name} … `);
  const out = await recordOne(name);
  const size = readdirSync(DIST).length;
  console.log(`✓ ${out}`);
}
console.log('Listo.');
