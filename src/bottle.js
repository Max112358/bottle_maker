import * as THREE from "three";
import {
  glassRoughTex,
  glassBumpTex,
  corkTex,
  createPaperLabelTexture,
} from "./textures.js";

let glassMesh;
let liquidMesh;
let corkMesh;
let labelGroup;

export function buildBottle({ bottleGroup, state }) {
  const p = state.getValues();
  state.updateLabels(p);

  const rBase = p.baseD / 2;
  const rMid = p.middleD / 2;
  const rNeck = p.neckD / 2;
  const rNeckU = p.neckUpperD / 2;
  const rLip = p.lipD / 2;

  const y1 = p.middleH;
  const y2 = y1 + p.neckH;
  const y3 = y2 + p.neckUpperH;
  const y4 = y3 + p.lipH;

  const t = Math.min(
    p.wall,
    rBase * 0.95,
    rMid * 0.95,
    rNeck * 0.95,
    rNeckU * 0.95,
    rLip * 0.95,
  );

  const glassPoints = buildGlassProfile({
    rBase,
    rMid,
    rNeck,
    rNeckU,
    rLip,
    y1,
    y2,
    y3,
    y4,
    t,
  });
  const innerProfile = buildInnerProfile({
    rBase,
    rMid,
    rNeck,
    rNeckU,
    rLip,
    y1,
    y2,
    y3,
    y4,
    t,
  });

  clearBottle(bottleGroup);

  glassMesh = createGlassMesh(glassPoints, p.glassSegs);
  bottleGroup.add(glassMesh);

  if (p.showLabel) {
    labelGroup = createLabelGroup(p, rBase, rMid);
    bottleGroup.add(labelGroup);
  }

  liquidMesh = createLiquidMesh(p, innerProfile, y4);
  bottleGroup.add(liquidMesh);

  corkMesh = createCorkMesh(p, rLip, rNeckU, t, y4);
  bottleGroup.add(corkMesh);

  document.getElementById("triCount").textContent = estimateTris(p);
}

function buildGlassProfile({
  rBase,
  rMid,
  rNeck,
  rNeckU,
  rLip,
  y1,
  y2,
  y3,
  y4,
  t,
}) {
  return [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(rBase, 0),
    new THREE.Vector2(rMid, y1),
    new THREE.Vector2(rNeck, y2),
    new THREE.Vector2(rNeckU, y3),
    new THREE.Vector2(rLip, y4),
    new THREE.Vector2(Math.max(rLip - t, 0), y4),
    new THREE.Vector2(Math.max(rNeckU - t, 0), y3),
    new THREE.Vector2(Math.max(rNeck - t, 0), y2),
    new THREE.Vector2(Math.max(rMid - t, 0), y1),
    new THREE.Vector2(Math.max(rBase - t, 0), t),
    new THREE.Vector2(0, t),
    new THREE.Vector2(0, 0),
  ];
}

function buildInnerProfile({
  rBase,
  rMid,
  rNeck,
  rNeckU,
  rLip,
  y1,
  y2,
  y3,
  y4,
  t,
}) {
  return [
    new THREE.Vector2(0, t),
    new THREE.Vector2(Math.max(rBase - t, 0), t),
    new THREE.Vector2(Math.max(rMid - t, 0), y1),
    new THREE.Vector2(Math.max(rNeck - t, 0), y2),
    new THREE.Vector2(Math.max(rNeckU - t, 0), y3),
    new THREE.Vector2(Math.max(rLip - t, 0), y4),
  ];
}

function clearBottle(bottleGroup) {
  [glassMesh, liquidMesh, corkMesh].forEach((mesh) => {
    if (mesh) {
      mesh.geometry.dispose();
      bottleGroup.remove(mesh);
    }
  });

  if (labelGroup) {
    labelGroup.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (child.material.map) child.material.map.dispose();
        child.material.dispose();
      }
    });
    bottleGroup.remove(labelGroup);
    labelGroup = null;
  }
}

