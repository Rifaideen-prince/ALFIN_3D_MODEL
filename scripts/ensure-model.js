import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modelPath = path.resolve(__dirname, '../public/models/WIND_TURBINE.stl');
const lfsMediaUrl = 'https://media.githubusercontent.com/media/Rifaideen-prince/ALFIN_3D_MODEL/main/public/models/WIND_TURBINE.stl';

async function ensureModel() {
  const dir = path.dirname(modelPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let needsDownload = false;

  if (!fs.existsSync(modelPath)) {
    console.log('[ensure-model] WIND_TURBINE.stl does not exist. Downloading...');
    needsDownload = true;
  } else {
    const stats = fs.statSync(modelPath);
    if (stats.size < 1024 * 1024) { // Less than 1MB is an LFS pointer
      console.log(`[ensure-model] WIND_TURBINE.stl is an LFS pointer (${stats.size} bytes). Downloading actual binary...`);
      needsDownload = true;
    } else {
      console.log(`[ensure-model] WIND_TURBINE.stl already present (${(stats.size / 1024 / 1024).toFixed(2)} MB).`);
    }
  }

  if (needsDownload) {
    console.log(`[ensure-model] Fetching from ${lfsMediaUrl}...`);
    const res = await fetch(lfsMediaUrl);
    if (!res.ok) {
      console.error(`[ensure-model] Failed to download: HTTP ${res.status} ${res.statusText}`);
      return;
    }
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(modelPath, Buffer.from(buffer));
    console.log(`[ensure-model] Downloaded and saved (${(buffer.byteLength / 1024 / 1024).toFixed(2)} MB).`);
  }
}

ensureModel().catch((err) => {
  console.error('[ensure-model] Error:', err);
  // Do not crash build if offline; client-side resolver will handle it
});
