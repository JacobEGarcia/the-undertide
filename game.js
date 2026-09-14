// THE UNDERTIDE v6 - a small thing in a house of eaters.
// A 3D spiritual sequel in the spirit of Little Nightmares: oversized world,
// a child alone, grotesque adults, hunger, hiding, dread. three.js, no dialogue.
import * as THREE from './three.module.js';

// ---------------- renderer / scene ----------------
const LOWSPEC = new URLSearchParams(location.search).has('lowspec');
const renderer = new THREE.WebGLRenderer({ antialias: !LOWSPEC });
renderer.setPixelRatio(LOWSPEC ? 1 : Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = !LOWSPEC;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050f0c);
scene.fog = new THREE.FogExp2(0x050f0c, 0.022);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(-4, 3.4, 10.5);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---------------- lights ----------------
scene.add(new THREE.HemisphereLight(0x2e4636, 0x050a07, 0.95));
const moon = new THREE.DirectionalLight(0x9db87c, 0.8);
moon.position.set(6, 14, 7);
moon.castShadow = true;
moon.shadow.mapSize.set(1024, 1024);
moon.shadow.camera.left = -20; moon.shadow.camera.right = 20;
moon.shadow.camera.top = 20; moon.shadow.camera.bottom = -10;
scene.add(moon);

// hanging caged lamps: sickly amber, they swing and flicker
const lamps = [];
function addLamp(x, y, z) {
  const g = new THREE.Group();
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.4), matDark);
  cord.position.y = 1.2; g.add(cord);
  const cage = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), new THREE.MeshStandardMaterial({ color: 0x2a2118, roughness: 0.9, wireframe: true }));
  g.add(cage);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), new THREE.MeshStandardMaterial({ color: 0xffc873, emissive: 0xffb84d, emissiveIntensity: 2.2 }));
  g.add(bulb);
  const pt = new THREE.PointLight(0xffc573, 22, 16, 1.7);
  g.add(pt);
  g.position.set(x, y, z);
  g.userData.phase = Math.random() * 10;
  g.userData.base = 22;
  scene.add(g);
  lamps.push(g);
  return g;
}

// ---------------- materials ----------------
const matDark = new THREE.MeshStandardMaterial({ color: 0x141a15, roughness: 0.95 });
const matFloor = new THREE.MeshStandardMaterial({ color: 0x27332a, roughness: 0.92 });
const matWood = new THREE.MeshStandardMaterial({ color: 0x3a2f21, roughness: 0.85 });
const matWoodPale = new THREE.MeshStandardMaterial({ color: 0x5c4a2e, roughness: 0.8 });
const matWall = new THREE.MeshStandardMaterial({ color: 0x22302a, roughness: 0.95 });
const matIron = new THREE.MeshStandardMaterial({ color: 0x23282a, roughness: 0.6, metalness: 0.6 });
const matCoat = new THREE.MeshStandardMaterial({ color: 0x9a6b1f, roughness: 0.85 });
const matSkin = new THREE.MeshStandardMaterial({ color: 0xd8b48a, roughness: 0.7 });
const matPale = new THREE.MeshStandardMaterial({ color: 0xd8cfbc, roughness: 0.6 });
const matApron = new THREE.MeshStandardMaterial({ color: 0x191512, roughness: 0.95 });
const matMorsel = new THREE.MeshStandardMaterial({ color: 0xa8742c, roughness: 0.7, emissive: 0x6a4210, emissiveIntensity: 0.7 });

// ---------------- collision world ----------------
const platforms = []; // {x0,x1,z0,z1,y} walkable tops
const blockers = [];  // {x0,x1,z0,z1,top} push-out boxes
const GAP = { x0: 23.5, x1: 25.5 }; // open floor grate - fall and the dark takes you

function surfaceAt(x, z, refY = Infinity) {
  // highest walkable top at (x,z) that is not above refY
  let g = ((x > GAP.x0 && x < GAP.x1) || (x > 67 && x < 94)) ? -1e9 : 0;
  for (const p of platforms) {
    if (x >= p.x0 && x <= p.x1 && z >= p.z0 && z <= p.z1 && p.y > g && p.y <= refY) g = p.y;
  }
  return g;
}

function addPlatform(x0, x1, z0, z1, y) { platforms.push({ x0, x1, z0, z1, y }); }
function addBlocker(x0, x1, z0, z1, top) { blockers.push({ x0, x1, z0, z1, top }); }

function solidBox(cx, cy, cz, sx, sy, sz, mat, opts = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat);
  m.position.set(cx, cy, cz);
  m.castShadow = opts.cast !== false; m.receiveShadow = true;
  scene.add(m);
  if (opts.platform) addPlatform(cx - sx / 2, cx + sx / 2, cz - sz / 2, cz + sz / 2, cy + sy / 2);
  if (opts.blocker) addBlocker(cx - sx / 2, cx + sx / 2, cz - sz / 2, cz + sz / 2, cy + sy / 2);
  return m;
}

// ---------------- level: THE GALLEY ----------------
const ZMIN = -2.4, ZMAX = 2.0;

// floor (with the grate gap) + back wall + dressing
{
  const f1 = new THREE.Mesh(new THREE.BoxGeometry(33.5, 0.5, 8), matFloor);
  f1.position.set((-10 + GAP.x0) / 2, -0.25, 0); f1.receiveShadow = true; scene.add(f1);
  const f2 = new THREE.Mesh(new THREE.BoxGeometry(22.5, 0.5, 8), matFloor);
  f2.position.set((GAP.x1 + 48) / 2, -0.25, 0); f2.receiveShadow = true; scene.add(f2);
  // grate rims
  solidBox(GAP.x0 - 0.1, 0.05, 0, 0.3, 0.14, 8, matIron, { cast: false });
  solidBox(GAP.x1 + 0.1, 0.05, 0, 0.3, 0.14, 8, matIron, { cast: false });
  // void glow under the grate
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(GAP.x1 - GAP.x0, 8), new THREE.MeshBasicMaterial({ color: 0x0d2a1e }));
  glow.rotation.x = -Math.PI / 2; glow.position.set((GAP.x0 + GAP.x1) / 2, -3.4, 0); scene.add(glow);

  const wall = new THREE.Mesh(new THREE.BoxGeometry(70, 14, 0.6), matWall);
  wall.position.set(19, 6.5, -3.4); wall.receiveShadow = true; scene.add(wall);
  // wall panels
  for (let x = -8; x < 46; x += 4) {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(3.4, 5.5, 0.15), matWood);
    panel.position.set(x, 2.75, -3.05); panel.receiveShadow = true; scene.add(panel);
  }
  // pipes along the wall
  for (const y of [5.2, 6.1]) {
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 60), matIron);
    pipe.rotation.z = Math.PI / 2; pipe.position.set(19, y, -2.9); scene.add(pipe);
  }
  // hanging hooks
  for (const x of [3, 7.5, 19, 31, 36]) {
    const hook = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.05, 6, 12, Math.PI * 1.3), matIron);
    hook.position.set(x, 4.6, -1.8); hook.rotation.z = Math.PI; scene.add(hook);
    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.6), matIron);
    chain.position.set(x, 5.6, -1.8); scene.add(chain);
  }
  // background silhouettes: barrels, stacked sacks
  for (const [x, r, h] of [[-6, 1.1, 2.2], [16.8, 1.3, 2.6], [33, 1.2, 2.4], [41, 1.4, 2.8]]) {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.08, h, 10), matWood);
    b.position.set(x, h / 2, -5.2); scene.add(b);
  }
  // end wall behind hatch
  const endwall = new THREE.Mesh(new THREE.BoxGeometry(0.8, 14, 10), matWall);
  endwall.position.set(44.5, 6.5, 0); scene.add(endwall);
  const startwall = new THREE.Mesh(new THREE.BoxGeometry(0.8, 14, 10), matWall);
  startwall.position.set(-10.5, 6.5, 0); scene.add(startwall);
}

// crate helper (climbable: blocker + platform)
function crate(cx, cz, s, top) {
  solidBox(cx, top - s / 2, cz, s, s, s, matWoodPale, { platform: true, blocker: true });
}

// starting crate pile + lean-to hide nook
crate(-4.4, -1.2, 1.0, 1.0);
crate(-3.2, -1.4, 1.0, 1.0);
crate(-3.8, -1.3, 0.9, 1.9);   // stacked
crate(-1.6, -0.6, 0.8, 0.8);
const leanRoof = solidBox(-3.9, 2.35, -0.4, 3.4, 0.18, 2.6, matWood, {});
const hideNook = { x0: -5.0, x1: -3.0, z0: -0.5, z1: 1.0 };

// TABLE 1: the feasting table - climb it via chair, hide beneath it
{
  const tx = 11, tz = 0;
  solidBox(tx, 2.9, tz, 6.4, 0.35, 3.4, matWoodPale, { platform: true });       // top
  for (const [lx, lz] of [[-2.8, -1.4], [2.8, -1.4], [-2.8, 1.4], [2.8, 1.4]]) {
    solidBox(tx + lx, 1.36, tz + lz, 0.45, 2.72, 0.45, matWood, { blocker: true }); // legs
  }
  // cloth skirt hint on the long sides
  const cloth = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.9, 0.06), new THREE.MeshStandardMaterial({ color: 0x6a6248, roughness: 1 }));
  cloth.position.set(tx, 2.4, tz + 1.68); scene.add(cloth);
  // chair to climb
  solidBox(9.0, 1.42, 2.4, 1.1, 0.18, 1.1, matWood, { platform: true });       // seat y=1.51
  solidBox(9.0, 0.71, 2.4, 0.16, 1.42, 0.16, matWood, {});
  solidBox(9.0, 2.3, 2.9, 1.1, 1.6, 0.14, matWood, {});
  // stool step
  solidBox(7.6, 0.35, 2.2, 0.9, 0.7, 0.9, matWoodPale, { platform: true, blocker: true });
  // plates and carcass on top
  const carcass = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 1.2, 4, 8), new THREE.MeshStandardMaterial({ color: 0x6a2c20, roughness: 0.55 }));
  carcass.rotation.z = Math.PI / 2; carcass.position.set(11.6, 3.35, 0); carcass.castShadow = true; scene.add(carcass);
  for (const px of [9.4, 10.6, 12.8]) {
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.34, 0.07, 12), matIron);
    plate.position.set(px, 3.12, px === 10.6 ? -0.8 : 0.9); scene.add(plate);
  }
}
const hideTable = { x0: 8.4, x1: 13.6, z0: -1.5, z1: 1.5 };

