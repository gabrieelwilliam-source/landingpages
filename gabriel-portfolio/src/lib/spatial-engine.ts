import * as T from "three";
import {
  advance,
  areaAt,
  destinations,
  easeJourney,
  JOURNEY_END,
} from "./spatial-motion.mjs";
import { spatialExhibits } from "@/data/site";

export type SpatialSnapshot = {
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
  reduced: boolean;
  paused: boolean;
  onUpdate: (s: SpatialSnapshot) => void;
  onReady: () => void;
  onError: (message: string) => void;
};

/** A small, disposable Three.js scene. No external models, textures or postprocessing. */
export function createSpatialWorld(host: HTMLElement, options: SpatialOptions) {
  const scene = new T.Scene();
  scene.background = new T.Color("#c2cdd0");
  scene.fog = new T.Fog("#c2cdd0", 24, 85);
  const renderer = new T.WebGLRenderer({
    antialias: host.clientWidth > 700,
    powerPreference: "low-power",
    alpha: false,
  });
  renderer.setPixelRatio(
    Math.min(devicePixelRatio, host.clientWidth < 700 ? 1.25 : 1.5),
  );
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.setClearColor("#c2cdd0");
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);
  const camera = new T.PerspectiveCamera(52, 1, 0.1, 110);
  scene.add(new T.HemisphereLight("#f4f2df", "#566f76", 2.6));
  const sun = new T.DirectionalLight("#fff1d6", 3);
  sun.position.set(-12, 20, 8);
  scene.add(sun);
  const boxGeometry = new T.BoxGeometry(1, 1, 1);
  const mats = new Map<string, T.MeshStandardMaterial>();
  const resources: T.Texture[] = [];
  const material = (color: string) => {
    if (!mats.has(color))
      mats.set(
        color,
        new T.MeshStandardMaterial({ color, roughness: 0.82, metalness: 0.05 }),
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
  const world = new T.Group();
  scene.add(world);
  box(world, "#667e7e", 0, -0.6, -31, 95, 0.5, 145);
  box(world, "#d9d4c6", 0, -0.15, -9, 16, 0.3, 28);
  box(world, "#b7b4a6", 0, -0.15, -30, 4.5, 0.3, 14);
  // Guiding brass inlay, low bridge railings and a shared level floor.
  for (const x of [-0.95, 0.95])
    box(world, "#a58e61", x, 0.015, -30, 0.035, 0.03, 77);
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
  const loaded = [true, false];
  let workshop: T.Group | null = null;
  function loadWorkshop() {
    if (loaded[1]) return;
    loaded[1] = true;
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
  }
  // Gabriel: original low-poly rig, dark clothing, short hair and a long beard.
  const avatar = new T.Group();
  scene.add(avatar);
  const rig = new T.Group();
  avatar.add(rig);
  const skin = "#c49d80",
    cloth = "#223b4b";
  box(rig, cloth, 0, 1.16, 0, 0.65, 0.74, 0.38);
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
    new T.ConeGeometry(0.23, 0.48, 7),
    material("#443c35"),
  );
  beard.rotation.z = Math.PI;
  beard.position.set(0, 1.64, -0.17);
  rig.add(beard);
  for (const x of [-0.1, 0.1])
    box(rig, "#9bbbc6", x, 1.91, -0.237, 0.055, 0.04, 0.035);
  const limbs: T.Group[] = [];
  for (const side of [-1, 1]) {
    const leg = new T.Group();
    leg.position.set(side * 0.19, 0.84, 0);
    box(leg, "#334c5a", 0, -0.35, 0, 0.25, 0.68, 0.27);
    box(leg, "#192d35", 0, -0.71, -0.075, 0.28, 0.16, 0.43);
    rig.add(leg);
    limbs.push(leg);
  }
  for (const side of [-1, 1]) {
    const arm = new T.Group();
    arm.position.set(side * 0.43, 1.46, 0);
    box(arm, cloth, 0, -0.29, 0, 0.19, 0.58, 0.22);
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
  function update(now: number) {
    if (disposed) return;
    raf = requestAnimationFrame(update);
    const elapsed = Math.min((now - last) / 1000 || 0, 0.25),
      dt = Math.min(elapsed, 0.05);
    last = now;
    const hidden = document.hidden;
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
        if (t === 1) transition = null;
      } else state = advance(state, input, dt);
    }
    if (state.distance > 18) loadWorkshop();
    const moving =
      !transition &&
      !paused &&
      Math.abs(state.x - previousX) + Math.abs(state.distance - previousD) >
        0.00001;
    if (moving && !reduced) phase += dt * 9;
    for (let i = 0; i < limbs.length; i++)
      limbs[i].rotation.x =
        moving && !reduced ? Math.sin(phase + (i % 2 ? Math.PI : 0)) * 0.42 : 0;
    avatar.position.set(
      state.x,
      moving && !reduced ? Math.abs(Math.sin(phase)) * 0.035 : 0,
      -state.distance,
    );
    if (moving) {
      const target = Math.atan2(-state.vx, state.vz);
      let diff = target - avatar.rotation.y;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      avatar.rotation.y += diff * (reduced ? 1 : 1 - Math.exp(-9 * dt));
    }
    const shortView = host.clientHeight < 600;
    desired.set(
      state.x * 0.6 + 1.4,
      shortView ? 5.3 : 4.1,
      -state.distance + (shortView ? 10.5 : 8.4),
    );
    const cameraMoving = camera.position.distanceToSquared(desired) > 0.00005;
    if (!paused && !hidden) {
      camera.position.lerp(desired, reduced ? 1 : 1 - Math.exp(-5.4 * dt));
      look.set(state.x * 0.5, shortView ? -1.3 : 0.4, -state.distance - 5);
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
    if (first || (pendingPublish && now - lastPublish > 100)) {
      lastPublish = now;
      pendingPublish = false;
      const hotspots = spatialExhibits.flatMap((e) => {
        if (!loaded[e.area] || Math.abs(e.position[2] - state.distance) > 17)
          return [];
        projected
          .set(e.position[0], e.position[1] + 0.7, -e.position[2])
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
    setInput(x: number, forward: number) {
      input.x = x;
      input.forward = forward;
      if (x || forward) transition = null;
    },
    setPaused(value: boolean) {
      paused = value;
      pendingPublish = true;
      if (value) {
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
      if (index === 1) loadWorkshop();
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
