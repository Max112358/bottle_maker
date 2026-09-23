export function hash(x, y) {
  let s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

export function fbm(x, y, octaves) {
  let v = 0;
  let a = 0.5;
  let f = 1.0;
  for (let i = 0; i < octaves; i++) {
    const ix = Math.floor(x * f);
    const iy = Math.floor(y * f);
    const fx = x * f - ix;
    const fy = y * f - iy;
    const u = fx * fx * (3 - 2 * fx);
    const w = fy * fy * (3 - 2 * fy);

    const n = (a, b) => a + (b - a) * w;
    v +=
      a *
      n(
        n(hash(ix, iy), hash(ix, iy + 1)),
        n(hash(ix + 1, iy), hash(ix + 1, iy + 1)),
      );
    a *= 0.5;
    f *= 2;
  }
  return v;
}

export function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