// shelf run mid-level (checkpoint zone)
solidBox(16.5, 1.05, -1.6, 3.0, 2.1, 1.0, matWood, { platform: true });
solidBox(20.5, 0.7, -1.6, 2.2, 1.4, 1.0, matWood, { platform: true });

// sink counters after the gap
solidBox(27.6, 1.2, -1.2, 2.6, 2.4, 1.6, matIron, { platform: true, blocker: true });
crate(26.0, 0.9, 1.0, 1.0);
const sinkBasin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 1.0), matIron);
sinkBasin.position.set(27.6, 2.55, -1.2); scene.add(sinkBasin);

// barrel hide spot
{
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.8, 1.9, 12), matWood);
  b.position.set(31.5, 0.95, -1.3); b.castShadow = true; scene.add(b);
  addPlatform(30.75, 32.25, -2.05, -0.55, 1.9);
}
const hideBarrel = { x0: 30.8, x1: 32.2, z0: -2.0, z1: -0.6 };

// pushable crate: the only way up to the high vent shelf
const pushCrate = { x: 30.0, z: 0.9, s: 1.1, mesh: null, plat: null, blok: null };
{
  const s1 = pushCrate.s;
  pushCrate.mesh = new THREE.Mesh(new THREE.BoxGeometry(s1, s1, s1), new THREE.MeshStandardMaterial({ color: 0x6a5636, roughness: 0.8 }));
  pushCrate.mesh.position.set(pushCrate.x, s1 / 2, pushCrate.z);
  pushCrate.mesh.castShadow = true; pushCrate.mesh.receiveShadow = true;
  scene.add(pushCrate.mesh);
  pushCrate.plat = { x0: 0, x1: 0, z0: 0, z1: 0, y: s1 }; platforms.push(pushCrate.plat);
  pushCrate.blok = { x0: 0, x1: 0, z0: 0, z1: 0, top: s1 }; blockers.push(pushCrate.blok);
}
function syncPushCrate() {
  const h = pushCrate.s / 2;
  pushCrate.mesh.position.set(pushCrate.x, pushCrate.s / 2, pushCrate.z);
  pushCrate.plat.x0 = pushCrate.blok.x0 = pushCrate.x - h; pushCrate.plat.x1 = pushCrate.blok.x1 = pushCrate.x + h;
  pushCrate.plat.z0 = pushCrate.blok.z0 = pushCrate.z - h; pushCrate.plat.z1 = pushCrate.blok.z1 = pushCrate.z + h;
}
syncPushCrate();

// the high vent shelf - only the pushed crate reaches it
solidBox(33.2, 1.3, -1.2, 2.0, 2.6, 2.0, matIron, { platform: true, blocker: true });

// final shelf + morsel ledge
solidBox(35.0, 1.2, -1.7, 2.4, 2.4, 1.0, matWood, { platform: true });
crate(33.6, -0.4, 1.0, 1.0);

// the dumbwaiter hatch - the way down and out
{
  const frame = new THREE.Mesh(new THREE.BoxGeometry(2.2, 3.0, 0.5), matIron);
  frame.position.set(39.2, 1.5, -2.4); scene.add(frame);
  const mouth = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.3), new THREE.MeshBasicMaterial({ color: 0x030807 }));
  mouth.position.set(39.2, 1.35, -2.13); scene.add(mouth);
  const lamp2 = new THREE.PointLight(0x87ffb0, 6, 6, 2);
  lamp2.position.set(39.2, 2.6, -1.6); scene.add(lamp2);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.3), new THREE.MeshBasicMaterial({ color: 0x2a5a3a }));
  sign.position.set(39.2, 3.2, -2.12); scene.add(sign);
}

addLamp(0, 5.2, -0.6);
addLamp(11, 6.2, -0.4);
addLamp(21, 5.6, -0.8);
addLamp(30, 5.8, -0.5);
addLamp(37, 5.4, -0.8);

const hideVolumes = [hideNook, hideTable, hideBarrel];
function inHideVolume(x, z) {
  for (const h of hideVolumes) if (x >= h.x0 && x <= h.x1 && z >= h.z0 && z <= h.z1) return true;
  return false;
}

// ---------------- morsels (hunger) ----------------
const morsels = [];
function addMorsel(x, y, z) {
  const m = new THREE.Mesh(new THREE.DodecahedronGeometry(0.14), matMorsel);
  m.position.set(x, y + 0.14, z); m.castShadow = true;
  m.userData.baseY = y + 0.14;
  scene.add(m);
  morsels.push({ mesh: m, x, y: y + 0.14, z, taken: false });
}
addMorsel(-3.8, 1.9, -1.3);   // on the stacked crate
addMorsel(11.5, 3.075, 0.7);  // on the feasting table
addMorsel(20.5, 1.4, -1.6);   // on the low shelf
addMorsel(27.6, 2.4, -1.2);   // on the sink counter
addMorsel(35.0, 2.4, -1.7);   // on the final shelf
addMorsel(33.2, 2.6, -1.2);   // on the high vent shelf (push the crate)

// ---------------- the child ----------------
const player = {
  x: -6, y: 0, z: 0, vx: 0, vy: 0, vz: 0,
  grounded: true, sneak: false, hidden: false,
  hunger: 100, face: 1, eating: 0, coyote: 0, buffer: 0,
  growlT: 6, bob: 0, checkpoint: { x: -6, z: 0 }, caught: 0, win: false, dead: false, deck: 1,
};

const child = new THREE.Group();
{
  const coat = new THREE.Mesh(new THREE.ConeGeometry(0.34, 1.0, 8), matCoat);
  coat.position.y = 0.55; coat.castShadow = true; child.add(coat);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), matSkin);
  head.position.y = 1.13; head.castShadow = true; child.add(head);
  const hood = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.34, 8), matCoat);
  hood.position.y = 1.26; child.add(hood);
  const shoeGeo = new THREE.BoxGeometry(0.12, 0.09, 0.2);
  const shoeL = new THREE.Mesh(shoeGeo, matDark); shoeL.position.set(0, 0.045, 0.09); child.add(shoeL);
  const shoeR = new THREE.Mesh(shoeGeo, matDark); shoeR.position.set(0, 0.045, -0.09); child.add(shoeR);
  child.userData.coat = coat; child.userData.head = head;
}
scene.add(child);

// ---------------- nomes: small skittish things ----------------
const nomes = [];
function addNome(x, z) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.55, 7), new THREE.MeshStandardMaterial({ color: 0x8a8578, roughness: 0.9 }));
  body.position.y = 0.28; body.castShadow = true; g.add(body);
  g.position.set(x, 0, z); scene.add(g);
  nomes.push({ mesh: g, x, z, homeX: x, vx: 0, vz: 0, state: 'idle', squeaked: false });
}
addNome(1.5, 0.8); addNome(14.5, -1.0); addNome(29.5, 0.2);
function updateNomes(dt, t) {
  for (const n of nomes) {
    const d = Math.hypot(player.x - n.x, player.z - n.z);
    if (n.state === 'idle' && d < 3 && !player.hidden) {
      n.state = 'flee';
      const away = Math.atan2(n.z - player.z, n.x - player.x);
      n.vx = Math.cos(away) * 3.2; n.vz = Math.sin(away) * 3.2;
      if (!n.squeaked) { n.squeaked = true; emitNoise(n.x, n.z, 3.5); } // the squeak can betray you both
    }
    if (n.state === 'flee') {
      n.x += n.vx * dt; n.z += n.vz * dt;
      n.x = Math.max(-9, Math.min(43, n.x)); n.z = Math.max(ZMIN, Math.min(ZMAX, n.z));
      n.vx *= (1 - dt * 1.5); n.vz *= (1 - dt * 1.5);
      if (Math.hypot(n.vx, n.vz) < 0.3) { n.state = 'watch'; }
    } else if (n.state === 'watch') {
      if (d > 9) { n.state = 'return'; }
      n.mesh.rotation.y = Math.atan2(player.x - n.x, player.z - n.z);
    } else if (n.state === 'return') {
      const dx = n.homeX - n.x;
      if (Math.abs(dx) < 0.2) { n.state = 'idle'; n.squeaked = false; }
      else n.x += Math.sign(dx) * 1.2 * dt;
      if (d < 3 && !player.hidden) n.state = 'flee';
    }
    n.mesh.position.set(n.x, Math.abs(Math.sin(t * 6 + n.homeX)) * (n.state === 'flee' ? 0.08 : 0.015), n.z);
  }
}

