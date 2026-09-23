import * as THREE from "three";
import { fbm } from "./utils.js";

export function createGlassRoughnessTexture() {
  const w = 1024;
  const h = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  const img = ctx.createImageData(w, h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const n = fbm(x * 0.015, y * 0.015, 4);
      const smudge = Math.sin(x * 0.01) * Math.cos(y * 0.01) * 0.5 + 0.5;
      let v = 15 + n * 35 + smudge * 20;
      v = Math.max(0, Math.min(255, v));
      const i = (y * w + x) * 4;
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 4);
  return tex;
}

export function createGlassBumpTexture() {
  const w = 1024;
  const h = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  const img = ctx.createImageData(w, h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const fine = fbm(x * 0.05, y * 0.05, 3);
      const streaks =
        Math.sin(x * 0.03 + fbm(x * 0.01, y * 0.01, 2) * 4) * 0.5 + 0.5;
      let v = 128 + (fine - 0.5) * 8 + (streaks - 0.5) * 12;
      v = Math.max(0, Math.min(255, v));
      const i = (y * w + x) * 4;
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 4);
  tex.colorSpace = THREE.NoColorSpace;
  return tex;
}

export function createCorkTexture() {
  const w = 1024;
  const h = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#a07040";
  ctx.fillRect(0, 0, w, h);

  const img = ctx.getImageData(0, 0, w, h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const n = fbm(x * 0.08, y * 0.08, 5);
      const grain = (n - 0.5) * 40;
      img.data[i] = Math.max(0, Math.min(255, img.data[i] + grain));
      img.data[i + 1] = Math.max(
        0,
        Math.min(255, img.data[i + 1] + grain * 0.85),
      );
      img.data[i + 2] = Math.max(
        0,
        Math.min(255, img.data[i + 2] + grain * 0.7),
      );
    }
  }

  for (let k = 0; k < 8000; k++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const r = 1 + Math.random() * 4;
    const c = [40, 25, 10];
    const a = 0.4 + Math.random() * 0.5;

    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const px = Math.floor(x + dx);
        const py = Math.floor(y + dy);
        if (px < 0 || px >= w || py < 0 || py >= h) continue;
        const d2 = dx * dx + dy * dy;
        if (d2 > r * r) continue;
        const i = (py * w + px) * 4;
        const mix = (1 - d2 / (r * r)) * a;
        img.data[i] = img.data[i] * (1 - mix) + c[0] * mix;
        img.data[i + 1] = img.data[i + 1] * (1 - mix) + c[1] * mix;
        img.data[i + 2] = img.data[i + 2] * (1 - mix) + c[2] * mix;
      }
    }
  }

  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 2);
  return tex;
}

export function createPaperLabelTexture(
  text,
  font,
  fontSize,
  labelH,
  radiusTop,
  radiusBottom,
  thetaLength,
) {
  const avgRadius = (radiusTop + radiusBottom) / 2;
  const arcLength = avgRadius * thetaLength;

  const pxPerMm = 12;
  let texW = Math.max(64, Math.round(arcLength * pxPerMm));
  let texH = Math.max(32, Math.round(labelH * pxPerMm));

  const MAX_TEX = 2048;
  const scale = Math.min(1, MAX_TEX / Math.max(texW, texH));
  texW = Math.max(1, Math.round(texW * scale));
  texH = Math.max(1, Math.round(texH * scale));

  const canvas = document.createElement("canvas");
  canvas.width = texW;
  canvas.height = texH;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#c19a6b";
  ctx.fillRect(0, 0, texW, texH);

  const img = ctx.getImageData(0, 0, texW, texH);
  for (let i = 0; i < img.data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 25;
    img.data[i] = Math.max(0, Math.min(255, img.data[i] + noise));
    img.data[i + 1] = Math.max(0, Math.min(255, img.data[i + 1] + noise - 5));
    img.data[i + 2] = Math.max(0, Math.min(255, img.data[i + 2] + noise - 10));
  }
  ctx.putImageData(img, 0, 0);

  const grad = ctx.createRadialGradient(
    texW / 2,
    texH / 2,
    texH / 3,
    texW / 2,
    texH / 2,
    Math.max(texW, texH) / 1.8,
  );
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(50,30,10,0.7)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, texW, texH);

  const marginX = Math.max(8, texW * 0.04);
  const marginY = Math.max(8, texH * 0.08);
  ctx.strokeStyle = "rgba(50, 30, 20, 0.8)";
  ctx.lineWidth = Math.max(2, texH * 0.012);
  ctx.strokeRect(marginX, marginY, texW - marginX * 2, texH - marginY * 2);
  ctx.lineWidth = Math.max(1, texH * 0.004);
  ctx.strokeRect(
    marginX + texH * 0.01,
    marginY + texH * 0.01,
    texW - (marginX + texH * 0.01) * 2,
    texH - (marginY + texH * 0.01) * 2,
  );

  ctx.fillStyle = "#1c1511";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const availWidth = texW - marginX * 2;
  const targetHeight = Math.min(texH * 0.92, fontSize * 0.1 * pxPerMm);

  let currentSize = Math.max(10, targetHeight);
  ctx.font = `bold ${currentSize}px ${font}`;

  while (ctx.measureText(text).width > availWidth && currentSize > 10) {
    currentSize = Math.max(10, currentSize - Math.max(1, currentSize * 0.03));
    ctx.font = `bold ${currentSize}px ${font}`;
  }

  ctx.fillText(text, texW / 2, texH / 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  return tex;
}

export const glassRoughTex = createGlassRoughnessTexture();
export const glassBumpTex = createGlassBumpTexture();
export const corkTex = createCorkTexture();
