import * as T from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { journeyFrame } from "./JourneyController.mjs";
import {
  advance,
  advanceScroll,
  scrollDestination,
  areaAt,
  destinations,
  easeJourney,
  JOURNEY_END,
} from "./spatial-motion.mjs";
import { spatialExhibits } from "@/data/site";
export type NavigationMode = "walk" | "scroll";

export type SpatialSnapshot = {
  rigBones: number;
  animation: string;
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

export function createSpatialWorld(host: HTMLElement, options: SpatialOptions) {
  const scene = new T.Scene();
  scene.fog = new T.Fog("#77634f", 55, 200);
  const sky = document.createElement("canvas");
  sky.width = 16;
  sky.height = 512;
  const skyctx = sky.getContext("2d")!;
  const gradient = skyctx.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0, "#101d2c");
  gradient.addColorStop(0.44, "#59616b");
  gradient.addColorStop(0.6, "#c49973");
  gradient.addColorStop(0.72, "#e0b581");
  gradient.addColorStop(1, "#233845");
  skyctx.fillStyle = gradient;
  skyctx.fillRect(0, 0, 16, 512);
  const skyTexture = new T.CanvasTexture(sky);
  skyTexture.colorSpace = T.SRGBColorSpace;
  scene.background = skyTexture;
  const renderer = new T.WebGLRenderer({
    antialias: host.clientWidth > 700,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(
    Math.min(devicePixelRatio, host.clientWidth < 700 ? 1.1 : 1.5),
  );
  const gl = renderer.getContext(),
    debug = gl.getExtension("WEBGL_debug_renderer_info");
  const gpu = debug
    ? String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL))
    : "";
  const softwareRenderer = /swiftshader|llvmpipe|software/i.test(gpu);
  if (softwareRenderer) renderer.setPixelRatio(0.85);
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = host.clientWidth > 700 && !softwareRenderer;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);
  const camera = new T.PerspectiveCamera(52, 1, 0.1, 300);
  scene.add(new T.HemisphereLight("#c7d4ed", "#3c2f29", 1.4));
  const sun = new T.DirectionalLight("#ffd09b", 3.2);
  sun.position.set(-18, 9, -32);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -15;
  sun.shadow.camera.right = 15;
  sun.shadow.camera.top = 18;
  sun.shadow.camera.bottom = -18;
  sun.shadow.bias = -0.0005;
  scene.add(sun, sun.target);
  const resources: T.Texture[] = [skyTexture];
  if (!softwareRenderer) {
    const pmrem = new T.PMREMGenerator(renderer);
    const probe = new RoomEnvironment();
    const env = pmrem.fromScene(probe, 0.04);
    scene.environment = env.texture;
    scene.environmentIntensity = 0.45;
    probe.dispose();
    pmrem.dispose();
    resources.push(env.texture);
  }
  const mats = new Map<string, T.Material>();
  const world = new T.Group();
  scene.add(world);
  const avatar = new T.Group();
  scene.add(avatar);
  // Soft contact occlusion remains inexpensive on software WebGL renderers.
  const contact = document.createElement("canvas");
  contact.width = contact.height = 64;
  const contactContext = contact.getContext("2d")!;
  const contactGradient = contactContext.createRadialGradient(
    32,
    32,
    4,
    32,
    32,
    32,
  );
  contactGradient.addColorStop(0, "rgba(0,0,0,.5)");
  contactGradient.addColorStop(1, "rgba(0,0,0,0)");
  contactContext.fillStyle = contactGradient;
  contactContext.fillRect(0, 0, 64, 64);
  const contactTexture = new T.CanvasTexture(contact);
  resources.push(contactTexture);
  const contactShadow = new T.Mesh(
    new T.PlaneGeometry(0.95, 0.65),
    new T.MeshBasicMaterial({
      map: contactTexture,
      transparent: true,
      depthWrite: false,
    }),
  );
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.005;
  avatar.add(contactShadow);
  const loaded = Array(6).fill(false) as boolean[];
  const loading = new Set<number>();
  const roomNodes = new Map<number, T.Group>();
  let assetDirty = true,
    avatarReady = false,
    announced = false;
  let mixer: T.AnimationMixer | null = null;
  const actions: Record<string, T.AnimationAction> = {};
  let animationName = "Idle",
    rigBones = 0;
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  function register(root: T.Object3D) {
    root.traverse((o) => {
      if (o instanceof T.Mesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        if (
          softwareRenderer &&
          !Array.isArray(o.material) &&
          o.material instanceof T.MeshStandardMaterial
        ) {
          const old = o.material;
          const fallback = old.userData.fallbackBaseColor;
          if (Array.isArray(fallback) && old.map) resources.push(old.map);
          o.material = new T.MeshLambertMaterial({
            color: Array.isArray(fallback)
              ? new T.Color().fromArray(fallback)
              : old.color,
            map: Array.isArray(fallback) ? null : old.map,
            emissive: old.emissive,
            emissiveMap: old.emissiveMap,
            transparent: old.transparent,
            opacity: old.opacity,
            side: old.side,
            depthWrite: old.depthWrite,
          });
          old.dispose();
        }
        for (const m of Array.isArray(o.material) ? o.material : [o.material])
          mats.set(m.uuid, m);
      }
    });
  }
  function loadRoom(index: number) {
    if (loaded[index] || loading.has(index)) return;
    loading.add(index);
    loader.load(
      `${base}/models/environment-${index}.glb`,
      (g) => {
        if (disposed) return;
        g.scene.position.z = -destinations[index];
        register(g.scene);
        world.add(g.scene);
        roomNodes.set(index, g.scene);
        loaded[index] = true;
        loading.delete(index);
        assetDirty = true;
        pendingPublish = true;
        if (index === 2) {
          const textures = new T.TextureLoader();
          ["conceito-landing", "conceito-portfolio", "conceito-site"].forEach(
            (slug, i) => {
              const t = textures.load(`${base}/concepts/${slug}.png`, () => {
                assetDirty = true;
                pendingPublish = true;
              });
              t.colorSpace = T.SRGBColorSpace;
              resources.push(t);
              for (const x of [-4.5, 4.5]) {
                const screen = new T.Mesh(
                  new T.PlaneGeometry(1.3, 0.7),
                  new T.MeshBasicMaterial({ map: t }),
                );
                screen.position.set(
                  x,
                  1.35,
                  -(destinations[2] + [-5, 1, 7][i]) - 0.1,
                );
                world.add(screen);
              }
            },
          );
        }
        if (index === 3) {
          const textureLoader = new T.TextureLoader();
          ["conceito-landing", "conceito-portfolio", "conceito-site"].forEach(
            (slug, i) => {
              const texture = textureLoader.load(
                `${base}/concepts/${slug}.png`,
                () => {
                  assetDirty = true;
                  pendingPublish = true;
                },
              );
              texture.colorSpace = T.SRGBColorSpace;
              resources.push(texture);
              const preview = new T.Mesh(
                new T.PlaneGeometry(3.12, 1.9),
                new T.MeshBasicMaterial({ map: texture }),
              );
              preview.position.set(
                i % 2 ? 5 : -5,
                2.2,
                -(destinations[3] + (i - 1) * 5) + 0.22,
              );
              world.add(preview);
            },
          );
        }
        if (index === 4) {
          const logo = new T.TextureLoader().load(
            `${base}/brand/zaion-original.png`,
            (t) => {
              const image = t.image as HTMLImageElement;
              const badge = new T.Mesh(
                new T.PlaneGeometry(3.3, (3.3 * image.height) / image.width),
                new T.MeshBasicMaterial({
                  map: t,
                  transparent: true,
                  side: T.DoubleSide,
                }),
              );
              badge.position.set(0, 3, -(destinations[4] + 6));
              world.add(badge);
              assetDirty = true;
              pendingPublish = true;
            },
          );
          logo.colorSpace = T.SRGBColorSpace;
          resources.push(logo);
        }
      },
      undefined,
      () =>
        options.onError(
          "Não foi possível carregar este ambiente. Reabra a jornada ou continue no modo clássico.",
        ),
    );
  }
  loader.load(
    `${base}/models/gabriel-rigged.glb`,
    (g) => {
      if (disposed) return;
      g.scene.scale.setScalar(1.08);
      g.scene.rotation.y = Math.PI;
      register(g.scene);
      avatar.add(g.scene);
      const bones = new Set<string>();
      g.scene.traverse((o) => {
        if (o instanceof T.SkinnedMesh)
          o.skeleton.bones.forEach((b) => bones.add(b.uuid));
      });
      rigBones = bones.size;
      mixer = new T.AnimationMixer(g.scene);
      for (const clip of g.animations)
        actions[clip.name] = mixer.clipAction(clip);
      actions.Idle?.play();
      actions.Walk?.setEffectiveTimeScale(1.5);
      avatarReady = true;
      assetDirty = true;
      pendingPublish = true;
      loadRoom(Math.min(5, areaAt(options.initialDistance) + 1));
    },
    undefined,
    () =>
      options.onError(
        "O personagem não carregou. Reabra a jornada ou continue no modo clássico.",
      ),
  );
  loadRoom(areaAt(options.initialDistance));
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
    host.clientWidth < 700 ? -1.3 : 1.4,
    host.clientHeight < 600 ? 2.7 : 2.4,
    -state.distance +
      (host.clientHeight < 600 ? 7.5 : host.clientWidth < 700 ? 6.5 : 5.4),
  );
  camera.lookAt(0, host.clientHeight < 600 ? 1.1 : 1.5, -state.distance - 8);
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
  let slowFrames = 0;
  function update(now: number) {
    if (disposed) return;
    raf = requestAnimationFrame(update);
    const elapsed = Math.min((now - last) / 1000 || 0, 0.25),
      dt = Math.min(elapsed, 0.05);
    last = now;
    if (elapsed > 0.045 && !paused) {
      slowFrames++;
    } else slowFrames = Math.max(0, slowFrames - 1);
    if (
      slowFrames >= 2 &&
      (renderer.getPixelRatio() > 0.7 || renderer.shadowMap.enabled)
    ) {
      renderer.shadowMap.enabled = false;
      renderer.setPixelRatio(Math.max(0.65, renderer.getPixelRatio() * 0.75));
      renderer.setSize(host.clientWidth, host.clientHeight);
      mats.forEach((m) => (m.needsUpdate = true));
      slowFrames = 0;
      pendingPublish = true;
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
        for (let time = elapsed; time > 0; time -= 0.04)
          state = advanceScroll(
            state,
            scrollTarget,
            Math.min(time, 0.04),
            reduced,
          );
        if (
          Math.abs(state.distance - scrollTarget) < 0.0001 &&
          Math.abs(state.vx) + Math.abs(state.vz) < 0.01
        )
          guidedActive = false;
      } else {
        for (let time = elapsed; time > 0; time -= 0.04)
          state = advance(state, input, Math.min(time, 0.04));
      }
    }
    const area = areaAt(state.distance);
    loadRoom(area);
    if (state.distance > destinations[Math.min(5, area + 1)] - 15)
      loadRoom(Math.min(5, area + 1));
    roomNodes.forEach((node, i) => {
      node.visible =
        destinations[i] - state.distance > -18 &&
        destinations[i] - state.distance < 50;
    });
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
    const nextAnimation = moving && !reduced ? "Walk" : "Idle";
    if (nextAnimation !== animationName && actions[nextAnimation]) {
      actions[animationName]?.fadeOut(0.2);
      actions[nextAnimation].reset().fadeIn(0.2).play();
      animationName = nextAnimation;
    }
    if (actions.Turn) {
      actions.Turn.play().setEffectiveWeight(
        moving && Math.abs(state.vx) > 0.1 ? 0.2 : 0,
      );
    }
    if (!paused && !hidden && mixer && !reduced) mixer.update(elapsed);
    avatar.position.set(
      scrollMode ? anchor.x : state.x,
      0,
      scrollMode ? -anchor.d : -state.distance,
    );
    if (moving) {
      const target = Math.atan2(-state.vx, state.vz);
      let diff = target - avatar.rotation.y;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      avatar.rotation.y += diff * (reduced ? 1 : 1 - Math.exp(-9 * elapsed));
    }
    const shortView = host.clientHeight < 600;
    desired.set(
      (scrollMode ? anchor.x : state.x) * 0.6 +
        (host.clientWidth < 700 ? -1.3 : 1.4),
      shortView ? 2.7 : 2.4,
      -(scrollMode ? anchor.d : state.distance) +
        (shortView ? 7.5 : host.clientWidth < 700 ? 6.5 : 5.4),
    );
    const cameraMoving = camera.position.distanceToSquared(desired) > 0.00005;
    if (!paused && !hidden) {
      camera.position.lerp(desired, reduced ? 1 : 1 - Math.exp(-5.4 * elapsed));
      look.set(
        (scrollMode ? anchor.x : state.x) * 0.5,
        shortView ? 1.1 : 1.5,
        -(scrollMode ? anchor.d : state.distance) - 8,
      );
      sun.position.set(-18, 9, (scrollMode ? -anchor.d : -state.distance) - 32);
      sun.target.position.set(0, 0, scrollMode ? -anchor.d : -state.distance);
      scene.add(sun.target);
      camera.lookAt(look);
    }
    if (
      !hidden &&
      (first ||
        assetDirty ||
        (!paused &&
          (moving ||
            transition ||
            assetDirty ||
            (!paused && mixer !== null && !reduced) ||
            cameraMoving ||
            previousX !== state.x ||
            previousD !== state.distance)))
    ) {
      renderer.render(scene, camera);
      assetDirty = false;
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
        rigBones,
        animation: animationName,
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
    if (first) first = false;
    if (!announced && avatarReady && loaded[areaAt(options.initialDistance)]) {
      announced = true;
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
      loadRoom(index);
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
        materials = new Set<T.Material>(),
        textures = new Set<T.Texture>(resources);
      scene.traverse((o) => {
        if (o instanceof T.Mesh) {
          geometries.add(o.geometry);
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) =>
            materials.add(m),
          );
        }
      });
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => {
        for (const value of Object.values(m))
          if (value instanceof T.Texture) textures.add(value);
        m.dispose();
      });
      textures.forEach((t) => t.dispose());
      mats.forEach((m) => m.dispose());
      mixer?.stopAllAction();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
export type SpatialEngine = ReturnType<typeof createSpatialWorld>;