// ---------------- the Stewards (grotesque adults) ----------------
function makeSteward(px0, px1) {
  const g = new THREE.Group();
  const torso = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.7, 0.7), matApron);
  torso.position.y = 2.15; torso.castShadow = true; g.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), matPale);
  head.position.y = 3.35; head.scale.set(1, 1.25, 1); head.castShadow = true; g.add(head);
  const bandage = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.2, 0.68), new THREE.MeshStandardMaterial({ color: 0x8a7f6a, roughness: 1 }));
  bandage.position.y = 3.42; g.add(bandage); // blind, like any good hunter of small things
  const armGeo = new THREE.CylinderGeometry(0.09, 0.13, 2.1, 6);
  const armL = new THREE.Mesh(armGeo, matPale); armL.position.set(0, 2.3, 0.48); armL.castShadow = true; g.add(armL);
  const armR = new THREE.Mesh(armGeo, matPale); armR.position.set(0, 2.3, -0.48); armR.castShadow = true; g.add(armR);
  const legGeo = new THREE.CylinderGeometry(0.14, 0.17, 1.35, 6);
  const legL = new THREE.Mesh(legGeo, matDark); legL.position.set(0, 0.67, 0.2); g.add(legL);
  const legR = new THREE.Mesh(legGeo, matDark); legR.position.set(0, 0.67, -0.2); g.add(legR);
  g.userData = { armL, armR, head };
  scene.add(g);
  return {
    mesh: g, x: (px0 + px1) / 2, z: 0, vx: 0,
    patrol: [px0, px1], wp: 0, state: 'patrol',
    tx: 0, tz: 0, wait: 0, grab: 0, face: 1, phase: Math.random() * 9,
    home: (px0 + px1) / 2,
  };
}
const stewards = [makeSteward(6, 17), makeSteward(36, 42)];

// the Watchman: sighted, slow, and his lamp never sleeps (zone after the gap)
const watchman = (() => {
  const g = new THREE.Group();
  const torso = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.0), matApron);
  torso.position.y = 2.5; torso.castShadow = true; g.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), matPale);
  head.position.y = 3.55; head.scale.set(1.1, 0.9, 1); head.castShadow = true; g.add(head);
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), new THREE.MeshStandardMaterial({ color: 0xfff2c8, emissive: 0xffe9a8, emissiveIntensity: 3.5 }));
  eye.position.set(0.30, 3.55, 0); g.add(eye);
  const beam = new THREE.SpotLight(0xffe9a8, 60, 14, 0.42, 0.45, 1.2);
  beam.position.set(0.30, 3.55, 0);
  const beamTarget = new THREE.Object3D(); beamTarget.position.set(6, 0, 0);
  g.add(beamTarget); beam.target = beamTarget; g.add(beam);
  // visible light cone
  const coneLen = 9;
  const coneGeo = new THREE.ConeGeometry(3.4, coneLen, 20, 1, true);
  const coneMat = new THREE.MeshBasicMaterial({ color: 0xffe9a8, transparent: true, opacity: 0.055, side: THREE.DoubleSide, depthWrite: false });
  const cone = new THREE.Mesh(coneGeo, coneMat);
  cone.rotation.z = Math.PI / 2; // point along +x of the group
  cone.position.set(0.30 + coneLen / 2, 3.55, 0);
  g.add(cone);
  const legGeo = new THREE.CylinderGeometry(0.18, 0.22, 1.8, 6);
  const legL = new THREE.Mesh(legGeo, matDark); legL.position.set(0, 0.9, 0.28); g.add(legL);
  const legR = new THREE.Mesh(legGeo, matDark); legR.position.set(0, 0.9, -0.28); g.add(legR);
  g.userData = { head, eye, cone, beam };
  scene.add(g);
  return { mesh: g, x: 30.5, z: 0.5, patrol: [28.5, 34.5], wp: 0, state: 'patrol', face: 1, wait: 0, phase: 3, tx: 0, coneLen };
})();

function watchmanSees() {
  if (watchman.blind || player.hidden || player.dead || player.win) return false;
  const dx = player.x - watchman.x, dz = player.z - watchman.z;
  const dist = Math.hypot(dx, dz);
  const range = player.sneak ? 4.2 : 8.5;
  if (dist > range || player.y > 3.6) return false;         // above his lamp-line
  if (Math.sign(dx) !== watchman.face && dist > 0.8) return false; // the lamp looks where he looks
  const ang = Math.abs(Math.atan2(dz, dx) - (watchman.face > 0 ? 0 : Math.PI));
  const norm = Math.min(ang, 2 * Math.PI - ang);
  if (norm > 0.45 && dist > 1.2) return false;
  // furniture shadows: crouching behind the sink or vent shelf breaks the beam
  if (player.sneak) {
    for (const b of [{ x0: 26.3, x1: 28.9 }, { x0: 32.2, x1: 34.2 }]) {
      if (player.x > b.x0 - 0.3 && player.x < b.x1 + 0.3 && Math.sign(watchman.x - player.x) !== Math.sign(player.x - (b.x0 + b.x1) / 2)) return false;
    }
  }
  return true;
}

function updateWatchman(dt) {
  const w = watchman;
  w.phase += dt;
  const dist = Math.hypot(player.x - w.x, player.z - w.z);
  if (watchmanSees() && w.state !== 'chase') { w.state = 'chase'; w.tx = player.x; }
  let mvx = 0, speed = 0;
  if (w.state === 'patrol') {
    speed = 0.8;
    const target = w.patrol[w.wp];
    mvx = Math.sign(target - w.x);
    if (Math.abs(target - w.x) < 0.3) { w.wp = 1 - w.wp; w.wait = 2.2; w.state = 'pause'; }
  } else if (w.state === 'pause') {
    w.wait -= dt; if (w.wait <= 0) w.state = 'patrol';
    // the lamp sweeps while he thinks
  } else if (w.state === 'chase') {
    speed = 2.7;
    if (watchmanSees()) w.tx = player.x;
    const d = Math.abs(w.tx - w.x);
    if (d > 0.4) mvx = Math.sign(w.tx - w.x);
    else { w.state = 'scan'; w.wait = 3.2; }
    if (!player.hidden && !player.dead && !player.win && dist < 1.1 && player.y < 1.6) { caught(w); return; }
  } else if (w.state === 'scan') {
    w.wait -= dt;
    if (w.wait <= 0) w.state = 'patrol';
  }
  if (mvx !== 0) {
    const nx = w.x + mvx * speed * dt;
    if (!(nx > GAP.x0 - 0.3 && nx < GAP.x1 + 0.3)) w.x = nx;
    if (w.state === 'chase' && (nx > GAP.x0 - 0.3 && nx < GAP.x1 + 0.3)) { w.state = 'scan'; w.wait = 3; }
    w.face = Math.sign(mvx);
  }
  const g = w.mesh;
  g.position.set(w.x, 0, w.z);
  g.rotation.y = w.face > 0 ? 0 : Math.PI;
  // lamp sweep while paused or scanning
  if (w.state === 'pause' || w.state === 'scan') {
    g.userData.head.rotation.y = Math.sin(w.phase * 1.4) * 0.7;
    g.rotation.y += g.userData.head.rotation.y * 0.25;
  } else g.userData.head.rotation.y = 0;
  g.userData.cone.material.opacity = w.state === 'chase' ? 0.10 : 0.055;
}

// hearing works for him too - he turns toward noise
const origEmitNoise = emitNoise;
emitNoise = function (x, z, r) {
  origEmitNoise(x, z, r);
  const d = Math.hypot(watchman.x - x, watchman.z - z);
  if (d < r && watchman.state !== 'chase') { watchman.state = 'scan'; watchman.wait = 1.6; watchman.face = Math.sign(x - watchman.x) || 1; }
};

// ---------------- input ----------------
const keys = {};
let started = false;
addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (!started) { started = true; startAudio(); document.getElementById('msg').innerHTML = ''; }
  if (e.code === 'Space') { player.buffer = 0.12; e.preventDefault(); }
  if (e.code === 'KeyE') tryInteract();
});
addEventListener('keyup', (e) => { keys[e.code] = false; });

// ---------------- audio: a low procedural drone ----------------
let actx = null;
function startAudio() {
  try {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    const gain = actx.createGain(); gain.gain.value = 0.05; gain.connect(actx.destination);
    for (const f of [52, 52.7, 104.3]) {
      const o = actx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
      const og = actx.createGain(); og.gain.value = f > 100 ? 0.25 : 1;
      o.connect(og); og.connect(gain); o.start();
    }
    const lfo = actx.createOscillator(); lfo.frequency.value = 0.07;
    const lg = actx.createGain(); lg.gain.value = 0.02;
    lfo.connect(lg); lg.connect(gain.gain); lfo.start();
  } catch (e) { /* silence is also dread */ }
}

// ---------------- HUD ----------------
const hungerEl = document.getElementById('hunger');
const promptEl = document.getElementById('prompt');
const fadeEl = document.getElementById('fade');
const msgEl = document.getElementById('msg');
msgEl.innerHTML = '<h1>THE UNDERTIDE</h1><p>a small thing in a house of eaters</p><p class="dim">arrows / WASD to move &nbsp;·&nbsp; SHIFT to sneak &nbsp;·&nbsp; SPACE to jump &nbsp;·&nbsp; E to hide and eat</p><p class="dim">keep your belly full. stay quiet. stay small.</p>';

// ---------------- interact ----------------
function tryInteract() {
  if (!started || player.dead || player.win) return;
  if (player.hidden) { player.hidden = false; return; }
  // eat?
  for (const m of morsels) {
    if (!m.taken && Math.hypot(player.x - m.x, player.z - m.z) < 0.9 && Math.abs(player.y + 0.7 - m.y) < 1.0) {
      m.taken = true; m.mesh.visible = false;
      player.hunger = Math.min(100, player.hunger + 45);
      player.eating = 0.8;
      emitNoise(player.x, player.z, 2.5); // chewing is quiet, but not nothing
      return;
    }
  }
  // hide?
  if (inHideVolume(player.x, player.z)) { player.hidden = true; player.vx = 0; player.vz = 0; }
}

