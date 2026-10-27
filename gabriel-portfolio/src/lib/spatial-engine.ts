import { journeyFrame } from "./JourneyController.mjs";
import {visual} from "@/config/visual";
import * as T from "three";
import {
  advance,
  advanceScroll,
  scrollDestination,
  areaAt,
  destinations,
  easeJourney,
  JOURNEY_END,
} from "./spatial-motion.mjs";
import { environments, spatialExhibits } from "@/data/site";

export type NavigationMode = "walk" | "scroll";

export type SpatialSnapshot = {
  navigationMode: NavigationMode;
  avatarZ: number;
  worldZ: number;
  progress: number;
  distance: number;
  paused: boolean;
  x: number;
  area: number;
  moving: boolean;
  transitioning: boolean;
  loaded: boolean[];
  hotspots: { id: string; x: number; y: number }[];
  drawCalls: number;
  triangles: number;
  cameraZ: number;
};
export type SpatialOptions = {
  initialDistance: number;
  navigationMode: NavigationMode;
  reduced: boolean;
  paused: boolean;
  onUpdate: (s: SpatialSnapshot) => void;
  onReady: () => void;
  onError: (message: string) => void;
};

/** A small, disposable Three.js scene. No external models, textures or postprocessing. */
export function createSpatialWorld(host: HTMLElement, options: SpatialOptions) {
  const scene = new T.Scene();
  scene.background = new T.Color(visual.mist);
  scene.fog = new T.Fog(visual.mist, 22, 74);
  const renderer = new T.WebGLRenderer({
    antialias: host.clientWidth > 700,
    powerPreference: "low-power",
    alpha: false,
  });
  renderer.setPixelRatio(
    Math.min(devicePixelRatio, host.clientWidth < 700 ? 1.25 : 1.5),
  );
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = host.clientWidth > 700;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.setClearColor(visual.mist);
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);
  const camera = new T.PerspectiveCamera(52, 1, 0.1, 110);
  scene.add(new T.HemisphereLight("#f4f2df", "#566f76", 2.6));
  const sun = new T.DirectionalLight("#fff1d6", 3);
  sun.position.set(-12, 20, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -14;
  sun.shadow.camera.right = 14;
  sun.shadow.camera.top = 16;
  sun.shadow.camera.bottom = -16;
  sun.shadow.bias = -0.001;
  scene.add(sun);
  const boxGeometry = new T.BoxGeometry(1, 1, 1);
  let lowQuality=false;
  const mats = new Map<string, T.MeshStandardMaterial|T.MeshLambertMaterial>();
  const resources: T.Texture[] = [];
  const grainData = new Uint8Array(64 * 64 * 4);
  let seed = 17;
  for (let i = 0; i < grainData.length; i += 4) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const v = 180 + (seed % 65);
    grainData[i] = grainData[i + 1] = grainData[i + 2] = v;
    grainData[i + 3] = 255;
  }
  const grain = new T.DataTexture(grainData, 64, 64);
  grain.wrapS = grain.wrapT = T.RepeatWrapping;
  grain.repeat.set(4, 4);
  grain.needsUpdate = true;
  resources.push(grain);
  const material = (color: string) => {
    if (!mats.has(color))
      mats.set(
        color,
        lowQuality?new T.MeshLambertMaterial({color}):new T.MeshStandardMaterial({
          color,
          bumpMap: grain,
          bumpScale: 0.012,
          roughness: color === "#a58e61" ? 0.38 : 0.88,
          metalness: color === "#a58e61" ? 0.65 : 0.02,
        }),
      );
    return mats.get(color)!;
  };
  function box(
    parent: T.Object3D,
    color: string,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
  ) {
    const mesh = new T.Mesh(boxGeometry, material(color));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.set(x, y, z);
    mesh.scale.set(w, h, d);
    parent.add(mesh);
    return mesh;
  }
  function sign(
    parent: T.Object3D,
    text: string,
    subtitle: string,
    x: number,
    y: number,
    z: number,
    width = 4,
    color = "#e8e3d6",
  ) {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1024, 256);
    ctx.fillStyle = "#172630";
    ctx.font = "500 26px Arial";
    ctx.fillText(subtitle.toUpperCase(), 60, 70);
    ctx.font = "bold 76px Arial";
    ctx.fillText(text, 56, 178, 910);
    const texture = new T.CanvasTexture(canvas);
    texture.colorSpace = T.SRGBColorSpace;
    resources.push(texture);
    const m = new T.MeshBasicMaterial({ map: texture });
    const mesh = new T.Mesh(new T.PlaneGeometry(width, width / 4), m);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }
  function batchArchitecture(root:T.Group,exclude?:T.Object3D){
    root.updateWorldMatrix(true,true);const inverse=root.matrixWorld.clone().invert();
    const groups=new Map<T.Material,T.Mesh[]>();root.traverse(o=>{if(o instanceof T.Mesh&&!(o instanceof T.InstancedMesh)&&o!==exclude&&o.geometry===boxGeometry&&!Array.isArray(o.material)){const list=groups.get(o.material)||[];list.push(o);groups.set(o.material,list)}});
    groups.forEach((meshes,mat)=>{if(meshes.length<2)return;const batch=new T.InstancedMesh(boxGeometry,mat,meshes.length);const matrix=new T.Matrix4();meshes.forEach((mesh,i)=>{matrix.multiplyMatrices(inverse,mesh.matrixWorld);batch.setMatrixAt(i,matrix);mesh.removeFromParent()});batch.castShadow=true;batch.receiveShadow=true;batch.computeBoundingSphere();root.add(batch)});
  }
  const world = new T.Group();
  scene.add(world);
  box(world, "#667e7e", 0, -0.6, -31, 95, 0.5, 400);
  box(world, "#d9d4c6", 0, -0.15, -9, 16, 0.3, 28);
  box(world, "#b7b4a6", 0, -0.15, -30, 4.5, 0.3, 14);
  // Guiding brass inlay, low bridge railings and a shared level floor.
  for (const x of [-0.95, 0.95])
    box(world, "#a58e61", x, 0.015, -30, 0.035, 0.03, 340);
  for (const x of [-2.25, 2.25]) {
    box(world, "#a7afa6", x, 0.5, -30, 0.12, 0.1, 16);
    for (let z = 23; z <= 37; z += 2)
      box(world, "#a7afa6", x, 0.25, -z, 0.08, 0.5, 0.08);
  }
  // Atrium: limestone colonnade, open sky and rounded portals.
  const atrium = new T.Group();
  world.add(atrium);
  for (const x of [-6.4, 6.4]) {
    box(atrium, "#ece5d4", x, 2.65, -8, 0.75, 5.3, 27);
    for (let z = -1; z >= -21; z -= 5) {
      box(atrium, "#ded5c3", x > 0 ? 5.45 : -5.45, 2.4, z, 0.65, 4.8, 0.75);
      box(atrium, "#e8e0ce", 0, 5, z, 12.2, 0.4, 0.8);
    }
  }
  function arch(z: number) {
    for (const x of [-2.8, 2.8])
      box(atrium, "#d1c6af", x, 1.8, z, 0.55, 3.6, 0.7);
    const curve = new T.Mesh(
      new T.TorusGeometry(2.8, 0.27, 6, 32, Math.PI),
      material("#d1c6af"),
    );
    curve.position.set(0, 3.5, z);
    atrium.add(curve);
  }
  arch(-4);
  arch(-20);
  sign(atrium, "GABRIEL.", "01 / Átrio de ideias", 0, 3.7, -13, 5.2);
  for (const [x, z] of [
    [-3.7, -12],
    [3.7, -16],
  ]) {
    box(atrium, "#b4a68a", x, 0.6, z, 1.6, 1.2, 1.6);
    box(atrium, "#eee6d5", x, 1.5, z, 1.8, 0.16, 1.8);
    const sculpture = new T.Mesh(
      new T.TorusKnotGeometry(0.45, 0.12, 40, 6),
      material("#8b7755"),
    );
    sculpture.position.set(x, 2.1, z);
    atrium.add(sculpture);
  }
  // Distant workshop outline first; full room is constructed only on approach.
  const outline = box(world, "#354a50", 0, 2.4, -59, 14, 4.8, 0.4);
  const loaded = [true, true, false, false, false, false];
  let workshop: T.Group | null = null;
  function loadWorkshop() {
    if (loaded[2]) return;
    loaded[2] = true;
    world.remove(outline);
    workshop = new T.Group();
    world.add(workshop);
    box(workshop, "#46575a", 0, -0.15, -54, 16, 0.3, 34);
    for (const x of [-6.4, 6.4]) {
      box(workshop, "#253b42", x, 2.6, -54, 0.5, 5.2, 34);
      for (let z = 39; z <= 69; z += 5) {
        box(workshop, "#243a40", x, 2.9, -z, 0.3, 5.8, 0.3);
        box(workshop, "#324b50", 0, 5.5, -z, 13, 0.25, 0.35);
      }
    }
    for (let z = 40; z <= 69; z += 6) {
      const roof = box(workshop, "#607a7a", 0, 5.9, -z, 13, 0.18, 3.6);
      roof.rotation.x = -0.14;
      box(workshop, "#b3c3bc", 0, 5.7, -z - 2.2, 13, 0.08, 0.6);
    }
    box(workshop, "#263d45", 0, 2.5, -71, 13, 5, 0.4);
    sign(
      workshop,
      "ATELIER",
      "02 / Ideias em construção",
      0,
      3.5,
      -64,
      6,
      "#c9d8d0",
    );
    for (const [x, z] of [
      [-3.7, -51],
      [3.7, -57],
    ]) {
      box(workshop, "#9c7555", x, 0.65, z, 1.6, 1.3, 1.6);
      box(workshop, "#d4c9ac", x, 1.35, z, 2, 0.12, 1.8);
      const screen = box(workshop, "#182c35", x, 2, z, 1.6, 1, 0.12);
      screen.rotation.x = -0.12;
      box(workshop, "#9bc3b9", x, 2.02, z + 0.08, 1.35, 0.74, 0.05);
    }
    for (const x of [-5.4, 5.4])
      for (let z = 43; z < 67; z += 8)
        box(workshop, "#b29c71", x, 0.025, -z, 0.08, 0.03, 3);
    batchArchitecture(workshop);
  }
  const extraRooms = new Map<number, T.Group>();
  function buildRoom(index: number) {
    if (loaded[index] && extraRooms.has(index)) return;
    const center = destinations[index];
    const room = new T.Group();
    world.add(room);
    extraRooms.set(index, room);
    loaded[index] = true;
    const dark = index === 4,
      floor = dark ? "#223748" : "#d7d0c0";
    box(
      room,
      floor,
      0,
      index === 1 || index === 3 ? -0.14 : -0.15,
      -center,
      16,
      0.3,
      30,
    );
    for (const x of [-7, 7]) {
      box(room, dark ? "#101f2c" : "#e5ded0", x, 2, -center, 0.35, 4, 30);
      for (let d = -12; d <= 12; d += 6) {
        box(room, "#a58e61", x * 0.85, 2.3, -center + d, 0.12, 4.6, 0.12);
      }
    }
    if (index === 1) {
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const col = new T.Mesh(
          new T.CylinderGeometry(0.18, 0.22, 4.6, 12),
          material("#e8e0ce"),
        );
        col.position.set(
          Math.cos(angle) * 6,
          2.3,
          -center + Math.sin(angle) * 9,
        );
        col.castShadow = true;
        room.add(col);
      }
    }
    if (index === 3) {
      for (let i = 0; i < 3; i++) {
        const x = i % 2 ? -4 : 4,
          z = -(80 + i * 5);
        box(room, "#a58e61", x, 2, z, 3.2, 2.3, 0.16);
        box(room, "#101f2c", x, 2, z + 0.1, 3, 2.1, 0.12);
        const slug = [
          "conceito-landing",
          "conceito-portfolio",
          "conceito-site",
        ][i];
        const texture = new T.TextureLoader().load(
          `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/concepts/${slug}.png`,
          () => {
            if (!disposed) renderer.render(scene, camera);
          },
        );
        texture.colorSpace = T.SRGBColorSpace;
        resources.push(texture);
        const preview = new T.Mesh(
          new T.PlaneGeometry(2.85, 1.85),
          new T.MeshBasicMaterial({ map: texture }),
        );
        preview.position.set(x, 2, z + 0.18);
        room.add(preview);
      }
    }
    if (index === 4) {
      for (let i = 0; i < 5; i++) {
        box(room, "#a58e61", -4 + i * 2, 0.6, -center - 5, 0.9, 1.2, 0.9);
        box(room, "#9bb8af", -4 + i * 2, 1.35, -center - 5, 0.8, 0.18, 0.8);
      }
      for (let z = -12; z <= 12; z += 6)
        box(room, "#324b50", 0, 5, -center + z, 14, 0.2, 0.3);
    }
    if (index === 5) {
      const ring = new T.Mesh(
        new T.TorusGeometry(4, 0.16, 12, 64, Math.PI),
        material("#a58e61"),
      );
      ring.position.set(0, 3, -center - 7);
      room.add(ring);
      for (const x of [-4, 4])
        box(room, "#a58e61", x, 1.5, -center - 7, 0.25, 3, 0.25);
      box(room, "#a58e61", 0, 0.02, -center, 8, 0.04, 8);
    }
    sign(
      room,
      index === 1
        ? "ESTRUTURA"
        : index === 3
          ? "GALERIA"
          : index === 4
            ? "PROCESSO"
            : "VAMOS CRIAR",
      environments[index].name,
      0,
      3.8,
      -center - 10,
      5.5,
    );
    for (const exhibit of spatialExhibits.filter((e) => e.area === index)) {
      box(
        room,
        dark ? "#53666a" : "#b8ab92",
        exhibit.position[0],
        0.6,
        -exhibit.position[2],
        1.8,
        1.2,
        1.4,
      );
    }
    batchArchitecture(room);
  }
  buildRoom(1);
  box(world, "#d7d0c0", 0, -0.16, -98.5, 6, 0.3, 3);
  box(world, "#d7d0c0", 0, -0.16, -128.5, 6, 0.3, 3);
  batchArchitecture(world,outline);
  // Gabriel: original low-poly rig, dark clothing, short hair and a long beard.
  const avatar = new T.Group();
  scene.add(avatar);
  const rig = new T.Group();
  avatar.add(rig);
  const skin = "#c49d80",
    cloth = "#223b4b";
  const torso = new T.Mesh(
    new T.CapsuleGeometry(0.29, 0.45, 6, 14),
    material(cloth),
  );
  torso.scale.z = 0.72;
  torso.position.y = 1.17;
  torso.castShadow = true;
  rig.add(torso);
  box(rig, "#b49a68", 0, 1.25, -0.205, 0.2, 0.035, 0.02);
  const head = new T.Mesh(new T.SphereGeometry(0.27, 12, 10), material(skin));
  head.scale.set(1, 1.15, 0.9);
  head.position.set(0, 1.88, 0);
  rig.add(head);
  const hair = new T.Mesh(
    new T.SphereGeometry(0.275, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.48),
    material("#4b443c"),
  );
  hair.position.set(0, 1.99, 0);
  rig.add(hair);
  const beard = new T.Mesh(
    new T.SphereGeometry(0.25, 18, 16),
    material("#51463d"),
  );
  beard.scale.set(1, 1.45, 0.65);
  beard.position.set(0, 1.61, -0.16);
  beard.castShadow = true;
  rig.add(beard);
  for (let i = 0; i < 9; i++) {
    const strand = new T.Mesh(
      new T.CapsuleGeometry(0.012, 0.15, 3, 5),
      material(i % 3 ? "#776b5e" : "#b3a697"),
    );
    strand.position.set((i - 4) * 0.044, 1.47 + Math.abs(i - 4) * 0.025, -0.3);
    strand.rotation.z = (i - 4) * 0.08;
    rig.add(strand);
  }
  for (const x of [-0.1, 0.1])
    box(rig, "#9bbbc6", x, 1.91, -0.237, 0.055, 0.04, 0.035);
  const limbs: T.Group[] = [];
  for (const side of [-1, 1]) {
    const leg = new T.Group();
    leg.position.set(side * 0.19, 0.84, 0);
    const trouser = new T.Mesh(
      new T.CapsuleGeometry(0.12, 0.46, 4, 10),
      material("#334c5a"),
    );
    trouser.position.y = -0.35;
    trouser.castShadow = true;
    leg.add(trouser);
    box(leg, "#192d35", 0, -0.71, -0.075, 0.28, 0.16, 0.43);
    rig.add(leg);
    limbs.push(leg);
  }
  for (const side of [-1, 1]) {
    const arm = new T.Group();
    arm.position.set(side * 0.43, 1.46, 0);
    const sleeve = new T.Mesh(
      new T.CapsuleGeometry(0.1, 0.39, 4, 10),
      material(cloth),
    );
    sleeve.position.y = -0.29;
    sleeve.castShadow = true;
    arm.add(sleeve);
    box(arm, skin, 0, -0.63, 0, 0.17, 0.14, 0.18);
    rig.add(arm);
    limbs.push(arm);
  }
  const shadow = new T.Mesh(
    new T.CircleGeometry(0.6, 20),
    new T.MeshBasicMaterial({
      color: "#101e25",
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
    }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.012;
  avatar.add(shadow);
  let state = {
    x: 0,
    distance: Math.max(0, Math.min(JOURNEY_END, options.initialDistance)),
    vx: 0,
    vz: 0,
  };
  let paused = options.paused,
    reduced = options.reduced,
    disposed = false,
    raf = 0,
    last = 0,
    lastPublish = 0,
    phase = 0,
    first = true,
    pendingPublish = true;
  let transition: null | {
    from: number;
    fromX: number;
    to: number;
    elapsed: number;
  } = null;
  let navigationMode = options.navigationMode,
    scrollTarget = state.distance,
    guidedActive = false;
  let anchor = { x: state.x, d: state.distance };
  const input = { x: 0, forward: 0 };
  const look = new T.Vector3(),
    desired = new T.Vector3(),
    projected = new T.Vector3();
  camera.position.set(
    1.4,
    host.clientHeight < 600 ? 5.3 : 4.1,
    -state.distance + (host.clientHeight < 600 ? 10.5 : 8.4),
  );
  camera.lookAt(0, host.clientHeight < 600 ? -1.3 : 0.4, -state.distance - 5);
  function resize() {
    if (disposed) return;
    pendingPublish = true;
    const width = host.clientWidth,
      height = host.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / Math.max(1, height);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();
  function contextLost(e: Event) {
    e.preventDefault();
    if (!disposed) {
      paused = true;
      options.onError(
        "A conexão gráfica foi interrompida. Reabra a jornada ou continue no modo clássico.",
      );
    }
  }
  renderer.domElement.addEventListener("webglcontextlost", contextLost);
  let slowFrames=0;
  function update(now: number) {
    if (disposed) return;
    raf = requestAnimationFrame(update);
    const elapsed = Math.min((now - last) / 1000 || 0, 0.25),
      dt = Math.min(elapsed, 0.05);
    last = now;
    if(elapsed>.045&&!paused){slowFrames++;}else slowFrames=Math.max(0,slowFrames-1);
    if(slowFrames>=6&&(renderer.getPixelRatio()>.7||renderer.shadowMap.enabled)){
      renderer.shadowMap.enabled=false;renderer.setPixelRatio(Math.max(.65,renderer.getPixelRatio()*.75));renderer.setSize(host.clientWidth,host.clientHeight);mats.forEach(m=>m.needsUpdate=true);slowFrames=0;pendingPublish=true;
    }

    const hidden = document.hidden;
    const wasTransition = !!transition;
    const previousX = state.x,
      previousD = state.distance;
    if (!paused && !hidden) {
      if (transition) {
        transition.elapsed += elapsed;
        const t = reduced ? 1 : Math.min(transition.elapsed / 1.65, 1),
          ease = easeJourney((t - 0.2) / 0.8);
        state = {
          x: transition.fromX * (1 - easeJourney(t / 0.2)),
          distance: transition.from + (transition.to - transition.from) * ease,
          vx: 0,
          vz: 0,
        };
        if (t === 1) {
          transition = null;
          scrollTarget = state.distance;
          guidedActive = false;
        }
      } else if (navigationMode === "scroll" && guidedActive) {
        state = advanceScroll(state, scrollTarget, dt, reduced);
        if (
          Math.abs(state.distance - scrollTarget) < 0.0001 &&
          Math.abs(state.x) < 0.0001 &&
          Math.abs(state.vx) + Math.abs(state.vz) < 0.01
        )
          guidedActive = false;
      } else state = advance(state, input, dt);
    }
    if (state.distance > 28) loadWorkshop();
    for (const i of [3, 4, 5])
      if (state.distance > destinations[i] - 24) buildRoom(i);
    const scrollMode = navigationMode === "scroll";
    world.position.z = journeyFrame(
      state.distance,
      anchor.d,
      navigationMode,
    ).worldZ;
    const moving =
      navigationMode === "walk" &&
      !transition &&
      !paused &&
      Math.abs(state.x - previousX) + Math.abs(state.distance - previousD) >
        0.00001;
    if (moving && !reduced) phase += dt * 9;
    for (let i = 0; i < limbs.length; i++)
      limbs[i].rotation.x =
        moving && !reduced ? Math.sin(phase + (i % 2 ? Math.PI : 0)) * 0.42 : 0;
    avatar.position.set(
      scrollMode ? anchor.x : state.x,
      moving && !reduced ? Math.abs(Math.sin(phase)) * 0.035 : 0,
      scrollMode ? -anchor.d : -state.distance,
    );
    if (moving) {
      const target = Math.atan2(-state.vx, state.vz);
      let diff = target - avatar.rotation.y;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      avatar.rotation.y += diff * (reduced ? 1 : 1 - Math.exp(-9 * dt));
    }
    const shortView = host.clientHeight < 600;
    desired.set(
      (scrollMode ? anchor.x : state.x) * 0.6 + 1.4,
      shortView ? 5.3 : 4.1,
      -(scrollMode ? anchor.d : state.distance) + (shortView ? 10.5 : 8.4),
    );
    const cameraMoving = camera.position.distanceToSquared(desired) > 0.00005;
    if (!paused && !hidden) {
      camera.position.lerp(desired, reduced ? 1 : 1 - Math.exp(-5.4 * dt));
      look.set(
        (scrollMode ? anchor.x : state.x) * 0.5,
        shortView ? -1.3 : 0.4,
        -(scrollMode ? anchor.d : state.distance) - 5,
      );
      sun.position.set(-12, 20, (scrollMode ? -anchor.d : -state.distance) + 8);
      sun.target.position.set(0, 0, scrollMode ? -anchor.d : -state.distance);
      scene.add(sun.target);
      camera.lookAt(look);
    }
    if (
      !hidden &&
      (first ||
        (!paused &&
          (moving ||
            transition ||
            cameraMoving ||
            previousX !== state.x ||
            previousD !== state.distance)))
    ) {
      renderer.render(scene, camera);
    }
    if (
      first ||
      moving ||
      transition ||
      cameraMoving ||
      previousX !== state.x ||
      previousD !== state.distance
    )
      pendingPublish = true;
    if (wasTransition !== !!transition) pendingPublish = true;
    if (first || (pendingPublish && now - lastPublish > 100)) {
      lastPublish = now;
      pendingPublish = false;
      const hotspots = spatialExhibits.flatMap((e) => {
        if (!loaded[e.area] || Math.abs(e.position[2] - state.distance) > 17)
          return [];
        projected
          .set(
            e.position[0],
            e.position[1] + 0.7,
            -e.position[2] + world.position.z,
          )
          .project(camera);
        if (
          projected.z >= 1 ||
          projected.z < -1 ||
          Math.abs(projected.x) > 0.88 ||
          Math.abs(projected.y) > 0.76
        )
          return [];
        return [
          {
            id: e.id,
            x: ((projected.x + 1) / 2) * 100,
            y: ((1 - projected.y) / 2) * 100,
          },
        ];
      });
      options.onUpdate({
        navigationMode,
        avatarZ: avatar.position.z,
        worldZ: world.position.z,
        progress: state.distance / JOURNEY_END,
        distance: state.distance,
        paused,
        x: state.x,
        area: areaAt(state.distance),
        moving,
        transitioning: !!transition,
        loaded: [...loaded],
        hotspots,
        drawCalls: renderer.info.render.calls,
        triangles: renderer.info.render.triangles,
        cameraZ: camera.position.z,
      });
    }
    if (first) {
      first = false;
      options.onReady();
    }
  }
  raf = requestAnimationFrame(update);
  return {
    setNavigationMode(mode: NavigationMode) {
      if (mode === navigationMode) return;
      if (mode === "scroll") anchor = { x: state.x, d: state.distance };
      else {
        camera.position.z -= world.position.z;
        world.position.z = 0;
      }
      navigationMode = mode;
      input.x = 0;
      input.forward = 0;
      state.vx = 0;
      state.vz = 0;
      transition = null;
      guidedActive = false;
      scrollTarget = state.distance;
      pendingPublish = true;
    },
    scrollBy(pixels: number) {
      if (
        navigationMode !== "scroll" ||
        paused ||
        document.hidden ||
        !Number.isFinite(pixels)
      )
        return;
      if (transition) {
        transition = null;
        scrollTarget = state.distance;
      }
      scrollTarget = scrollDestination(scrollTarget, pixels);
      guidedActive = true;
      pendingPublish = true;
    },
    cancelScroll() {
      scrollTarget = state.distance;
      guidedActive = false;
      state.vx = 0;
      state.vz = 0;
      pendingPublish = true;
    },
    setInput(x: number, forward: number) {
      if (navigationMode !== "walk") return;
      input.x = x;
      input.forward = forward;
      if (x || forward) transition = null;
    },
    setPaused(value: boolean) {
      paused = value;
      pendingPublish = true;
      if (value) {
        scrollTarget = state.distance;
        guidedActive = false;
        input.x = 0;
        input.forward = 0;
        state.vx = 0;
        state.vz = 0;
      }
    },
    setReduced(value: boolean) {
      reduced = value;
    },
    goTo(index: number) {
      guidedActive = false;
      scrollTarget = state.distance;
      if (index === 2) loadWorkshop();
      else if (index > 0) buildRoom(index);
      transition = {
        from: state.distance,
        fromX: state.x,
        to: destinations[index] ?? 0,
        elapsed: 0,
      };
      input.x = 0;
      input.forward = 0;
      state.vx = 0;
      state.vz = 0;
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      const geometries = new Set<T.BufferGeometry>(),
        materials = new Set<T.Material>();
      scene.traverse((o) => {
        if (o instanceof T.Mesh) {
          geometries.add(o.geometry);
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) =>
            materials.add(m),
          );
        }
      });
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      resources.forEach((t) => t.dispose());
      mats.forEach((m) => m.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
export type SpatialEngine = ReturnType<typeof createSpatialWorld>;
