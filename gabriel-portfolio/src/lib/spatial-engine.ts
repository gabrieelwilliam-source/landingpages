import * as T from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { furnitureGeometry } from "./office-rendering.mjs";
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
import { automationConcepts, spatialExhibits } from "@/data/site";
import office from "@/data/office-layout.json";
export type NavigationMode = "walk" | "scroll";
export type GraphicQuality = "auto" | "low" | "high";

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
  scene.fog = new T.Fog("#3b4247", 42, 125);
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
  if (softwareRenderer) {
    renderer.setPixelRatio(0.7);
    scene.fog = new T.Fog("#283038", 20, 46);
  }
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = host.clientWidth > 700 && !softwareRenderer;
  renderer.shadowMap.type = softwareRenderer ? T.BasicShadowMap : T.PCFSoftShadowMap;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);
  const camera = new T.PerspectiveCamera(50, 1, 0.1, 160);
  scene.add(new T.HemisphereLight("#cfdaeb", "#66513e", 1.0));
  const sun = new T.DirectionalLight("#ffd3a0", 2.4);
  sun.position.set(-18, 9, -32);
  sun.castShadow = true;
  sun.shadow.mapSize.set(softwareRenderer ? 512 : 1024, softwareRenderer ? 512 : 1024);
  sun.shadow.camera.left = -15;
  sun.shadow.camera.right = 15;
  sun.shadow.camera.top = 18;
  sun.shadow.camera.bottom = -18;
  sun.shadow.bias = -0.0005;
  scene.add(sun, sun.target);
  const ceilingLights = [-4, 4].map(x => {
    const lamp = new T.PointLight("#ffd5a5", softwareRenderer ? 24 : 32, 20, 2);
    lamp.position.set(x, 4.2, -3);
    scene.add(lamp);
    return lamp;
  });
  const resources: T.Texture[] = [skyTexture];
  if (!softwareRenderer) {
    const pmrem = new T.PMREMGenerator(renderer);
    const probe = new RoomEnvironment();
    const env = pmrem.fromScene(probe, 0.04, 0.1, 100, {size: softwareRenderer ? 64 : 128});
    scene.environment = env.texture;
    scene.environmentIntensity = 0.4;
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
  // Low-cost, original contact occlusion survives the no-shadow mobile tier.
  const floorOcclusion = new T.InstancedMesh(
    new T.PlaneGeometry(1, 1),
    new T.MeshBasicMaterial({ map: contactTexture, transparent: true, depthWrite: false, opacity: .43, color: "#201b16" }),
    office.colliders.length,
  );
  const footprint = new T.Object3D();
  office.colliders.forEach((box, i) => {
    footprint.position.set(box.x, .025, -box.d);
    footprint.rotation.x = -Math.PI / 2;
    footprint.scale.set(box.w * 2.8, box.h * 2.8, 1);
    footprint.updateMatrix();
    floorOcclusion.setMatrixAt(i, footprint.matrix);
  });
  world.add(floorOcclusion);
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
        o.castShadow = !(o.material instanceof T.Material && o.material.transparent && o.material.opacity < 0.3);
        o.receiveShadow = true;
        if (softwareRenderer) {
          const convert = (material: T.Material) => {
            if (!(material instanceof T.MeshStandardMaterial)) return material;
            // Preserve original maps with vertex lighting on CPU WebGL.
            // Full PBR remains available on hardware; do not discard textures.
            for (const texture of [material.roughnessMap, material.metalnessMap, material.normalMap, material.aoMap])
              if (texture) resources.push(texture);
            const fallback = new T.MeshLambertMaterial({
              color: material.color,
              map: material.map,
              emissive: material.emissive,
              emissiveMap: material.emissiveMap,
              emissiveIntensity: material.emissiveIntensity,
              transparent: material.transparent,
              opacity: material.opacity,
              side: material.side,
              depthWrite: material.depthWrite,
            });
            material.dispose();
            return fallback;
          };
          o.material = Array.isArray(o.material) ? o.material.map(convert) : convert(o.material);
        }
        for (const m of Array.isArray(o.material) ? o.material : [o.material])
          mats.set(m.uuid, m);
      }
    });
  }
  function batchSoftwareFurniture(root: T.Object3D) {
    if (!softwareRenderer) return;
    root.updateMatrixWorld(true);
    const inverse = root.matrixWorld.clone().invert();
    const meshes: T.Mesh<T.BufferGeometry, T.MeshLambertMaterial>[] = [];
    root.traverse(o => {
      if (o instanceof T.Mesh && !(o instanceof T.SkinnedMesh) &&
          o.material instanceof T.MeshLambertMaterial && !o.material.map &&
          !o.material.transparent && o.material.emissive.getHex() === 0) meshes.push(o);
    });
    const pieces = meshes.map(mesh => {
      const geometry = furnitureGeometry(mesh.geometry, new T.Matrix4().multiplyMatrices(inverse, mesh.matrixWorld));
      const colors = new Float32Array(geometry.getAttribute("position").count * 3);
      for (let i = 0; i < colors.length; i += 3) mesh.material.color.toArray(colors, i);
      geometry.setAttribute("color", new T.BufferAttribute(colors, 3));
      return geometry;
    });
    const geometry = pieces.length ? mergeGeometries(pieces, false) : null;
    pieces.forEach(piece => piece.dispose());
    if (!geometry) return;
    meshes.forEach(mesh => { mesh.parent?.remove(mesh); mesh.geometry.dispose(); });
    const material = new T.MeshLambertMaterial({vertexColors: true, side: T.DoubleSide});
    mats.set(material.uuid, material);
    root.add(new T.Mesh(geometry, material));
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
        batchSoftwareFurniture(g.scene);
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
                  1.31,
                  -(destinations[2] + [-5, 1, 7][i]) + 0.19,
                );
                screen.position.z += destinations[index];
              g.scene.add(screen);
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
              preview.position.z += destinations[index];
              g.scene.add(preview);
            },
          );
        }
        if (index === 4) {
          automationConcepts.forEach((concept, i) => {
            const board = document.createElement("canvas");
            board.width = 768; board.height = 432;
            const ctx = board.getContext("2d")!;
            ctx.fillStyle = "#0b1823"; ctx.fillRect(0,0,768,432);
            ctx.fillStyle = "#d7b67b"; ctx.font = "18px Arial";
            ctx.fillText("zAIon / FLUXO CONCEITUAL", 40, 54);
            ctx.fillStyle = "#f2eee4"; ctx.font = "bold 42px Arial";
            ctx.fillText(concept.title, 40, 119);
            ctx.font = "20px Arial";
            concept.steps.forEach((step, j) => {
              const x = 40+j*237;
              ctx.strokeStyle = "#ad915b"; ctx.lineWidth = 2; ctx.strokeRect(x,190,210,110);
              ctx.fillStyle = "#d7b67b"; ctx.fillText(`0${j+1}`, x+18,223);
              ctx.fillStyle = "#f2eee4"; ctx.fillText(step,x+18,267);
              if(j<2) { ctx.beginPath();ctx.moveTo(x+210,245);ctx.lineTo(x+237,245);ctx.stroke(); }
            });
            ctx.fillStyle = "#c3cbd0"; ctx.font = "18px Arial";
            ctx.fillText("DEMONSTRAÇÃO LOCAL · SEM INTEGRAÇÃO OU ENVIO",40,380);
            const texture = new T.CanvasTexture(board); texture.colorSpace = T.SRGBColorSpace;
            resources.push(texture);
            const monitor = new T.Mesh(new T.PlaneGeometry(1.3,.7),new T.MeshBasicMaterial({map:texture}));
            monitor.position.set(i<2 ? -4.8 : 4.8,1.31,-(destinations[4]+(i%2 ? 5 : -3))+.19);
            monitor.position.z += destinations[index];
              g.scene.add(monitor);
          });
        }
        if (index === 0 || index === 4) {
          const logo = new T.TextureLoader().load(
            `${base}/brand/zaion-original.png`,
            (t) => {
              const image = t.image as HTMLImageElement;
              const badge = new T.Mesh(
                new T.PlaneGeometry(index === 0 ? 3.3 : 1.1, ((index === 0 ? 3.3 : 1.1) * image.height) / image.width),
                new T.MeshBasicMaterial({
                  map: t,
                  transparent: true,
                  side: T.DoubleSide,
                }),
              );
              badge.position.set(index === 0 ? -5.5 : -6, index === 0 ? 2.9 : 2.1, -(destinations[index] + (index === 0 ? 5.75 : 8.88)));
              badge.position.z += destinations[index];
              g.scene.add(badge);
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
    host.clientWidth < 700 ? -1.3 : -1.2,
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
  let quality: GraphicQuality = "auto";
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
      quality === "auto" && slowFrames >= 12 &&
      (renderer.getPixelRatio() > (softwareRenderer ? 0.45 : 0.7) || renderer.shadowMap.enabled)
    ) {
      renderer.shadowMap.enabled = false;
      renderer.setPixelRatio(Math.max(softwareRenderer ? 0.45 : 0.65, renderer.getPixelRatio() * 0.75));
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
    if (state.distance > destinations[Math.min(5, area + 1)] - 24)
      loadRoom(Math.min(5, area + 1));
    roomNodes.forEach((node, i) => {
      node.visible =
        destinations[i] - state.distance > -18 &&
        destinations[i] - state.distance < (softwareRenderer ? 34 : 70);
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
        (host.clientWidth < 700 ? -1.3 : -1.2),
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
      sun.position.set(20, 8, (scrollMode ? -anchor.d : -state.distance) - 4);
      ceilingLights.forEach((lamp, i) => {
        lamp.position.z = -destinations[area] + world.position.z - (i ? 3 : -3);
      });
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
      for (let i = 0; i < 6; i++) loadRoom(i);
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
    setQuality(value: GraphicQuality) {
      quality = value;
      renderer.setPixelRatio(value === "low" ? (softwareRenderer ? .45 : .7) : value === "high" ? Math.min(devicePixelRatio, 1.75) : softwareRenderer ? .7 : Math.min(devicePixelRatio, 1.5));
      const shadows = value !== "low" && host.clientWidth > 700 && !softwareRenderer;
      const changedShadows = renderer.shadowMap.enabled !== shadows;
      renderer.shadowMap.enabled = shadows;
      renderer.setSize(host.clientWidth, host.clientHeight);
      if (changedShadows) mats.forEach(m => { m.needsUpdate = true; });
      assetDirty = true;
      pendingPublish = true;
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