// ---------------- noise / hearing ----------------
const noiseEvents = []; // QA observability
function emitNoise(x, z, r) {
  noiseEvents.push({ x, z, r, t: performance.now() });
  const ears = (typeof freezerSteward !== 'undefined' && player.deck === 2) ? [freezerSteward] : stewards;
  for (const s of ears) {
    const d = Math.hypot(s.x - x, s.z - z);
    if (d < r) {
      if (d < r * 0.5 && !player.hidden) {
        if (s.state !== 'chase') setChase(s);
        else { s.tx = x; s.tz = z; }
      } else if (s.state === 'patrol' || s.state === 'return') {
        s.state = 'invest'; s.tx = x + (Math.random() - 0.5); s.tz = z * 0.5; s.wait = 0;
      }
    }
  }
}
function setChase(s) {
  s.state = 'chase'; s.tx = player.x; s.tz = player.z; s.grab = 0;
}

// ---------------- movement constants ----------------
const RUN = 4.2, SNEAK = 1.55, GRAV = -22, JUMPV = 8.8, ACCEL = 26;

// ---------------- player update ----------------
function updatePlayer(dt) {
  if (player.dead || player.win) return;
  if (riding) {
    if (player.buffer > 0) { player.buffer = 0; releaseCarcass(); }
    else drainHunger(dt);
    return;
  }
  if (player.hidden) { // hidden: still hungry, still mortal, but still
    drainHunger(dt * 0.7);
    return;
  }
  if (player.eating > 0) { player.eating -= dt; drainHunger(dt); return; }

  const left = keys.ArrowLeft || keys.KeyA;
  const right = keys.ArrowRight || keys.KeyD;
  const up = keys.ArrowUp || keys.KeyW;
  const down = keys.ArrowDown || keys.KeyS;
  player.sneak = !!(keys.ShiftLeft || keys.ShiftRight);

  let speedCap = player.sneak ? SNEAK : RUN;
  if (player.hunger < 35) speedCap *= 0.7;
  if (player.hunger <= 0) speedCap *= 0.78;

  const ix = (right ? 1 : 0) - (left ? 1 : 0);
  const iz = (down ? 1 : 0) - (up ? 1 : 0);
  const target_vx = ix * speedCap, target_vz = iz * speedCap * 0.8;
  player.vx += Math.sign(target_vx - player.vx) * Math.min(ACCEL * dt, Math.abs(target_vx - player.vx));
  player.vz += Math.sign(target_vz - player.vz) * Math.min(ACCEL * dt, Math.abs(target_vz - player.vz));
  if (ix !== 0) player.face = ix;

  // jump: buffer + coyote
  player.buffer -= dt; player.coyote -= dt;
  if (player.buffer > 0 && (player.grounded || player.coyote > 0)) {
    player.vy = JUMPV; player.grounded = false; player.buffer = 0; player.coyote = 0;
  } else if (player.buffer > 0 && !player.grounded && player.deck === 2) { tryGrabCarcass(); if (!riding) {} else player.buffer = 0; }

  // integrate x/z with blocker push-out
  const wasX = player.x, wasZ = player.z;
  player.x += player.vx * dt;
  player.z += player.vz * dt;
  player.z = Math.max(ZMIN, Math.min(ZMAX, player.z));
  player.x = player.deck === 5 ? Math.max(254.4, Math.min(314.6, player.x)) : (player.deck === 4 ? Math.max(189.4, Math.min(246.6, player.x)) : (player.deck === 3 ? Math.max(119.4, Math.min(180.6, player.x)) : (player.deck === 2 ? Math.max(60.2, Math.min(111.6, player.x)) : Math.max(-9.6, Math.min(43.6, player.x)))));
  const pr = 0.26;
  for (const b of blockers) {
    if (player.y < b.top - 0.28 &&
        player.x + pr > b.x0 && player.x - pr < b.x1 &&
        player.z + pr > b.z0 && player.z - pr < b.z1) {
      const dxl = (player.x + pr) - b.x0, dxr = b.x1 - (player.x - pr);
      const dzl = (player.z + pr) - b.z0, dzr = b.z1 - (player.z - pr);
      const m = Math.min(dxl, dxr, dzl, dzr);
      if (m === dxl) player.x = b.x0 - pr; else if (m === dxr) player.x = b.x1 + pr;
      else if (m === dzl) player.z = b.z0 - pr; else player.z = b.z1 + pr;
    }
  }

  // vertical: stand on the highest surface at/below you, so floors under tables exist
  if (player.grounded) {
    const g = surfaceAt(player.x, player.z, player.y + 0.35);
    if (g < player.y - 0.05) { player.grounded = false; player.coyote = 0.1; player.vy = 0; }
    else player.y = g;
  }
  if (!player.grounded) {
    player.vy += GRAV * dt;
    const newY = player.y + player.vy * dt;
    if (player.vy <= 0) {
      const g2 = surfaceAt(player.x, player.z, player.y + 0.01);
      if (newY <= g2 && g2 > -1e8) {
        const hard = player.vy < -6;
        player.y = g2; player.vy = 0; player.grounded = true;
        if (hard) emitNoise(player.x, player.z, 5.5); // landing slaps
      } else player.y = newY;
    } else player.y = newY;
  }
  // the pit and the grate gap
  if (player.y < -5) { respawn('the dark below took you'); return; }

  // falling past a carcass: small hands catch
  if (!player.grounded && !riding && player.deck === 2) tryGrabCarcass();

  // moving noise
  const spd = Math.hypot(player.vx, player.vz);
  if (spd > 0.3 && player.grounded) {
    player.noiseAcc = (player.noiseAcc || 0) + dt;
    const interval = player.sneak ? 0.55 : 0.26;
    if (player.noiseAcc > interval) {
      player.noiseAcc = 0;
      emitNoise(player.x, player.z, player.sneak ? 1.3 : 7);
    }
  }

  // pushing the crate: lean into it and it slides, slowly, loudly
  if (player.grounded && !player.sneak && Math.abs(player.vx) > 0.5) {
    const h = pushCrate.s / 2, pr2 = 0.3;
    const nearZ = Math.abs(player.z - pushCrate.z) < h + 0.2;
    const onLevel = Math.abs(player.y) < 0.6;
    const dir = Math.sign(player.vx);
    const edge = pushCrate.x + dir * -1 * (h + pr2);
    if (nearZ && onLevel && Math.abs(player.x - edge) < 0.28 && Math.abs(player.vx) > 1) {
      const nx = pushCrate.x + dir * 1.15 * dt;
      if (nx > 25.8 && nx < 33.2 - h - 0.1) {
        pushCrate.x = nx; syncPushCrate();
        player.x = pushCrate.x - dir * (h + pr2);
        player.pushAcc = (player.pushAcc || 0) + dt;
        if (player.pushAcc > 0.8) { player.pushAcc = 0; emitNoise(pushCrate.x, pushCrate.z, 4.5); } // wood on stone
      }
    }
  }

  // walking bob
  player.bob += dt * (4 + spd * 2.4);

  // checkpoint
  if (player.x > 16 && player.checkpoint.x < 16) player.checkpoint = { x: 16.5, z: -1.0 };

  // hunger
  drainHunger(dt);

  // the hatch: down into the cold
  if (player.deck === 1 && player.x > 38.6 && !player.dead) {
    player.deck = 2;
    player.dead = true;
    fadeEl.style.opacity = 1;
    if (player.respawnTimer) clearTimeout(player.respawnTimer);
    player.respawnTimer = setTimeout(() => {
      player.x = 61; player.z = 0; player.y = 0; player.vx = 0; player.vy = 0; player.vz = 0; player.grounded = true;
      player.checkpoint = { x: 61, z: 0 };
      player.dead = false;
      setCold(true);
      fadeEl.style.opacity = 0;
      player.respawnTimer = null;
    }, 900);
  }
  // the vent out of the freezer: into the feast
  if (player.deck === 2 && player.x > 106 && !player.dead) {
    player.deck = 3; player.dead = true; fadeEl.style.opacity = 1;
    if (player.respawnTimer) clearTimeout(player.respawnTimer);
    player.respawnTimer = setTimeout(() => {
      player.x = 121; player.z = 0; player.y = 0; player.vx = 0; player.vy = 0; player.vz = 0; player.grounded = true;
      player.checkpoint = { x: 121, z: 0 }; player.dead = false; setFeast(true); fadeEl.style.opacity = 0; player.respawnTimer = null;
    }, 900);
  }
  // the service hatch beyond the Guests: the Nursery
  if (player.deck === 3 && player.x > 176.5 && !player.dead) {
    player.deck = 4; player.dead = true; fadeEl.style.opacity = 1;
    if (player.respawnTimer) clearTimeout(player.respawnTimer);
    player.respawnTimer = setTimeout(() => {
      player.x=191; player.z=0; player.y=0; player.vx=player.vy=player.vz=0; player.grounded=true;
      player.checkpoint={x:191,z:0}; player.dead=false; setNursery(true); fadeEl.style.opacity=0; player.respawnTimer=null;
    },900);
  }
  if (player.deck === 4 && player.x > 243.5 && !player.dead) {
    player.deck=5; player.dead=true; fadeEl.style.opacity=1;
    if(player.respawnTimer)clearTimeout(player.respawnTimer);
    player.respawnTimer=setTimeout(()=>{player.x=256;player.z=0;player.y=0;player.vx=player.vy=player.vz=0;player.grounded=true;player.checkpoint={x:256,z:0};player.dead=false;setBaths(true);fadeEl.style.opacity=0;player.respawnTimer=null;},900);
  }
  if(player.deck===5&&player.x>311.5){player.win=true;fadeEl.style.opacity=1;msgEl.innerHTML='<h1>THE WATER FORGOT YOUR NAME</h1><p>but something below remembers your steps.</p><p class="dim">THE UNDERTIDE · v6 · the Furnace waits below</p>';}

}

