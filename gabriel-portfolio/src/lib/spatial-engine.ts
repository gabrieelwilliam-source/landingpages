import * as T from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { cameraInput, safeCamera } from "./office-camera.mjs";
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
import {actors,crowdLimit,npcRoutine,crowdSafeMove,nearbyTarget,characterDetail} from "./office/npc.mjs";
import {guideX,reconnectPath} from "./office/motion.mjs";
import lowManifest from "../../public/models/low/manifest.json";
import modelManifest from "../../public/models/manifest.json";
export type NavigationMode = "walk" | "scroll";
export type GraphicQuality = "auto" | "low" | "medium" | "high";

export type SpatialSnapshot = {
  avatarLod: "low"|"high";
  npcCount: number;
  npcsLoaded: number;
  npcLoadError:boolean;
  npcStates: {id:string;x:number;d:number;clip:string;time:number;lod:string}[];
  nearby: string | null;
  furnitureLoaded:number;
  cameraFov:number;
  cameraDistance: number;
  cameraShoulder: number;
  reconnecting: boolean;
  guideUnavailable:boolean;
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
  cameraX: number;
  cameraYaw: number;
  cameraPitch: number;
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
  renderer.toneMappingExposure = 0.94;
  renderer.shadowMap.enabled = host.clientWidth > 700 && !softwareRenderer;
  renderer.shadowMap.type = softwareRenderer ? T.BasicShadowMap : T.PCFSoftShadowMap;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);
  const camera = new T.PerspectiveCamera(50, 1, 0.1, 500);
  scene.add(new T.HemisphereLight("#e9dfcf", "#534238", softwareRenderer ? 1.05 : .9));
  const sun = new T.DirectionalLight("#ffd3a0", 1.8);
  sun.position.set(18, 9, -32);
  sun.castShadow = true;
  sun.shadow.mapSize.set(softwareRenderer ? 512 : 1024, softwareRenderer ? 512 : 1024);
  sun.shadow.camera.left = -15;
  sun.shadow.camera.right = 15;
  sun.shadow.camera.top = 18;
  sun.shadow.camera.bottom = -18;
  sun.shadow.bias = -0.0005;
  scene.add(sun, sun.target);
  const ceilingLights = [-4, 4].map(x => {
    const lamp = new T.PointLight("#ffd5a5", softwareRenderer ? 20 : 25, 20, 2);
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
    scene.environmentIntensity = 0.32;
    probe.dispose();
    pmrem.dispose();
    resources.push(env.texture);
  }
  const mats = new Map<string, T.Material>();
  const world = new T.Group();
  scene.add(world);
  const avatar = new T.Group();
  scene.add(avatar);
  if(options.initialDistance<.01)avatar.rotation.y=1.02;
  const envelopeMaterial=softwareRenderer?new T.MeshLambertMaterial({color:new T.Color(.105,.11,.12)}):new T.MeshStandardMaterial({color:new T.Color(.105,.11,.12),roughness:.8});
  const buildingLength=office.boundaries.at(-1)!-office.boundaries[0],buildingMid=(office.boundaries.at(-1)!+office.boundaries[0])/2;
  const envelopeFloor=new T.Mesh(new T.BoxGeometry(17,.04,buildingLength),envelopeMaterial);envelopeFloor.position.set(0,-.07,-buildingMid);envelopeFloor.receiveShadow=true;world.add(envelopeFloor);
  const envelopeRoof=new T.Mesh(new T.BoxGeometry(17,.12,buildingLength),softwareRenderer?new T.MeshLambertMaterial({color:new T.Color(.055,.065,.075)}):new T.MeshStandardMaterial({color:new T.Color(.055,.065,.075),roughness:.95}));envelopeRoof.position.set(0,5.83,-buildingMid);world.add(envelopeRoof);
  const envelopeWall=new T.Mesh(new T.BoxGeometry(.12,5.7,buildingLength),softwareRenderer?new T.MeshLambertMaterial({color:new T.Color(.11,.055,.026)}):new T.MeshStandardMaterial({color:new T.Color(.11,.055,.026),roughness:.8}));envelopeWall.position.set(-8.45,2.8,-buildingMid);world.add(envelopeWall);
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
  // Restrained indirect light approximation at the facade base; no screen-space reflections.
  const wash=document.createElement('canvas');wash.width=64;wash.height=8;
  const washContext=wash.getContext('2d')!;
  const washGradient=washContext.createLinearGradient(0,0,64,0);
  washGradient.addColorStop(0,'rgba(255,201,133,.34)');washGradient.addColorStop(1,'rgba(255,201,133,0)');
  washContext.fillStyle=washGradient;washContext.fillRect(0,0,64,8);
  const washTexture=new T.CanvasTexture(wash);washTexture.colorSpace=T.SRGBColorSpace;resources.push(washTexture);
  const washMaterial=new T.MeshBasicMaterial({map:washTexture,transparent:true,depthWrite:false,opacity:.28,side:T.DoubleSide});
  const lightWashes=new T.InstancedMesh(new T.PlaneGeometry(1,1),washMaterial,12);
  const washTransform=new T.Object3D();let washIndex=0;
  for(let i=0;i<6;i++)for(const side of [-1,1]){
    const lower=office.boundaries[i],upper=office.boundaries[i+1];
    washTransform.position.set(side*7.45,.032,-(lower+upper)/2);
    washTransform.rotation.set(-Math.PI/2,0,side>0?Math.PI:0);
    washTransform.scale.set(1.4,upper-lower,1);washTransform.updateMatrix();lightWashes.setMatrixAt(washIndex++,washTransform.matrix);
  }
  world.add(lightWashes);
  const loaded = Array(6).fill(false) as boolean[];
  const loading = new Set<number>();
  const roomNodes = new Map<number, T.Group>();
  let assetDirty = true,
    avatarReady = false,
    announced = false;
  let mixer: T.AnimationMixer | null = null;
  let actions: Record<string, T.AnimationAction> = {};
  let animationName = "Idle",
    rigBones = 0;
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  // Content versions prevent browsers from reusing the previous character/rooms.
  const modelUrl = (name: string) => {
    const hash = (name.startsWith("low/")?lowManifest:modelManifest).assets.find(asset => asset.name === name.replace(/^low\//,""))?.sha256;
    return `${base}/models/${name}?v=${hash?.slice(0, 12) || "local"}`;
  };
  // Original generated vista; the photograph used for Gabriel is never loaded.
  const city = new T.TextureLoader().load(`${base}/environment/city-dusk.webp`);
  city.colorSpace = T.SRGBColorSpace;
  resources.push(city);
  const panorama = new T.Mesh(
    new T.BoxGeometry(360, 180, 360),
    new T.MeshBasicMaterial({ map: city, side: T.BackSide, fog: false, toneMapped: false }),
  );
  panorama.position.set(0, 10, -45);
  world.add(panorama);
  function register(root: T.Object3D) {
    root.traverse((o) => {
      if (o instanceof T.Mesh) {
        o.castShadow = !(o.material instanceof T.Material && o.material.transparent && o.material.opacity < 0.3);
        o.receiveShadow = true;
        // Honed stone: keep the probe highlight broad and restrained at close range.
        const surfaces=Array.isArray(o.material)?o.material:[o.material];
        surfaces.forEach(material=>{
          if(material instanceof T.MeshStandardMaterial&&material.name.includes('limestone'))material.roughness=Math.max(.66,material.roughness);
        });
        if (softwareRenderer) {
          const convert = (material: T.Material) => {
            if (!(material instanceof T.MeshStandardMaterial)) return material;
            // Preserve original maps with vertex lighting on CPU WebGL.
            // Full PBR remains available on hardware; do not discard textures.
            for (const texture of [material.roughnessMap, material.metalnessMap, material.normalMap, material.aoMap])
              if (texture) resources.push(texture);
            const fallback = new T.MeshLambertMaterial({
              color: material.color,
              vertexColors: material.vertexColors,
              map: material.map,
              aoMap:material.aoMap,aoMapIntensity:material.aoMapIntensity,alphaTest:material.alphaTest,
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
  type RigVariant={scene:T.Group;mixer:T.AnimationMixer;actions:Record<string,T.AnimationAction>};
  function rigVariant(scene:T.Group,clips:T.AnimationClip[]):RigVariant{
    register(scene);const mixer=new T.AnimationMixer(scene),actions:Record<string,T.AnimationAction>={};
    clips.forEach(clip=>{actions[clip.name]=mixer.clipAction(clip);});return {scene,mixer,actions};
  }
  let heroHigh:RigVariant|null=null,heroLow:RigVariant|null=null,avatarLod:'low'|'high'='high';
  type CastNode = {high:RigVariant;low?:RigVariant;detail:'low'|'high';definition: typeof actors[number]; root:T.Group; mixer:T.AnimationMixer; actions:Record<string,T.AnimationAction>; clip:string; time:number; x:number; d:number; active:boolean; gait:number};
  const cast = new Map<string,CastNode>(), castLoading = new Set<string>(), castFailed = new Set<string>();
  function loadCast(area:number) {
    actors.slice(0,crowdLimit(quality,softwareRenderer)).filter(a=>a.area===area).forEach(definition=>{
      if(cast.has(definition.id)||castLoading.has(definition.id)||castFailed.has(definition.id))return;
      castLoading.add(definition.id);
      loader.load(modelUrl(`npc-${definition.model}.glb`),g=>{
        if(disposed){releaseDetached(g.scene);return;}
        const high=rigVariant(g.scene,g.animations),root=new T.Group();root.add(g.scene);
        const initial=npcRoutine(definition,0);
        root.position.set(initial.x,0,-initial.d);root.rotation.y=initial.yaw;
        root.scale.setScalar([.98,1,1.015,.97,1.01,1.025,1,1.02][definition.model]);
        world.add(root);
        const node:CastNode={high,detail:'high',definition,root,mixer:high.mixer,actions:high.actions,clip:'',time:0,x:initial.x,d:initial.d,active:false,gait:0};
        cast.set(definition.id,node);
        loader.load(modelUrl(`low/npc-${definition.model}.glb`),low=>{
          if(disposed)return;node.low=rigVariant(low.scene,low.animations);low.scene.visible=false;root.add(low.scene);assetDirty=true;pendingPublish=true;
        },undefined,()=>{ /* The validated full-detail character remains the fallback. */ });
        castLoading.delete(definition.id);assetDirty=true;pendingPublish=true;
      },undefined,()=>{castLoading.delete(definition.id);castFailed.add(definition.id);npcLoadError=true;pendingPublish=true;});
    });
  }
  let npcLoadError=false;
  function castBodies(){return [...cast.values()].filter(n=>n.active).map(n=>({id:n.definition.id,x:n.x,d:n.d}));}
  // Original code-editor illustrations: local, static and free of customer data.
  function codeScreen(index:number) {
    const canvas=document.createElement('canvas');canvas.width=768;canvas.height=432;
    const ctx=canvas.getContext('2d')!;
    ctx.fillStyle='#09132c';ctx.fillRect(0,0,768,432);
    ctx.fillStyle='#152653';ctx.fillRect(0,0,768,48);ctx.fillRect(0,48,48,384);
    ctx.font='17px monospace';ctx.fillStyle='#d3bd87';ctx.fillText(['interface.tsx','automacao.ts','layout.css'][index],70,31);
    const lines=[
      ['export function Studio() {','  return (','    <main className="zaion">','      <Projects />','      <ContactDraft />','    </main>','  );','}'],
      ['// Exemplo local · sem envio','const steps = [','  "Receber solicitação",','  "Organizar informações",','  "Preparar atendimento"','];','const simulation = steps.map(preview);'],
      [':root {','  --navy: #0b1838;','  --royal: #225ce0;','  --gold: #c7a66c;','}','.studio {','  display: grid;','  gap: 2rem;','}']
    ][index];
    ctx.font='20px monospace';lines.forEach((line,j)=>{ctx.fillStyle='#667899';ctx.fillText(String(j+1),13,85+j*31);ctx.fillStyle=j%3===0?'#83aaff':'#c7d4e9';ctx.fillText(line,70,85+j*31)});
    const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;resources.push(texture);return texture;
  }
  const furniturePool=new Map<string,T.Group>(),furnitureLoading=new Set<string>();
  const furniturePlaced=new Set<number>();
  function mountFurnishings(){
    office.furniture.forEach((entry,i)=>{
      if(furniturePlaced.has(i))return;
      const room=roomNodes.get(entry.area),template=furniturePool.get(entry.asset);if(!room||!template)return;
      const instance=template.clone(true);instance.position.set(entry.x,0,-entry.d+destinations[entry.area]);instance.rotation.y=entry.yaw;room.add(instance);furniturePlaced.add(i);
    });assetDirty=true;pendingPublish=true;
  }
  function loadFurnishings(index:number){
    office.furniture.filter(entry=>entry.area===index).forEach(entry=>{
      if(furniturePool.has(entry.asset)||furnitureLoading.has(entry.asset))return;
      furnitureLoading.add(entry.asset);
      loader.load(modelUrl(`furniture/${entry.asset}.glb`),g=>{
        if(disposed){releaseDetached(g.scene);return;}
        register(g.scene);furniturePool.set(entry.asset,g.scene);furnitureLoading.delete(entry.asset);mountFurnishings();
      },undefined,()=>options.onError('Um modelo do mobiliário não carregou. Reabra a visita ou continue no modo clássico.'));
    });mountFurnishings();
  }
  function releaseDetached(root:T.Object3D){
    root.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach((m:T.Material)=>{for(const value of Object.values(m))if(value instanceof T.Texture)value.dispose();m.dispose()})}});
  }
  function loadRoom(index: number) {
    if (loaded[index] || loading.has(index)) return;
    loading.add(index);
    loader.load(
      modelUrl(`environment-${index}.glb`),
      (g) => {
        if (disposed){releaseDetached(g.scene);return;}
        g.scene.position.z = -destinations[index];
        register(g.scene);
        batchSoftwareFurniture(g.scene);
        world.add(g.scene);
        roomNodes.set(index, g.scene);
        loadFurnishings(index);
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
                if(i===1&&x<0)continue;
                const screen = new T.Mesh(
                  new T.PlaneGeometry(1.3, 0.7),
                  new T.MeshBasicMaterial({ map: x<0?t:codeScreen(i) }),
                );
                screen.position.set(
                  x,
                  1.31,
                  -(destinations[2] + [-5, 1, 7][i]*office.depthScale) - 0.16,
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
                -(destinations[3] + (i - 1) * 5*office.depthScale) + 0.22,
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
            monitor.position.set(i<2 ? -4.8 : 4.8,1.31,-(destinations[4]+(i%2 ? 5 : -3)*office.depthScale)-.16);
            monitor.position.z += destinations[index];
              g.scene.add(monitor);
          });
        }
        if (index === 0 || index === 5) {
          const logo = new T.TextureLoader().load(
            `${base}/brand/zaion-original.png`,
            (t) => {
              const image = t.image as HTMLImageElement;
              const badge = new T.Mesh(
                new T.PlaneGeometry(index === 0 ? 3.3 : 2.1, ((index === 0 ? 3.3 : 2.1) * image.height) / image.width),
                new T.MeshBasicMaterial({
                  map: t,
                  toneMapped: false,
                  transparent: true,
                  side: T.DoubleSide,
                }),
              );
              badge.position.set(index === 0 ? -5.5 : 4.7, index === 0 ? 2.9 : 2.4, -(destinations[index] + ((index === 0 ? 5.75 : 8.80)*office.depthScale)));
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
  // Load the compact rig in parallel: mobile can move before the PBR variant arrives.
  let highFailed=false,lowFailed=false;
  function attachHero(g:{scene:T.Group;animations:T.AnimationClip[]},detail:'high'|'low'){
    if(disposed){releaseDetached(g.scene);return;}
    g.scene.rotation.y=Math.PI;
    const variant=rigVariant(g.scene,g.animations),first=!avatarReady;
    if(detail==='high')heroHigh=variant;else heroLow=variant;
    g.scene.visible=first;avatar.add(g.scene);
    const bones=new Set<string>();g.scene.traverse(o=>{if(o instanceof T.SkinnedMesh)o.skeleton.bones.forEach(b=>bones.add(b.uuid));});rigBones=bones.size;
    variant.actions.Walk?.setEffectiveTimeScale(1.5);
    if(first){
      avatarLod=detail;mixer=variant.mixer;actions=variant.actions;actions.Idle?.play();avatarReady=true;
      loadRoom(Math.min(5,areaAt(options.initialDistance)+1));
    }
    assetDirty=true;pendingPublish=true;
  }
  function heroLoadFailed(detail:'high'|'low'){
    if(disposed)return;
    if(detail==='high')highFailed=true;else lowFailed=true;
    if(highFailed&&lowFailed)options.onError('O personagem não carregou. Reabra a jornada ou continue no modo clássico.');
  }
  loader.load(modelUrl('low/gabriel-rigged.glb'),g=>attachHero(g,'low'),undefined,()=>heroLoadFailed('low'));
  loader.load(modelUrl('gabriel-rigged.glb'),g=>attachHero(g,'high'),undefined,()=>heroLoadFailed('high'));
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
  let cameraYaw = 0, cameraPitch = 0;
  let cameraDistance=host.clientWidth<700?6.5:5.4,cameraShoulder=-1.2;
  let reconnect: {path:{x:number;d:number}[];index:number;modeAfter:NavigationMode;destination?:number} | null=null;
  let guideUnavailable=false;
  let gaitDistance=0,moveAge=0,stopAge=1,gesture=0,lastRender=0,npcTick=0;
  let wasMoving=false;
  const input = { x: 0, forward: 0 };
  const look = new T.Vector3(),
    desired = new T.Vector3(),
    projected = new T.Vector3();
  const initialCamera=safeCamera({x:state.x,y:1.35,d:state.distance},{x:state.x*.6+cameraShoulder,y:host.clientHeight<600?2.7:2.4,d:state.distance-(host.clientHeight<600?Math.max(6.5,cameraDistance):cameraDistance)},office);
  camera.position.set(initialCamera.x,initialCamera.y,-initialCamera.d);
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
      if(reconnect){
        const target=reconnect.path[reconnect.index];
        if(!target){
          const next=reconnect;pendingPublish=true;assetDirty=true;reconnect=null;navigationMode=next.modeAfter;anchor={x:state.x,d:state.distance};scrollTarget=state.distance;cameraYaw=0;cameraPitch=0;if(next.destination!==undefined)transition={from:state.distance,fromX:state.x,to:destinations[next.destination],elapsed:0};
        }else{
          const dx=target.x-state.x,dd=target.d-state.distance,dist=Math.hypot(dx,dd);
          if(dist<.11){state={...state,x:target.x,distance:target.d,vx:0,vz:0};reconnect.index++;}
          else for(let time=elapsed;time>0;time-=.04){
            const old=state;
            state=crowdSafeMove(old,advance(old,{x:dx/dist,forward:dd/dist},Math.min(time,.04),1.65),castBodies());
          }
        }
      } else if (transition) {
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
          {const previous=state;state=crowdSafeMove(previous,advance(state, cameraInput(input, cameraYaw), Math.min(time, 0.04)),castBodies());}
      }
    }
    if(navigationMode==='scroll'&&!reconnect)state.x=guideX(state.distance);
    const area = areaAt(state.distance);
    loadCast(area);if(area<5)loadCast(area+1);if(area<4)loadCast(area+2);if(area>0)loadCast(area-1);
    loadRoom(area);if(area<4)loadRoom(area+2);
    if (state.distance > destinations[Math.min(5, area + 1)] - 24)
      loadRoom(Math.min(5, area + 1));
    roomNodes.forEach((node, i) => {
      const range = softwareRenderer ? 34 : 70;
      const front = navigationMode === "walk" ? Math.cos(cameraYaw) : 1;
      const ahead = navigationMode === "walk" ? 18.5+(range-18.5)*Math.max(0,front) : range;
      const behind = navigationMode === "walk" ? 18.5+(range-18.5)*Math.max(0,-front) : 18;
      node.visible = destinations[i]-state.distance > -behind && destinations[i]-state.distance < ahead;
    });
    const scrollMode = navigationMode === "scroll";
    world.position.x = scrollMode ? anchor.x-state.x : 0;
    world.position.z = journeyFrame(
      state.distance,
      anchor.d,
      navigationMode,
    ).worldZ;
    const allowed=new Set(actors.slice(0,crowdLimit(quality,softwareRenderer)).map(a=>a.id));
    let crowdAnimated=false;
    cast.forEach(n=>{
      const visible=allowed.has(n.definition.id)&&Math.abs(n.d-state.distance)<(quality==='high'?35:23);
      const overlap=Math.hypot(n.x-state.x,n.d-state.distance)<.65;
      n.active=visible&&!overlap;n.root.visible=n.active;
      if(!n.active)return;
      const detail=characterDetail(quality,softwareRenderer,Math.hypot(n.x-state.x,n.d-state.distance))==='low'&&n.low?'low':'high';
      if(detail!==n.detail){
        n.high.scene.visible=detail==='high';if(n.low)n.low.scene.visible=detail==='low';
        const oldTime=n.actions[n.clip]?.time||0;const model=detail==='low'?n.low!:n.high;n.mixer=model.mixer;n.actions=model.actions;n.mixer.stopAllAction();if(n.actions[n.clip]){n.actions[n.clip].reset().play();n.actions[n.clip].time=oldTime;}n.detail=detail;assetDirty=true;pendingPublish=true;
      }
      const candidate=npcRoutine(n.definition,n.time+(!paused&&!hidden&&!reduced?elapsed:0));
      const stepDistance=Math.hypot(candidate.x-n.x,candidate.d-n.d);
      const obstructed=stepDistance>.001 && (Math.hypot(candidate.x-state.x,candidate.d-state.distance)<.85 || castBodies().some(b=>b.id!==n.definition.id&&Math.hypot(candidate.x-b.x,candidate.d-b.d)<.8));
      if(!obstructed){
        if(!paused&&!hidden&&!reduced)n.time+=elapsed;
        n.x=candidate.x;n.d=candidate.d;n.root.position.set(n.x,0,-n.d);const turn=Math.atan2(Math.sin(candidate.yaw-n.root.rotation.y),Math.cos(candidate.yaw-n.root.rotation.y));n.root.rotation.y+=turn*(reduced?1:1-Math.exp(-6*elapsed));
      }
      const clip=obstructed?'Idle':candidate.clip;
      if(n.clip!==clip&&n.actions[clip]){
        const initial=!n.clip;n.actions[n.clip]?.fadeOut(.22);const action=n.actions[clip].reset();if(!initial)action.fadeIn(.22);action.play();n.clip=clip;
      }
      const action=n.actions[n.clip];
      if(action){
        action.paused=true;
        const duration=action.getClip().duration;
        if(clip==='Walk'){if(!obstructed)n.gait+=stepDistance;action.time=(n.gait/1.15*duration)%duration;}
        else if(clip==='StandUp'||clip==='SitDown')action.time=Math.min(duration,candidate.phase/2*duration);
        else action.time=(candidate.phase*.55+n.definition.offset*.07)%duration;
      }
      n.mixer.update(!paused&&!hidden&&!reduced?elapsed:0);
      if(!paused&&!hidden&&!reduced)crowdAnimated=true;
    });
    const moving =
      navigationMode === "walk" &&
      !transition &&
      !paused &&
      Math.abs(state.x - previousX) + Math.abs(state.distance - previousD) >
        0.00001;
    const virtualWalking=scrollMode&&!transition&&!paused&&Math.abs(state.distance-previousD)>.00001;
    const locomotion=moving||virtualWalking;
    if(locomotion){moveAge=wasMoving?moveAge+elapsed:0;stopAge=0;gaitDistance+=virtualWalking?(state.distance-previousD):Math.hypot(state.x-previousX,state.distance-previousD);}
    else{stopAge=wasMoving?0:stopAge+elapsed;moveAge=0;}
    if(!paused&&!hidden)gesture=Math.max(0,gesture-elapsed);
    const detail=heroLow&&(characterDetail(quality,softwareRenderer)==='low'||!heroHigh)?'low':'high';
    if(detail!==avatarLod&&(detail==='low'?heroLow:heroHigh)){
      if(heroHigh)heroHigh.scene.visible=detail==='high';if(heroLow)heroLow.scene.visible=detail==='low';
      const oldTime=actions[animationName]?.time||0;const model=(detail==='low'?heroLow:heroHigh)!;mixer=model.mixer;actions=model.actions;mixer.stopAllAction();if(actions[animationName]){actions[animationName].reset().play();actions[animationName].time=oldTime;}mixer.update(0);avatarLod=detail;assetDirty=true;pendingPublish=true;
    }
    const nextAnimation = reduced?'Idle':gesture>0?'Interact':locomotion?(moveAge<.22?'Start':'Walk'):stopAge<.25?'Stop':'Idle';
    wasMoving=locomotion;
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
    if(actions.Walk){actions.Walk.paused=true;actions.Walk.time=((gaitDistance/1.15*actions.Walk.getClip().duration)%actions.Walk.getClip().duration+actions.Walk.getClip().duration)%actions.Walk.getClip().duration;}
    if (!paused && !hidden && mixer && !reduced) mixer.update(elapsed);
    avatar.position.set(
      scrollMode ? anchor.x : state.x,
      0,
      scrollMode ? -anchor.d : -state.distance,
    );
    if (locomotion) {
      const target = virtualWalking?0:Math.atan2(-state.vx, state.vz);
      let diff = target - avatar.rotation.y;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      avatar.rotation.y += diff * (reduced ? 1 : 1 - Math.exp(-9 * elapsed));
    }
    const shortView = host.clientHeight < 600;
    const focusX = scrollMode ? anchor.x : state.x;
    const focusD = scrollMode ? anchor.d : state.distance;
    const yaw = scrollMode ? 0 : cameraYaw;
    const offsetX = cameraShoulder;
    const offsetZ = shortView ? Math.max(6.5,cameraDistance) : cameraDistance;
    desired.set(
      focusX*.6 + offsetX*Math.cos(yaw) + offsetZ*Math.sin(yaw),
      (shortView ? 2.7 : 2.4) + (scrollMode ? 0 : cameraPitch*3),
      -focusD + offsetZ*Math.cos(yaw) - offsetX*Math.sin(yaw),
    );
    const cameraOffice={...office,colliders:[...office.colliders,...office.cameraObstacles,...castBodies().map(n=>({x:n.x,d:n.d,w:.5,h:.5,top:1.85}))]};
    const cameraFocus={x:state.x,y:1.35,d:state.distance};
    function clipWorldCamera(vector:T.Vector3){
      const safe=safeCamera(cameraFocus,{x:vector.x-world.position.x,y:vector.y,d:-vector.z+world.position.z},cameraOffice);
      vector.set(safe.x+world.position.x,safe.y,-safe.d+world.position.z);
    }
    clipWorldCamera(desired);
    const cameraMoving = camera.position.distanceToSquared(desired) > 0.00005;
    if (!paused && !hidden) {
      camera.position.lerp(desired, reduced ? 1 : 1 - Math.exp(-5.4 * elapsed));
      clipWorldCamera(camera.position);
      look.set(focusX*.5 - 8*Math.sin(yaw)-.55*Math.cos(yaw), shortView ? 1.1 : 1.5, -focusD - 8*Math.cos(yaw)+.55*Math.sin(yaw));
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
            ((!paused && mixer !== null && !reduced || crowdAnimated) && (!softwareRenderer || now-lastRender>500)) ||
            cameraMoving ||
            previousX !== state.x ||
            previousD !== state.distance)))
    ) {
      renderer.render(scene, camera);
      lastRender=now;
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
    if (wasTransition !== !!transition || (crowdAnimated && now-npcTick>400)) {pendingPublish = true;npcTick=now;}
    if (first || (pendingPublish && now - lastPublish > 100)) {
      lastPublish = now;
      pendingPublish = false;
      const hotspots = spatialExhibits.flatMap((e) => {
        if (!loaded[e.area] || Math.hypot(e.position[0]-state.x,e.position[2]-state.distance) > (scrollMode?7:3.8))
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
      const targets=[...spatialExhibits.map(e=>({id:e.id,x:e.position[0],d:e.position[2]})),...castBodies().map(n=>({...n,id:'npc-'+n.id}))];
      const range=scrollMode?6.5:3.8;
      const near=nearbyTarget(state,targets.filter(t=>t.id.startsWith('npc-')),range)||nearbyTarget(state,targets,range);
      options.onUpdate({
        avatarLod,
        npcCount:[...cast.values()].filter(n=>n.active).length,
        npcsLoaded:cast.size,npcLoadError,
        npcStates:[...cast.values()].filter(n=>n.active).map(n=>({id:n.definition.id,x:n.x,d:n.d,clip:n.clip,time:n.time,lod:n.detail})),
        nearby:near?.id||null,furnitureLoaded:furniturePool.size,cameraFov:camera.fov,cameraDistance,cameraShoulder,reconnecting:!!reconnect,guideUnavailable,
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
        cameraX: camera.position.x,
        cameraYaw,
        cameraPitch,
      });
    }
    if (first) first = false;
    if (!announced && avatarReady && loaded[areaAt(options.initialDistance)] && office.furniture.filter(e=>e.area===areaAt(options.initialDistance)).every(e=>furniturePool.has(e.asset))) {
      announced = true;
      options.onReady();
      // Interiors are streamed by proximity; the structural envelope stays continuous.
    }
  }
  raf = requestAnimationFrame(update);
  return {
    setNavigationMode(mode: NavigationMode) {
      if(mode===navigationMode&&!reconnect)return;
      if(mode==='walk'&&reconnect){reconnect=null;pendingPublish=true;return;}
      guideUnavailable=false;
      if (mode === "scroll") {
        const path=reconnectPath(state,office,castBodies());
        if(path.length>1 && Math.abs(state.x-guideX(state.distance))>.12){
          reconnect={path,index:1,modeAfter:'scroll'};transition=null;guidedActive=false;input.x=0;input.forward=0;state.vx=0;state.vz=0;pendingPublish=true;return;
        }
        if(!path.length){guideUnavailable=true;pendingPublish=true;return;}
        anchor = { x: state.x, d: state.distance }; cameraYaw = 0; cameraPitch = 0;
      }
      else {
        camera.position.z -= world.position.z;camera.position.x-=world.position.x;
        world.position.z = 0;world.position.x=0;reconnect=null;
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
      if(reconnect)return;
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
      if (navigationMode !== "walk" || reconnect) return;
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
    setFov(value:number){camera.fov=Math.max(40,Math.min(65,value));camera.updateProjectionMatrix();assetDirty=true;pendingPublish=true;},
    setCamera(distance:number,shoulder:number){
      cameraDistance=Math.max(2.2,Math.min(8.5,distance));cameraShoulder=Math.max(-1.3,Math.min(1.3,shoulder));assetDirty=true;pendingPublish=true;
    },
    interact(){if(!paused){gesture=.9;assetDirty=true;pendingPublish=true;}},
    setQuality(value: GraphicQuality) {
      quality = value;
      renderer.setPixelRatio(value === "low" ? (softwareRenderer ? .45 : .7) : value === "medium" ? Math.min(devicePixelRatio,1.15) : value === "high" ? Math.min(devicePixelRatio, 1.75) : softwareRenderer ? .7 : Math.min(devicePixelRatio, 1.5));
      scene.environmentIntensity=value === "high" ? 0.36 : 0.30;
      const shadows = value !== "low" && host.clientWidth > 700 && !softwareRenderer;
      const changedShadows = renderer.shadowMap.enabled !== shadows;
      renderer.shadowMap.enabled = shadows;
      renderer.setSize(host.clientWidth, host.clientHeight);
      if (changedShadows) mats.forEach(m => { m.needsUpdate = true; });
      assetDirty = true;
      pendingPublish = true;
    },
    orbitCamera(dx: number, dy: number) {
      if (navigationMode !== "walk" || paused || document.hidden || !Number.isFinite(dx) || !Number.isFinite(dy)) return;
      cameraYaw = Math.atan2(Math.sin(cameraYaw-dx*.005), Math.cos(cameraYaw-dx*.005));
      cameraPitch = Math.max(-.15, Math.min(.7, cameraPitch+dy*.004));
      assetDirty = true;
      pendingPublish = true;
    },
    resetCamera() {
      if (paused || document.hidden) return;
      cameraYaw = 0; cameraPitch = 0;
      assetDirty = true; pendingPublish = true;
    },
    setReduced(value: boolean) {
      reduced = value;
    },
    goTo(index: number) {
      transition=null;guideUnavailable=false;
      cameraYaw = 0; cameraPitch = 0;
      reconnect=null;
      guidedActive = false;
      scrollTarget = state.distance;
      loadRoom(index);
      if(Math.abs(state.x-guideX(state.distance))>.15){
        const path=reconnectPath(state,office,castBodies());
        if(!path.length){guideUnavailable=true;pendingPublish=true;return;}
        reconnect={path,index:1,modeAfter:navigationMode,destination:index};pendingPublish=true;return;
      }
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
      for(const root of [scene,...furniturePool.values()])root.traverse((o) => {
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
      for(const model of [heroHigh,heroLow])if(model){model.mixer.stopAllAction();model.mixer.uncacheRoot(model.scene);}
      cast.forEach(n=>{for(const model of [n.high,n.low])if(model){model.mixer.stopAllAction();model.mixer.uncacheRoot(model.scene);}});
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
export type SpatialEngine = ReturnType<typeof createSpatialWorld>;