function createGlassMesh(glassPoints, segments) {
  const geometry = new THREE.LatheGeometry(glassPoints, segments);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.1,
    roughness: 0.15,
    roughnessMap: glassRoughTex,
    transmission: 1.0,
    ior: 1.52,
    thickness: 0.2,
    dispersion: 2.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    iridescence: 0.15,
    iridescenceIOR: 1.3,
    envMapIntensity: 3.5,
    bumpMap: glassBumpTex,
    bumpScale: 0.008,
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.renderOrder = 2;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function createLabelGroup(p, rBase, rMid) {
  const group = new THREE.Group();
  const labelH = Math.min(p.labelH, p.middleH * 0.95);
  const labelYCenter = p.middleH / 2;

  const yTop = labelYCenter + labelH / 2;
  const yBottom = labelYCenter - labelH / 2;

  const tTop = Math.max(0, Math.min(1, yTop / (p.middleH || 1)));
  const tBot = Math.max(0, Math.min(1, yBottom / (p.middleH || 1)));

  const labelOffset = 0.06;
  const radiusTop = rBase + (rMid - rBase) * tTop + labelOffset;
  const radiusBottom = rBase + (rMid - rBase) * tBot + labelOffset;

  const bottleSegs = Math.max(3, p.glassSegs);
  const faceSpan = (Math.PI * 2) / bottleSegs;

  const faces = Math.max(1, Math.min(p.labelSegs, bottleSegs));
  const thetaLength = faces * faceSpan;

  const thetaCenter = nearestFaceCenterAngle(bottleSegs);
  const thetaStart = thetaCenter - thetaLength / 2;

  const labelTex = createPaperLabelTexture(
    p.labelText,
    p.labelFont,
    p.labelFontSize,
    labelH,
    radiusTop,
    radiusBottom,
    thetaLength,
  );

  const frontMat = new THREE.MeshStandardMaterial({
    map: labelTex,
    roughness: 0.9,
    metalness: 0.0,
    side: THREE.FrontSide,
    flatShading: true,
    depthWrite: true,
  });

  const backMat = new THREE.MeshStandardMaterial({
    color: 0xba9363,
    roughness: 0.95,
    metalness: 0.0,
    side: THREE.BackSide,
    flatShading: true,
    depthWrite: true,
  });

  const geometry = new THREE.CylinderGeometry(
    radiusTop,
    radiusBottom,
    labelH,
    faces,
    1,
    true,
    thetaStart,
    thetaLength,
  );

  group.add(new THREE.Mesh(geometry, frontMat));
  group.add(new THREE.Mesh(geometry, backMat));

  group.position.y = labelYCenter;
  group.renderOrder = 3;
  return group;
}

function createLiquidMesh(p, innerProfile, y4) {
  const eps = 0.05;
  const liquidBottom = tFromProfile(innerProfile) + eps;
  const liquidTop = Math.min(liquidBottom + p.liquidH, y4);

  const points = [new THREE.Vector2(0, liquidBottom)];
  const yStep = Math.max(0.5, (liquidTop - liquidBottom) / p.liquidRings);

  for (let y = liquidBottom; y <= liquidTop; y += yStep) {
    const r = Math.max(innerRadiusAtY(y, innerProfile) - 0.15, 0);
    points.push(new THREE.Vector2(r, y));
  }

  const topR = Math.max(innerRadiusAtY(liquidTop, innerProfile) - 0.15, 0);
  points.push(new THREE.Vector2(topR, liquidTop));
  points.push(new THREE.Vector2(0, liquidTop));

  const geometry = new THREE.LatheGeometry(points, p.liquidSegs);
  const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(p.liquidColor),
    metalness: 0.05,
    roughness: 0.2,
    transparent: true,
    opacity: p.liquidOpacity,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.renderOrder = 1;
  return mesh;
}

function createCorkMesh(p, rLip, rNeckU, wallThickness, lipTopY) {
  const innerLipR = Math.max(rLip - wallThickness, 0.1);
  const innerNeckR = Math.max(rNeckU - wallThickness, 0.1);

  const corkTopR = innerLipR * 1.3;
  const corkBottomR = innerNeckR * 0.95;
  const corkH = Math.max(p.lipH * 3.0, 8);

  const corkBottomY = lipTopY - corkH * 0.65;
  const corkTopY = corkBottomY + corkH;

  const points = [];
  const segments = p.corkRings;
  for (let i = 0; i <= segments; i++) {
    const v = i / segments;
    const radius = corkBottomR + (corkTopR - corkBottomR) * v;
    const profileR = i === segments ? radius * 0.92 : radius;
    const yPos = corkBottomY + (corkTopY - corkBottomY) * v;
    points.push(new THREE.Vector2(profileR, yPos));
  }
  points.push(new THREE.Vector2(0, corkTopY));

  const geometry = new THREE.LatheGeometry(points, p.corkSegs);
  const material = new THREE.MeshStandardMaterial({
    map: corkTex,
    bumpMap: corkTex,
    bumpScale: 0.08,
    roughness: 1.0,
    metalness: 0.05,
    color: 0xddbb99,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.renderOrder = 3;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function tFromProfile(innerProfile) {
  return innerProfile[0].y;
}

function innerRadiusAtY(y, profile) {
  if (y <= profile[0].y) return profile[0].x;
  if (y >= profile[profile.length - 1].y) return profile[profile.length - 1].x;

  for (let i = 0; i < profile.length - 1; i++) {
    const a = profile[i];
    const b = profile[i + 1];
    if (y >= a.y && y <= b.y) {
      const t = (y - a.y) / (b.y - a.y || 1);
      return a.x + (b.x - a.x) * t;
    }
  }
  return 0;
}

function nearestFaceCenterAngle(segments, targetAngle = Math.PI / 2) {
  const span = (Math.PI * 2) / Math.max(3, segments);
  const k = Math.round((targetAngle - span / 2) / span);
  return k * span + span / 2;
}

function countLatheTris(points, radialSegs) {
  const rings = points.length - 1;
  return (rings - 1) * radialSegs * 2;
}

function estimateTris(p) {
  const glassRings = 11;
  const liquidRings = p.liquidRings + 2;
  let total = countLatheTris(new Array(glassRings).fill(0), p.glassSegs);
  total += countLatheTris(new Array(liquidRings).fill(0), p.liquidSegs);

  if (p.showLabel) {
    const bottleSegs = Math.max(3, p.glassSegs);
    const faces = Math.max(1, Math.min(p.labelSegs, bottleSegs));
    total += faces * 4;
  }

  total += countLatheTris(new Array(p.corkRings + 2).fill(0), p.corkSegs);
  return Math.round(total);
}