function drainHunger(dt) {
  player.hunger = Math.max(0, player.hunger - dt * (100 / 240) * (player.deck === 2 ? 1.5 : (player.deck === 3 ? 1.25 : (player.deck === 4 ? 1.15 : (player.deck === 5 ? 1.35 : 1)))));
  player.growlT -= dt;
  if (player.hunger < 35 && player.growlT <= 0) {
    player.growlT = player.hunger <= 0 ? 5 + Math.random() * 2 : 8 + Math.random() * 4;
    emitNoise(player.x, player.z, 6.5); // a small belly betrays you
    player.growled = (player.growled || 0) + 1;
  }
}

// ---------------- steward AI ----------------
function updateSteward(s, dt) {
  s.phase += dt;
  const dx = player.x - s.x, dz = player.z - s.z;
  const dist = Math.hypot(dx, dz);
  const dy = player.y - 0; // stewards walk the floor

  // senses: blind, but close is close - unless you are tucked away
  if (!player.hidden && !player.dead && !player.win && dist < 2.3 && dy < 2.2 && s.state !== 'chase') setChase(s);

  let mvx = 0, speed = 0;
  if (s.state === 'patrol') {
    speed = 1.15;
    const target = s.patrol[s.wp];
    mvx = Math.sign(target - s.x);
    if (Math.abs(target - s.x) < 0.4) { s.wp = 1 - s.wp; s.wait = 1.2 + Math.random() * 1.6; s.state = 'pause'; }
  } else if (s.state === 'pause') {
    s.wait -= dt; if (s.wait <= 0) s.state = 'patrol';
  } else if (s.state === 'invest') {
    speed = 2.2;
    const tx = s.tx - s.x, tz = s.tz - s.z;
    const d = Math.hypot(tx, tz);
    if (d < 0.5) { s.state = 'look'; s.wait = 2.6; }
    else { mvx = tx / d; s.mvz = tz / d; }
    if (!player.hidden && dist < 3.0 && dy < 2.2) setChase(s);
  } else if (s.state === 'look') {
    s.wait -= dt;
    if (!player.hidden && dist < 2.6 && dy < 2.2) setChase(s);
    else if (s.wait <= 0) s.state = 'return';
  } else if (s.state === 'chase') {
    speed = 3.5;
    if (!player.hidden && dist < 8 && dy < 3.5) { s.tx = player.x; s.tz = player.z; }
    const tx = s.tx - s.x, tz = s.tz - s.z;
    const d = Math.hypot(tx, tz);
    if (d > 0.35) { mvx = tx / d; s.mvz = tz / d; }
    // catch: beside him, or on a table within reach of those long arms
    if (!player.hidden && !player.dead && !player.win) {
      if (dist < 0.95 && dy < 1.6) return caught(s);
      if (dy > 1.3 && dy < 3.6 && dist < 1.35) return caught(s);
    }
    // arrival at last-known
    if (d <= 0.4) {
      if (player.hidden && dist < 1.7) { s.state = 'grab'; s.wait = 1.1; }
      else { s.state = 'look'; s.wait = 2.6; }
    }
  } else if (s.state === 'grab') {
    // his hand closes over the hiding place
    s.wait -= dt;
    if (player.hidden && dist < 1.9 && s.wait <= 0) return caught(s);
    if (!player.hidden) { if (dist < 8) setChase(s); else { s.state = 'look'; s.wait = 2; } }
    if (s.wait < -3) s.state = 'return';
  } else if (s.state === 'return') {
    speed = 1.6;
    const d = Math.abs(s.home - s.x);
    mvx = Math.sign(s.home - s.x);
    if (d < 0.5) { s.state = 'patrol'; s.wp = 0; }
  }

  if (mvx !== 0 || s.mvz) {
    const nx = s.x + (mvx || 0) * speed * dt;
    const nz = s.z + (s.mvz || 0) * speed * dt;
    // stewards will not cross the open grate
    if (!(nx > GAP.x0 - 0.3 && nx < GAP.x1 + 0.3)) s.x = nx;
    else if (s.state === 'chase') { s.state = 'look'; s.wait = 3; }
    s.z = Math.max(-1.6, Math.min(1.4, nz));
    if (mvx !== 0) s.face = Math.sign(mvx);
  }
  s.mvz = 0;

  // pose
  const g = s.mesh;
  g.position.set(s.x, 0, s.z);
  g.rotation.y = s.face > 0 ? Math.PI / 2 : -Math.PI / 2;
  const sw = Math.sin(s.phase * (s.state === 'chase' ? 9 : 4.5));
  g.userData.armL.rotation.x = (s.state === 'chase' || s.state === 'grab') ? -1.3 + sw * 0.15 : sw * 0.4;
  g.userData.armR.rotation.x = (s.state === 'chase' || s.state === 'grab') ? -1.3 - sw * 0.15 : -sw * 0.4;
  g.userData.head.rotation.z = Math.sin(s.phase * 0.8) * 0.12;
  g.position.y = Math.abs(Math.sin(s.phase * (s.state === 'chase' ? 9 : 4.5))) * 0.06;
}

function caught(s) {
  if (player.dead || player.win) return;
  player.caught++;
  respawn('long arms in the dark');
}

function respawn(why) {
  if (player.dead) return;
  player.dead = true;
  fadeEl.style.opacity = 1;
  if (player.respawnTimer) clearTimeout(player.respawnTimer);
  player.respawnTimer = setTimeout(() => {
    player.x = player.checkpoint.x; player.z = player.checkpoint.z; player.y = surfaceAt(player.x, player.z, Infinity);
    player.vx = 0; player.vy = 0; player.vz = 0; player.grounded = true;
    player.hidden = false; player.eating = 0;
    player.hunger = Math.max(player.hunger, 55);
    for (const st of stewards) { st.state = 'return'; st.x = st.home; st.z = 0; }
    player.dead = false;
    fadeEl.style.opacity = 0;
    player.respawnTimer = null;
  }, 900);
}

// ---------------- camera ----------------
let camX = -4;
function updateCamera(dt, t) {
  camX += ((player.x + 2.0) - camX) * Math.min(1, dt * 3.2);
  const sway = Math.sin(t * 0.13) * 0.25;
  camera.position.set(camX + sway * 0.2, 3.3 + player.y * 0.55 + Math.sin(t * 0.09) * 0.1, 10.2);
  camera.lookAt(camX + sway, 1.5 + player.y * 0.5, 0);
}

// ---------------- HUD / prompt ----------------
function updateHud() {
  hungerEl.style.width = player.hunger.toFixed(1) + '%';
  hungerEl.style.background = player.hunger < 35 ? '#a03020' : '';
  let p = '';
  if (!player.dead && !player.win && started) {
    if (player.hidden) p = 'E - slip out';
    else {
      for (const m of morsels) {
        if (!m.taken && Math.hypot(player.x - m.x, player.z - m.z) < 0.9 && Math.abs(player.y + 0.7 - m.y) < 1.0) { p = 'E - eat'; break; }
      }
      if (!p && inHideVolume(player.x, player.z)) p = 'E - hide';
    }
  }
  promptEl.textContent = p;
}

// ---------------- main loop ----------------
const clock = new THREE.Clock();
function tick() {
  window.__frames++;
  requestAnimationFrame(tick);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  if (started) {
    updatePlayer(dt);
    if (player.deck === 1) {
      for (const s of stewards) updateSteward(s, dt);
      updateWatchman(dt);
      updateNomes(dt, t);
    } else if (player.deck === 2) {
      updateFreezerSteward(dt); updateCarcasses(dt);
    } else if (player.deck === 3) {
      updateGuests(dt, t);
    } else if (player.deck === 4) {
      updateNursery(dt, t);
    } else {
      updateBaths(dt, t);
    }
  }
  // pose the child
  child.position.set(player.x, player.y, player.z);
  child.rotation.y = player.face > 0 ? Math.PI / 2 : -Math.PI / 2;
  const spd = Math.hypot(player.vx, player.vz);
  child.userData.coat.rotation.z = Math.sin(player.bob) * 0.08 * Math.min(1, spd / 3);
  child.position.y += Math.abs(Math.sin(player.bob)) * 0.05 * Math.min(1, spd / 3);
  child.scale.y = player.hidden ? 0.55 : (player.sneak ? 0.8 : 1);
  // lamps swing & flicker
  for (const l of lamps) {
    l.rotation.z = Math.sin(t * 0.7 + l.userData.phase) * 0.1;
    const pt = l.children[3];
    pt.intensity = l.userData.base * (0.86 + 0.14 * Math.sin(t * 11 + l.userData.phase) * Math.sin(t * 5.3 + l.userData.phase * 2));
  }
  // morsel shimmer
  for (const m of morsels) if (!m.taken) m.mesh.position.y = m.y + Math.sin(t * 2 + m.x) * 0.03;
  updateCamera(dt, t);
  updateHud();
  renderer.render(scene, camera);
}
tick();


// ---------------- deck 2: THE FREEZER ----------------
const matFrost = new THREE.MeshStandardMaterial({ color: 0x9fb8c0, roughness: 0.55 });
const matCarcass = new THREE.MeshStandardMaterial({ color: 0x5a2620, roughness: 0.5 });
const matCold = new THREE.MeshStandardMaterial({ color: 0x1c2a30, roughness: 0.9 });

let coldOn = false;
const warmFog = new THREE.Color(0x050f0c), coldFog = new THREE.Color(0x0a151b);
function setCold(on) {
  coldOn = on;
  scene.fog.color.copy(on ? coldFog : warmFog);
  scene.background.copy(on ? coldFog : warmFog);
}

{
  // entry platform, then the pit, then the far side (x 60..112)
  solidBox(63.5, -0.25, 0, 7, 0.5, 8, matCold, { cast: false });
  solidBox(103, -0.25, 0, 18, 0.5, 8, matCold, { cast: false });
  // frost skin on the platforms
  for (const [cx, sx] of [[63.5, 7], [103, 18]]) {
    const frost = new THREE.Mesh(new THREE.BoxGeometry(sx, 0.06, 8), matFrost);
    frost.position.set(cx, 0.03, 0); frost.receiveShadow = true; scene.add(frost);
  }
  // cold glow in the pit
  const pitglow = new THREE.Mesh(new THREE.PlaneGeometry(29, 8), new THREE.MeshBasicMaterial({ color: 0x0d222e }));
  pitglow.rotation.x = -Math.PI / 2; pitglow.position.set(81.5, -4.2, 0); scene.add(pitglow);
  // walls + ceiling
  const w = new THREE.Mesh(new THREE.BoxGeometry(56, 14, 0.6), matWall); w.position.set(84, 6.5, -3.4); w.receiveShadow = true; scene.add(w);
  const ceil = new THREE.Mesh(new THREE.BoxGeometry(56, 0.6, 10), matCold); ceil.position.set(84, 8.6, 0); scene.add(ceil);
  // icicles
  for (let i = 0; i < 26; i++) {
    const ix = 58 + Math.random() * 52, iz = -3 + Math.random() * 5, ih = 0.4 + Math.random() * 1.4;
    const ic = new THREE.Mesh(new THREE.ConeGeometry(0.07 + Math.random() * 0.08, ih, 6), matFrost);
    ic.rotation.x = Math.PI; ic.position.set(ix, 8.3 - ih / 2, iz); scene.add(ic);
  }
  // static carcass rows against the wall (the rest of the forest)
  for (let x = 62; x < 110; x += 2.6) {
    const c = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 1.5, 4, 8), matCarcass);
    c.position.set(x, 5.6, -2.2); c.castShadow = true; scene.add(c);
    const ch = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.4), matIron);
    ch.position.set(x, 7.4, -2.2); scene.add(ch);
  }
  // cold lamps
  for (const lx of [63, 78, 92, 105]) {
    const pt = new THREE.PointLight(0xa8d8e8, 10, 12, 1.8); pt.position.set(lx, 5.5, -0.5); scene.add(pt);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 5), new THREE.MeshStandardMaterial({ color: 0xcfeef8, emissive: 0xa8d8e8, emissiveIntensity: 2 }));
    bulb.position.set(lx, 5.5, -0.5); scene.add(bulb);
  }
  // the vent out
  const vf = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.6, 0.5), matIron); vf.position.set(108, 1.3, -2.4); scene.add(vf);
  const vm = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.0), new THREE.MeshBasicMaterial({ color: 0x04100c })); vm.position.set(108, 1.2, -2.13); scene.add(vm);
  const vl = new THREE.PointLight(0x87ffb0, 5, 6, 2); vl.position.set(108, 2.4, -1.6); scene.add(vl);
  // freezer steward on the far side
  // (built below in the steward section)
  // deck-2 blockers for the entry/far platforms' walls
  const entryWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, 12, 8), matWall); entryWall.position.set(59.7, 5.5, 0); scene.add(entryWall);
  const farWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, 12, 8), matWall); farWall.position.set(112.3, 5.5, 0); scene.add(farWall);
}

// the swinging row: seven carcasses over the pit
const carcasses = [];
{
  const PIVOT_Y = 7.5, L = 4.3;
  for (let i = 0; i < 7; i++) {
    const cx = 68.5 + i * 4.2;
    const g = new THREE.Group();
    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, L, 5), matIron);
    chain.position.y = -L / 2; g.add(chain);
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 1.7, 4, 8), matCarcass);
    body.position.y = -L; body.castShadow = true; g.add(body);
    const frostCap = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), matFrost);
    frostCap.position.y = -L + 0.9; g.add(frostCap);
    g.position.set(cx, PIVOT_Y, 0);
    scene.add(g);
    carcasses.push({ mesh: g, x: cx, pivotY: PIVOT_Y, L, theta: 0, omega: 0 });
  }
}
let riding = null; // carcass the child is hanging from

function updateCarcasses(dt) {
  for (const c of carcasses) {
    if (riding === c) {
      // pendulum with pumping
      const pump = ((keys.ArrowRight || keys.KeyD) ? 1 : 0) - ((keys.ArrowLeft || keys.KeyA) ? 1 : 0);
      c.omega += (-9.8 / c.L) * Math.sin(c.theta) * dt + pump * 1.9 * dt;
      c.omega *= (1 - dt * 0.12);
      c.theta += c.omega * dt;
      c.theta = Math.max(-1.25, Math.min(1.25, c.theta));
      // the chains groan when worked hard
      if (Math.abs(c.omega) > 0.9 && (c.groanAcc = (c.groanAcc || 0) + dt) > 1.2) { c.groanAcc = 0; emitNoise(player.x, player.z, 6); }
    } else {
      c.omega += (-9.8 / c.L) * Math.sin(c.theta) * dt;
      c.omega *= (1 - dt * 0.5);
      c.theta += c.omega * dt;
    }
    c.mesh.rotation.z = c.theta;
  }
  if (riding) {
    const c = riding;
    player.x = c.x + Math.sin(c.theta) * c.L;
    player.y = c.pivotY - Math.cos(c.theta) * c.L - 0.9;
    player.z = 0;
  }
}

function tryGrabCarcass() {
  if (riding || player.grounded || player.deck !== 2) return;
  for (const c of carcasses) {
    const bx = c.x + Math.sin(c.theta) * c.L, by = c.pivotY - Math.cos(c.theta) * c.L;
    if (Math.hypot(player.x - bx, player.y + 0.9 - by) < 1.3 && Math.abs(player.z) < 1.2) {
      riding = c;
      c.omega = Math.sign(player.vx || 1) * Math.max(0.4, Math.abs(player.vx) / c.L);
      player.vx = 0; player.vy = 0;
      return;
    }
  }
}
function releaseCarcass() {
  if (!riding) return;
  const c = riding; riding = null;
  const tangential = c.omega * c.L;
  player.vx = Math.cos(c.theta) * tangential * 1.35;
  player.vy = 6.2 + Math.abs(Math.sin(c.theta)) * 1.5;
  player.grounded = false;
  emitNoise(player.x, player.z, 3);
}

// the freezer's steward
const freezerSteward = makeSteward(98, 106);
function updateFreezerSteward(dt) { updateSteward(freezerSteward, dt); }

// deck-2 morsels
addMorsel(63.5, 0, -1.5);
addMorsel(100.5, 0, 1.0);
addMorsel(104.5, 0, -1.8);


// ---------------- deck 3: THE FEAST ----------------
const matFeastFloor = new THREE.MeshStandardMaterial({ color: 0x2b1814, roughness: 0.92 });
const matCloth = new THREE.MeshStandardMaterial({ color: 0x5a1715, roughness: 0.92 });
const matGrease = new THREE.MeshStandardMaterial({ color: 0x6d4b23, roughness: 0.35 });
const feastFog = new THREE.Color(0x170a08);
function setFeast(on) {
  if (!on) return;
  scene.fog.color.copy(feastFog); scene.background.copy(feastFog);
  scene.fog.density = 0.027;
}

const feastHides = [
  { x0: 126.0, x1: 133.0, z0: -1.15, z1: 1.15 },
  { x0: 139.0, x1: 146.0, z0: -1.15, z1: 1.15 },
  { x0: 152.0, x1: 159.0, z0: -1.15, z1: 1.15 },
  { x0: 165.0, x1: 171.5, z0: -1.15, z1: 1.15 },
];
hideVolumes.push(...feastHides);

{
  // Long red dining room, built at ten times the child's scale.
  solidBox(150, -0.25, 0, 62, 0.5, 8, matFeastFloor, { cast: false });
  const wall = new THREE.Mesh(new THREE.BoxGeometry(64, 17, 0.7), matWall); wall.position.set(150, 7.8, -3.5); scene.add(wall);
  const ceil = new THREE.Mesh(new THREE.BoxGeometry(64, 0.6, 10), matDark); ceil.position.set(150, 10.2, 0); scene.add(ceil);
  // Grimed portraits watch the feast.
  for (let x=124; x<178; x+=7) {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(3.0, 4.0, 0.18), matWood); frame.position.set(x, 6.5, -3.05); scene.add(frame);
    const face = new THREE.Mesh(new THREE.SphereGeometry(0.65, 8, 6), matPale); face.scale.set(0.8,1.4,0.25); face.position.set(x,6.5,-2.85); scene.add(face);
  }
  // Four connected banquet tables. Under each cloth is a hiding tunnel.
  for (const cx of [129.5,142.5,155.5,168.5]) {
    solidBox(cx, 3.15, 0, 7.4, 0.38, 3.0, matWoodPale, { platform: true });
    for (const lx of [-3.25,3.25]) for (const lz of [-1.2,1.2])
      solidBox(cx+lx, 1.45, lz, 0.42, 2.9, 0.42, matWood, { blocker: true });
    for (const z of [-1.53,1.53]) {
      const cloth = new THREE.Mesh(new THREE.BoxGeometry(7.3, 1.65, 0.08), matCloth); cloth.position.set(cx,2.35,z); scene.add(cloth);
    }
    // mountains of food and stacked plates
    for (let j=0;j<7;j++) {
      const food = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22+Math.random()*0.25), matGrease);
      food.scale.y=0.65; food.position.set(cx-2.6+j*0.85,3.5+(j%2)*0.1,(j%3-1)*0.65); scene.add(food);
    }
    for (const px of [cx-2.3,cx,cx+2.3]) {
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.48,0.1,12),matIron); plate.position.set(px,3.39,0.8); scene.add(plate);
    }
  }
  // Narrow gaps force exposed crossings between the tables.
  for (const x of [125.8,138.8,151.8,164.8,172.2]) {
    const chair = solidBox(x, 1.35, 2.05, 1.5, 0.22, 1.3, matWood, { platform: true });
    solidBox(x, 2.5, 2.58, 1.5, 2.2, 0.18, matWood, { blocker: true });
  }
  for (const lx of [123,136,149,162,175]) addLamp(lx,7.1,-0.3);
  // exit hatch
  const ef = new THREE.Mesh(new THREE.BoxGeometry(2.5,3.2,0.6),matIron); ef.position.set(178,1.6,-2.5); scene.add(ef);
  const em = new THREE.Mesh(new THREE.PlaneGeometry(1.8,2.45),new THREE.MeshBasicMaterial({color:0x020404})); em.position.set(178,1.5,-2.17); scene.add(em);
  const glow = new THREE.PointLight(0x8eb7a0,7,7,2); glow.position.set(177,2.2,-1.5); scene.add(glow);
}

// The Guests: seated mountains that only notice movement at their feet.
const guests = [];
function makeGuest(x,z,faceZ,phase) {
  const g = new THREE.Group();
  const belly = new THREE.Mesh(new THREE.SphereGeometry(1.45,14,10),matApron); belly.scale.set(1.0,1.25,0.9); belly.position.y=3.15; belly.castShadow=true; g.add(belly);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.68,12,9),matPale); head.scale.set(1.15,1.0,0.9); head.position.set(0,5.05,faceZ*0.32); head.castShadow=true; g.add(head);
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.20,0.09,6,10,Math.PI),new THREE.MeshStandardMaterial({color:0x2b0808})); mouth.rotation.x=Math.PI/2; mouth.rotation.z=faceZ>0?0:Math.PI; mouth.position.set(0,4.9,faceZ*0.93); g.add(mouth);
  const handGeo = new THREE.SphereGeometry(0.34,8,6);
  const handL = new THREE.Mesh(handGeo,matPale), handR = new THREE.Mesh(handGeo,matPale); g.add(handL,handR);
  g.position.set(x,0,z); scene.add(g);
  guests.push({mesh:g,x,z,faceZ,phase,state:'eat',reach:0,handL,handR,noticed:0});
}
for (let i=0;i<8;i++) {
  const x=128+i*6.1, side=i%2?1:-1;
  makeGuest(x,side*2.35,-side,i*0.83);
}

function guestCanReach(g) {
  if (player.deck!==3 || player.dead || player.win || player.hidden) return false;
  const dx=player.x-g.x, dz=player.z-g.z;
  // Running, landing, or a starving growl attracts a reach across the aisle.
  const noisy=Math.hypot(player.vx,player.vz)>2.0 || player.hunger<18;
  return Math.abs(dx)<2.25 && Math.abs(dz)<4.2 && (noisy || Math.hypot(dx,dz)<1.25);
}
function updateGuests(dt,t) {
  for (const g of guests) {
    g.phase+=dt;
    if (g.state==='eat' && guestCanReach(g)) { g.state='reach'; g.reach=0; g.noticed++; }
    if (g.state==='reach') {
      g.reach+=dt;
      const q=Math.min(1,g.reach/0.55), back=Math.max(0,Math.min(1,(1.25-g.reach)/0.45));
      const ext=Math.sin(Math.min(Math.PI,g.reach/1.15*Math.PI))*3.1;
      g.handL.position.set(-0.55,3.9,g.faceZ*(0.9+ext)); g.handR.position.set(0.55,3.8,g.faceZ*(0.7+ext*0.88));
      if (g.reach>0.36 && g.reach<1.0 && !player.hidden && Math.abs(player.x-g.x)<1.35 && Math.abs(player.z-(g.z+g.faceZ*ext))<1.1 && player.y<1.7) caught(g);
      if (g.reach>1.35) { g.state='chew'; g.reach=0.7; }
    } else {
      g.reach=Math.max(0,g.reach-dt);
      const chew=Math.sin(g.phase*5)*0.12;
      g.handL.position.set(-0.55,3.8,g.faceZ*(0.55+chew)); g.handR.position.set(0.55,3.75,g.faceZ*(0.85-chew));
      if (g.state==='chew') { g.reach-=dt; if(g.reach<=0) g.state='eat'; }
    }
    g.mesh.userData = g.mesh.userData || {};
    g.mesh.rotation.z=Math.sin(g.phase*1.7)*0.025;
  }
}

// morsels stolen from beneath the feast
addMorsel(130.5,0,-0.2); addMorsel(143.8,0,0.45); addMorsel(157.0,0,-0.55); addMorsel(170.0,0,0.2);


// ---------------- deck 4: THE NURSERY ----------------
const matNursery = new THREE.MeshStandardMaterial({color:0x27303a,roughness:0.95});
const matPorcelain = new THREE.MeshStandardMaterial({color:0xd8d8cf,roughness:0.34});
const matCrack = new THREE.MeshStandardMaterial({color:0x171a1a,roughness:0.8});
const nurseryFog = new THREE.Color(0x080b12);
const nurseryHides=[{x0:201,x1:204,z0:-2,z1:1.8},{x0:224,x1:227,z0:-2,z1:1.8}];
hideVolumes.push(...nurseryHides);
let nurseryTime=0, nurseryLightsOn=true, nurseryForced=null;
const nurseryLamps=[];
function setNursery(on){if(!on)return;scene.fog.color.copy(nurseryFog);scene.background.copy(nurseryFog);scene.fog.density=.03;nurseryTime=0;nurseryLightsOn=true;}
{
  solidBox(218,-.25,0,58,.5,8,matNursery,{cast:false});
  const wall=new THREE.Mesh(new THREE.BoxGeometry(60,15,.7),matWall);wall.position.set(218,7,-3.5);scene.add(wall);
  const ceil=new THREE.Mesh(new THREE.BoxGeometry(60,.6,10),matDark);ceil.position.set(218,9,0);scene.add(ceil);
  // child-scale beds become towering barred cages.
  for(const cx of [196,211,233]){
    solidBox(cx,.65,-1.45,5,1.3,2.3,matWood,{platform:true,blocker:true});
    for(let k=-2;k<=2;k++){const bar=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,2.2,5),matIron);bar.position.set(cx+k*.95,1.75,-.35);scene.add(bar);}
  }
  // toy chests provide hiding pockets.
  for(const cx of [202.5,225.5]){
    solidBox(cx,.65,.5,3,1.3,2.3,matWoodPale,{blocker:true});
    const lid=new THREE.Mesh(new THREE.BoxGeometry(3.2,.18,2.5),matWood);lid.position.set(cx,1.6,.15);lid.rotation.x=-.35;scene.add(lid);
  }
  // scattered blocks, horses and staring heads.
  for(let i=0;i<18;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(.4+.2*(i%3),.4+.15*(i%2),.5),i%2?matWoodPale:matCloth);b.position.set(192+i*2.9,.25,(i%5-2)*.75);b.rotation.y=i*.7;scene.add(b);}
  for(const lx of [194,207,220,234,242]){
    const shade=new THREE.Mesh(new THREE.ConeGeometry(.52,.5,10,1,true),matIron);shade.position.set(lx,6,-.3);shade.rotation.x=Math.PI;scene.add(shade);
    const pt=new THREE.PointLight(0xcddcff,22,11,1.8);pt.position.set(lx,5.7,-.3);scene.add(pt);nurseryLamps.push(pt);
  }
  const door=new THREE.Mesh(new THREE.BoxGeometry(2.5,3.3,.6),matIron);door.position.set(245,1.65,-2.5);scene.add(door);
  const mouth=new THREE.Mesh(new THREE.PlaneGeometry(1.8,2.55),new THREE.MeshBasicMaterial({color:0x010205}));mouth.position.set(245,1.5,-2.17);scene.add(mouth);
}

const dolls=[];
function addDoll(x,z,phase){
 const g=new THREE.Group();
 const dress=new THREE.Mesh(new THREE.ConeGeometry(.42,.95,8),new THREE.MeshStandardMaterial({color:phase%2?0x35445a:0x49333e,roughness:.9}));dress.position.y=.5;g.add(dress);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.25,12,9),matPorcelain);head.position.y=1.18;head.castShadow=true;g.add(head);
 const eyeGeo=new THREE.SphereGeometry(.035,6,5), eyeL=new THREE.Mesh(eyeGeo,matCrack),eyeR=new THREE.Mesh(eyeGeo,matCrack);eyeL.position.set(.22,1.23,.07);eyeR.position.set(.22,1.23,-.07);g.add(eyeL,eyeR);
 const crack=new THREE.Mesh(new THREE.BoxGeometry(.02,.24,.02),matCrack);crack.position.set(.245,1.08,.02);crack.rotation.x=.45;g.add(crack);
 g.position.set(x,0,z);scene.add(g);dolls.push({mesh:g,x,z,homeX:x,phase,state:'still',steps:0});
}
for(const d of [[198,1.4,0],[205,-1.5,1],[214,1.2,2],[222,-1.3,3],[230,1.5,4],[238,-1.1,5],[241,1.4,6]])addDoll(...d);
function childWatches(d){
 const dx=d.x-player.x,dz=d.z-player.z,dist=Math.hypot(dx,dz);
 if(dist>11||player.hidden)return false;
 if(Math.sign(dx)!==player.face&&Math.abs(dx)>.8)return false;
 return Math.abs(dz)<3.2;
}
function updateNursery(dt,t){
 nurseryTime+=dt;
 const cycle=nurseryTime%10.5;
 nurseryLightsOn=nurseryForced===null?cycle<6.8:!!nurseryForced;
 for(const l of nurseryLamps){l.intensity=nurseryLightsOn?22*(.9+.1*Math.sin(t*17+l.position.x)):0.22;}
 for(const d of dolls){
  const watched=childWatches(d), canMove=!nurseryLightsOn&&!watched&&!player.dead&&!player.win;
  d.state=canMove?'creep':(watched?'watched':'still');
  if(canMove){
   const dx=player.x-d.x,dz=player.z-d.z,dd=Math.hypot(dx,dz)||1;
   d.x+=dx/dd*2.15*dt;d.z+=dz/dd*2.15*dt;d.steps++;
  }
  const dist=Math.hypot(player.x-d.x,player.z-d.z);
  if(dist<.78&&!player.hidden&&!player.dead) caught(d);
  d.mesh.position.set(d.x,Math.abs(Math.sin(t*8+d.phase))*(canMove?.045:0),d.z);
  d.mesh.rotation.y=Math.atan2(player.z-d.z,player.x-d.x)-Math.PI/2;
 }
}
addMorsel(203,0,-.5);addMorsel(218,0,1.5);addMorsel(232,0,-.2);addMorsel(241,0,.4);


// ---------------- deck 5: THE BATHS ----------------
const matTile=new THREE.MeshStandardMaterial({color:0x496163,roughness:.52});
const matWater=new THREE.MeshPhysicalMaterial({color:0x173f45,transparent:true,opacity:.72,roughness:.18,metalness:.05});
const bathsFog=new THREE.Color(0x071316), ripples=[];
let bathNoiseCount=0, bathCaughtCount=0;
function setBaths(on){if(!on)return;scene.fog.color.copy(bathsFog);scene.background.copy(bathsFog);scene.fog.density=.025;}
{
 solidBox(284.5,-.25,0,61,.5,8,matTile,{cast:false});
 const wall=new THREE.Mesh(new THREE.BoxGeometry(63,16,.7),matWall);wall.position.set(284.5,7.5,-3.5);scene.add(wall);
 const ceil=new THREE.Mesh(new THREE.BoxGeometry(63,.6,10),matDark);ceil.position.set(284.5,9.5,0);scene.add(ceil);
 // ankle-deep water plane over the whole room
 const water=new THREE.Mesh(new THREE.PlaneGeometry(61,8,24,4),matWater);water.rotation.x=-Math.PI/2;water.position.set(284.5,.13,0);scene.add(water);
 // monumental tubs and pipework
 for(const cx of [264,280,297]){
  solidBox(cx,1.15,-1.35,7,2.3,2.4,matPale,{platform:true,blocker:true});
  const basin=new THREE.Mesh(new THREE.BoxGeometry(5.7,.3,1.7),matIron);basin.position.set(cx,2.32,-1.35);scene.add(basin);
 }
 for(const x of [259,271,287,304]){const pipe=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,8,8),matIron);pipe.position.set(x,4.3,-2.9);scene.add(pipe);}
 for(const x of [258,273,288,303]){const pt=new THREE.PointLight(0x9fdfe0,13,12,1.9);pt.position.set(x,5.2,-.2);scene.add(pt);}
 // dry laundry carts are hiding islands
 for(const cx of [270,292,306]){solidBox(cx,.7,1.1,3.2,1.4,2.2,matWood,{blocker:true});hideVolumes.push({x0:cx-1.45,x1:cx+1.45,z0:.1,z1:2.05});}
 const drain=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,.08,24),matIron);drain.position.set(313,.04,-1.5);scene.add(drain);
}
const thing={x:267,z:0,tx:267,tz:0,state:'listen',wait:0,ripplesFollowed:0,mesh:null};
{
 const g=new THREE.Group();
 const back=new THREE.Mesh(new THREE.SphereGeometry(1.15,18,10),new THREE.MeshStandardMaterial({color:0x102b2c,roughness:.2}));back.scale.set(1.8,.22,.8);g.add(back);
 for(let i=0;i<5;i++){const fin=new THREE.Mesh(new THREE.ConeGeometry(.13,.8,6),matDark);fin.position.set(-.7+i*.35,.05,0);fin.rotation.z=.3;g.add(fin);}g.position.set(thing.x,.06,thing.z);scene.add(g);thing.mesh=g;
}
function bathRipple(x,z,r=1){
 bathNoiseCount++; const mesh=new THREE.Mesh(new THREE.RingGeometry(.12,.17,24),new THREE.MeshBasicMaterial({color:0xb3eef0,transparent:true,opacity:.7,side:THREE.DoubleSide}));mesh.rotation.x=-Math.PI/2;mesh.position.set(x,.16,z);scene.add(mesh);ripples.push({mesh,x,z,age:0,r});thing.tx=x;thing.tz=z;thing.state='follow';thing.ripplesFollowed++;
}
function updateBaths(dt,t){
 const spd=Math.hypot(player.vx,player.vz);
 if(player.grounded&&spd>.25&&!player.hidden){player.splashAcc=(player.splashAcc||0)+dt;const gap=player.sneak?.85:.32;if(player.splashAcc>gap){player.splashAcc=0;bathRipple(player.x,player.z,player.sneak?2.5:8);}}
 for(let i=ripples.length-1;i>=0;i--){const r=ripples[i];r.age+=dt;const q=r.age*2.4;r.mesh.scale.setScalar(1+q*r.r);r.mesh.material.opacity=Math.max(0,.7-r.age*.42);if(r.age>1.7){scene.remove(r.mesh);ripples.splice(i,1);}}
 if(thing.state==='follow'){
  const dx=thing.tx-thing.x,dz=thing.tz-thing.z,d=Math.hypot(dx,dz);if(d>.15){thing.x+=dx/d*2.65*dt;thing.z+=dz/d*2.65*dt;}else{thing.state='listen';thing.wait=1.2;}
 }else{thing.wait-=dt;if(thing.wait<=0){thing.x+=Math.sin(t*.6)*.12*dt;}}
 thing.mesh.position.set(thing.x,.05+Math.sin(t*3)*.025,thing.z);thing.mesh.rotation.y=Math.atan2(thing.tz-thing.z,thing.tx-thing.x);
 if(!player.hidden&&!player.dead&&Math.hypot(player.x-thing.x,player.z-thing.z)<1.0&&player.y<1.4){bathCaughtCount++;caught(thing);}
}
addMorsel(265,2.3,-1.2);addMorsel(278,0,1.6);addMorsel(298,2.3,-1.2);addMorsel(307,0,-.3);

// ---------------- QA hooks ----------------
window.__frames = 0;
window.__ut = {
  v: 6,
  player: () => ({ x: +player.x.toFixed(2), y: +player.y.toFixed(2), z: +player.z.toFixed(2), hunger: +player.hunger.toFixed(1), hidden: player.hidden, sneak: player.sneak, grounded: player.grounded, caught: player.caught, win: player.win, dead: player.dead, growled: player.growled || 0 }),
  stewards: () => stewards.map(s => ({ x: +s.x.toFixed(2), z: +s.z.toFixed(2), state: s.state })),
  noises: () => noiseEvents.length,
  morselsLeft: () => morsels.filter(m => !m.taken).length,
  ground: (x, z) => surfaceAt(x, z, Infinity),
  tp: (x, z = 0, y = null) => { player.x = x; player.z = z; player.y = (y === null ? surfaceAt(x, z, Infinity) : y); player.vy = 0; player.grounded = true; },
  tpAir: (x, z = 0, y = 4) => { player.x = x; player.z = z; player.y = y; player.vy = 0; player.grounded = false; },
  stewardTp: (i, x) => { stewards[i].x = x; stewards[i].z = 0; },
  stewardHome: (i) => { stewards[i].x = stewards[i].home; stewards[i].z = 0; stewards[i].state = 'patrol'; },
  setHunger: (v) => { player.hunger = v; },
  hide: () => { if (inHideVolume(player.x, player.z)) player.hidden = true; },
  unhide: () => { player.hidden = false; },
  eat: () => tryInteract(),
  key: (code, downUp) => { keys[code] = downUp; if (!started) { started = true; document.getElementById('msg').innerHTML = ''; } if (code === 'Space' && downUp) player.buffer = 0.12; },
  start: () => { started = true; document.getElementById('msg').innerHTML = ''; },
  inHide: (x, z) => inHideVolume(x, z),
  watchman: () => ({ x: +watchman.x.toFixed(2), state: watchman.state, face: watchman.face }),
  watchmanTp: (x) => { watchman.x = x; },
  watchmanSees: () => watchmanSees(),
  watchmanBlind: (b) => { watchman.blind = !!b; },
  watchmanFace: (f) => { watchman.face = f; },
  watchmanSet: (state, wait = 999) => { watchman.state = state; watchman.wait = wait; },
  nomes: () => nomes.map(n => ({ x: +n.x.toFixed(2), state: n.state })),
  crate: () => ({ x: +pushCrate.x.toFixed(2), top: pushCrate.s }),
  deck: () => player.deck,
  carcasses: () => carcasses.map(c => ({ x: c.x, theta: +c.theta.toFixed(2), omega: +c.omega.toFixed(2) })),
  riding: () => (riding ? carcasses.indexOf(riding) : -1),
  grab: () => tryGrabCarcass(),
  release: () => releaseCarcass(),
  freezerSteward: () => ({ x: +freezerSteward.x.toFixed(2), state: freezerSteward.state }),
  guests: () => guests.map(g => ({ x:+g.x.toFixed(2), z:+g.z.toFixed(2), state:g.state, noticed:g.noticed })),
  guestCanReach: (i) => guestCanReach(guests[i]),
  guestReset: () => { for(const g of guests){g.state='eat';g.reach=0;} },
  dolls: () => dolls.map(d=>({x:+d.x.toFixed(2),z:+d.z.toFixed(2),state:d.state,steps:d.steps})),
  nurseryLights: () => nurseryLightsOn,
  nurseryForce: (on) => { nurseryForced=on===null?null:!!on; },
  watches: (i) => childWatches(dolls[i]),
  face: (f) => { player.face=f<0?-1:1; },
  bathThing: () => ({x:+thing.x.toFixed(2),z:+thing.z.toFixed(2),state:thing.state,followed:thing.ripplesFollowed,caught:bathCaughtCount}),
  bathRipple: (x,z,r=8) => bathRipple(x,z,r),
  bathNoises: () => bathNoiseCount,
};
