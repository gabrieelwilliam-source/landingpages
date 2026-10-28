"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { environments, spatialExhibits, services, projects, automationConcepts } from "@/data/site";
import NavigationModes from "./ui/NavigationModes";
import VirtualJoystick from "./VirtualJoystick";
import ContactForm from "./ContactForm";
import ProjectGallery from "./ProjectGallery";
import actors from "@/data/studio-actors.json";
import StudioAssistant from "./StudioAssistant";
import AutomationDemo from "./AutomationDemo";
import BriefingAssistant from "./BriefingAssistant";
import {
  normalizeWheel,
  areaAt,
  destinations,
  JOURNEY_END,
} from "@/lib/spatial-motion.mjs";
import type {
  NavigationMode,
  GraphicQuality,
  SpatialEngine,
  SpatialSnapshot,
} from "@/lib/spatial-engine";

export default function SpatialJourney({
  initialDistance,
  navigationMode,
  onNavigationChange,
  onPosition,
  onClassic,
}: {
  initialDistance: number;
  navigationMode: NavigationMode;
  onNavigationChange: (mode: NavigationMode) => void;
  onPosition: (distance: number) => void;
  onClassic: (id: string) => void;
}) {
  const shell = useRef<HTMLElement>(null);
  const drag = useRef<{ id: number; y: number } | null>(null);
  const orbitDrag = useRef<{id: number; x: number; y: number} | null>(null);
  const navigationRef = useRef(navigationMode);
  navigationRef.current = navigationMode;
  const host = useRef<HTMLDivElement>(null),
    stage = useRef<HTMLDivElement>(null),
    engine = useRef<SpatialEngine | null>(null);
  const [snapshot, setSnapshot] = useState<SpatialSnapshot>({
    furnitureLoaded:0,cameraFov:50,avatarLod:"high",npcCount:0,npcsLoaded:0,npcLoadError:false,npcStates:[],nearby:null,cameraDistance:5.4,cameraShoulder:-1.2,reconnecting:false,guideUnavailable:false,
    rigBones: 0,
    animation: "Idle",
    avatarZ: -initialDistance,
    worldZ: 0,
    progress: initialDistance / JOURNEY_END,
    distance: initialDistance,
    navigationMode,
    paused: false,
    x: 0,
    area: areaAt(initialDistance),
    moving: false,
    transitioning: false,
    loaded: [false, false],
    hotspots: [],
    drawCalls: 0,
    triangles: 0,
    cameraZ: 0,
    cameraX: 0,
    cameraYaw: 0,
    cameraPitch: 0,
  });
  const [ready, setReady] = useState(false),
    [error, setError] = useState(""),
    [paused, setPaused] = useState(false),
    [reduced, setReduced] = useState(false),
    [started, setStarted] = useState(false);
  const [quality, setQuality] = useState<GraphicQuality>("auto");
  const [help,setHelp]=useState(false);
  const [fieldOfView,setFieldOfView]=useState(50);
  const [areaDetails,setAreaDetails]=useState(false);
  const [cameraDistance,setCameraDistance]=useState(5.4),[cameraShoulder,setCameraShoulder]=useState(-1.2);
  const [exhibit, setExhibit] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null),
    returnFocus = useRef<HTMLElement | null>(null),
    pauseBeforeDialog = useRef(false),
    keys = useRef(new Set<string>());
  const analog = useRef({ x: 0, forward: 0 });
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;
  const lastArea = useRef(-1);
  const positionCallback = useRef(onPosition);
  positionCallback.current = onPosition;
  const current = environments[snapshot.area],
    activeActor=actors.find(a=>'npc-'+a.id===exhibit),
    active = spatialExhibits.find((e) => e.id === exhibit) || (activeActor?{id:'npc-'+activeActor.id,title:`${activeActor.name} · ${activeActor.role}`,label:activeActor.role,body:'',area:activeActor.area,position:[activeActor.x,1.4,activeActor.d]}:undefined);
  const clearInput = useCallback(() => {
    keys.current.clear();
    analog.current = { x: 0, forward: 0 };
    orbitDrag.current = null;
    engine.current?.setInput(0, 0);
  }, []);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    let cancelled = false;
    let instance: SpatialEngine | null = null;
    import("@/lib/spatial-engine")
      .then(({ createSpatialWorld }) => {
        if (cancelled || !host.current) return;
        instance = createSpatialWorld(host.current, {
          initialDistance,
          navigationMode: navigationRef.current,
          reduced: reducedRef.current,
          paused: pausedRef.current,
          onReady: () => {
            if (!cancelled) setReady(true);
          },
          onError: (message) => {
            if (!cancelled) {
              setError(message);
              setPaused(true);
            }
          },
          onUpdate: (next) => {
            if (!cancelled) {
              // Keep annotations on their objects while reserving readable HUD areas.
              const width = host.current?.clientWidth || 1,
                height = host.current?.clientHeight || 1;
              const blockers = Array.from(
                document.querySelectorAll("[data-spatial-blocker]"),
              ).map((e) => e.getBoundingClientRect());
              const hotspots = next.hotspots.filter((h) => {
                const x = Math.max(
                    85,
                    Math.min(width - 85, (h.x / 100) * width),
                  ),
                  y = (h.y / 100) * height;
                return !blockers.some(
                  (r) =>
                    x + 85 > r.left &&
                    x - 85 < r.right &&
                    y + 24 > r.top &&
                    y - 24 < r.bottom,
                );
              });
              setSnapshot({ ...next, hotspots });
              if(next.guideUnavailable&&navigationRef.current!==next.navigationMode)onNavigationChange(next.navigationMode);
              positionCallback.current(next.distance);
              if (lastArea.current !== next.area) {
                lastArea.current = next.area;
                const url = new URL(location.href);
                url.searchParams.set("chapter", environments[next.area].id);
                history.replaceState(null, "", url);
              }
            }
          },
        });
        engine.current = instance;
      })
      .catch(() => {
        if (!cancelled)
          setError(
            "A experiência 3D não está disponível neste dispositivo. Todo o portfólio continua acessível no modo clássico.",
          );
      });
    return () => {
      cancelled = true;
      instance?.dispose();
      engine.current = null;
    };
  }, [initialDistance]);
  useEffect(() => {
    clearInput();
    drag.current = null;
    engine.current?.setNavigationMode(navigationMode);
  }, [navigationMode, clearInput]);
  useEffect(() => {
    const element = shell.current;
    if (!element || !ready || navigationMode !== "scroll") return;
    const wheel = (event: WheelEvent) => {
      if (
        paused ||
        exhibit ||
        event.ctrlKey ||
        event.metaKey ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
      )
        return;
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest('dialog,input,textarea,select,[contenteditable="true"],[data-spatial-blocker]')
      )
        return;
      const pixels = normalizeWheel(
        event.deltaY,
        event.deltaMode,
        element.clientHeight,
      );
      if (!pixels) return;
      event.preventDefault();
      setStarted(true);
      engine.current?.scrollBy(pixels);
    };
    element.addEventListener("wheel", wheel, { passive: false });
    return () => element.removeEventListener("wheel", wheel);
  }, [navigationMode, ready, paused, exhibit]);
  useEffect(() => {
    engine.current?.setPaused(paused);
    if (paused) clearInput();
  }, [paused, clearInput]);
  useEffect(() => {
    engine.current?.setReduced(reduced);
  }, [reduced]);
  useEffect(() => {
    const suspend = () => {
      clearInput();
      setPaused(true);
    };
    const visibility = () => {
      if (document.hidden) suspend();
    };
    window.addEventListener("blur", suspend);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("blur", suspend);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [clearInput]);
  useEffect(() => {
    if (exhibit && dialog.current && !dialog.current.open)
      dialog.current.showModal();
  }, [exhibit]);
  function sendInput() {
    const k = keys.current;
    engine.current?.setInput(
      Number(k.has("d")) - Number(k.has("a")) + analog.current.x,
      Number(k.has("w")) - Number(k.has("s")) + analog.current.forward,
    );
  }
  function keyboard(e: React.KeyboardEvent, down: boolean) {
    if (e.target !== stage.current || e.ctrlKey || e.metaKey || e.altKey)
      return;
    if (down && !e.repeat && e.key.toLowerCase()==='e' && snapshot.nearby && !paused) {
      e.preventDefault();openExhibit(snapshot.nearby);return;
    }
    if (navigationMode === "scroll") {
      const steps: Record<string, number> = {
        ArrowDown: 100,
        ArrowUp: -100,
        PageDown: 600,
        PageUp: -600,
      };
      if (e.key in steps) {
        e.preventDefault();
        if (down) {
          setStarted(true);
          engine.current?.scrollBy(steps[e.key]);
        }
        return;
      }
      if (
        ["w", "a", "s", "d", "arrowleft", "arrowright"].includes(
          e.key.toLowerCase(),
        )
      )
        return;
    }
    const aliases: Record<string, string> = {
      arrowup: "w",
      arrowdown: "s",
      arrowleft: "a",
      arrowright: "d",
    };
    const raw = e.key.toLowerCase(),
      key = aliases[raw] || raw;
    if (["w", "a", "s", "d"].includes(key)) {
      e.preventDefault();
      if (down) {
        keys.current.add(key);
        setStarted(true);
      } else keys.current.delete(key);
      sendInput();
    }
    if (navigationMode === "walk" && down && ["i","j","k","l","r"].includes(key)) {
      e.preventDefault();
      if (key === "r") engine.current?.resetCamera();
      else engine.current?.orbitCamera(key === "j" ? -45 : key === "l" ? 45 : 0, key === "i" ? -35 : key === "k" ? 35 : 0);
    }
    if (down && !e.repeat && (key === "p" || key === "escape")) {
      e.preventDefault();
      setPaused((v) => !v);
    }
  }
  useEffect(() => {
    const navigate = () => {
      const id = new URL(location.href).searchParams.get("chapter");
      const index = environments.findIndex((e) => e.id === id);
      if (index >= 0) {
        engine.current?.setPaused(false);
        setPaused(false);
        engine.current?.goTo(index);
      }
    };
    window.addEventListener("popstate", navigate);
    return () => window.removeEventListener("popstate", navigate);
  }, []);
  function goTo(index: number) {
    setHelp(false);setAreaDetails(false);
    const url = new URL(location.href);
    url.searchParams.set("chapter", environments[index].id);
    history.pushState(null, "", url);
    clearInput();
    setStarted(true);
    setPaused(false);
    engine.current?.setPaused(false);
    engine.current?.goTo(index);
    stage.current?.focus();
  }
  function openExhibit(id: string) {
    returnFocus.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    pauseBeforeDialog.current = paused;
    clearInput();
    setPaused(true);
    setExhibit(id);
  }
  function closeExhibit() {
    setExhibit(null);
    setPaused(pauseBeforeDialog.current);
    if(!pauseBeforeDialog.current){engine.current?.setPaused(false);engine.current?.interact();}
    requestAnimationFrame(() => {
      const target = returnFocus.current;
      (target?.isConnected ? target : stage.current)?.focus({
        preventScroll: true,
      });
    });
  }
  const percentage = Math.round((snapshot.distance / JOURNEY_END) * 100);
  return (
    <main
      ref={shell}
      className={`spatial-shell ${started ? "explored" : ""} ${help ? "help-open" : ""} ${areaDetails ? "area-open" : ""} ${reduced ? "motion-reduced" : ""} navigation-${navigationMode}`}
    >
      <a
        className="skip-link"
        href="#classic-access"
        onClick={(e) => {
          e.preventDefault();
          onClassic("sobre");
        }}
      >
        Pular para o modo clássico
      </a>
      <header className="spatial-header" data-spatial-blocker>
        <a
          href="#sobre"
          className="signature"
          onClick={(e) => {
            e.preventDefault();
            onClassic("sobre");
          }}
        >
          Gabriel<span className="dot">.</span>
          <small>WEB & DIGITAL / by zAIon</small>
        </a>
        <div className="spatial-header-actions">
          <NavigationModes
            value={navigationMode}
            onChange={(next) => {
              clearInput();
              onNavigationChange(next);
            }}
          />
              <button
                className="spatial-button pause-button"
                disabled={!ready}
                aria-label={paused ? "Continuar exploração" : "Pausar exploração"}
                title={paused ? "Continuar exploração" : "Pausar exploração"}
                aria-pressed={paused}
                onClick={() => setPaused((v) => !v)}
              >
                <span aria-hidden="true">{paused ? "▷" : "||"}</span>
              </button>
          <button className="spatial-button studio-menu-toggle" aria-label="Câmera e ajuda" title="Câmera e ajuda" aria-expanded={help} aria-controls="studio-options" onClick={()=>{setHelp(v=>!v);requestAnimationFrame(()=>{if(help)stage.current?.focus({preventScroll:true});else document.getElementById("studio-options")?.focus()})}}>☰</button>
          <button
            id="classic-access"
            className="spatial-button"
            onClick={() => onClassic(current.id)}
          >
            Modo clássico →
          </button>
        </div>
      </header>
      <div
        className="world-stage"
        ref={stage}
        tabIndex={0}
        role="region"
        aria-label="Jornada espacial em terceira pessoa"
        aria-describedby="spatial-help"
        onKeyDown={(e) => keyboard(e, true)}
        onKeyUp={(e) => keyboard(e, false)}
        onBlur={clearInput}
        onPointerDown={(e) => {
          if (
            e.target === host.current ||
            e.target instanceof HTMLCanvasElement
          ) {
            stage.current?.focus();
            if (navigationMode === "walk" && ready && !paused && !orbitDrag.current && e.button === 0) {
              e.preventDefault();
              orbitDrag.current = {id: e.pointerId, x: e.clientX, y: e.clientY};
              e.currentTarget.setPointerCapture(e.pointerId);
            }
            if (
              navigationMode === "scroll" &&
              e.pointerType === "touch" &&
              e.isPrimary &&
              !paused
            ) {
              e.preventDefault();
              drag.current = { id: e.pointerId, y: e.clientY };
              e.currentTarget.setPointerCapture(e.pointerId);
            }
          }
        }}
        onPointerMove={(e) => {
          const orbit = orbitDrag.current;
          if (orbit && e.pointerId === orbit.id && navigationMode === "walk" && !paused) {
            e.preventDefault();
            engine.current?.orbitCamera(e.clientX-orbit.x, e.clientY-orbit.y);
            orbit.x = e.clientX; orbit.y = e.clientY;
            return;
          }
          if (
            !drag.current ||
            e.pointerId !== drag.current.id ||
            navigationMode !== "scroll" ||
            paused
          )
            return;
          const pixels = drag.current.y - e.clientY;
          drag.current.y = e.clientY;
          engine.current?.scrollBy(normalizeWheel(pixels));
          setStarted(true);
        }}
        onPointerUp={() => {
          orbitDrag.current = null;
          drag.current = null;
        }}
        onPointerCancel={() => {
          orbitDrag.current = null;
          drag.current = null;
          engine.current?.cancelScroll();
        }}
        onLostPointerCapture={() => {
          orbitDrag.current = null;
          drag.current = null;
        }}
        data-furniture-loaded={snapshot.furnitureLoaded}
        data-camera-fov={snapshot.cameraFov}
        data-avatar-lod={snapshot.avatarLod}
        data-npc-count={snapshot.npcCount}
        data-npcs-loaded={snapshot.npcsLoaded}
        data-npc-states={JSON.stringify(snapshot.npcStates)}
        data-reconnecting={snapshot.reconnecting}
        data-nearby={snapshot.nearby||''}
        data-camera-distance={snapshot.cameraDistance}
        data-camera-shoulder={snapshot.cameraShoulder}
        data-rig-bones={snapshot.rigBones}
        data-animation={snapshot.animation}
        data-avatar-z={snapshot.avatarZ.toFixed(3)}
        data-world-z={snapshot.worldZ.toFixed(3)}
        data-progress={snapshot.progress.toFixed(5)}
        data-navigation={snapshot.navigationMode}
        data-quality={quality}
        data-distance={snapshot.distance.toFixed(3)}
        data-paused={snapshot.paused}
        data-x={snapshot.x.toFixed(3)}
        data-camera-z={snapshot.cameraZ.toFixed(3)}
        data-camera-x={snapshot.cameraX.toFixed(3)}
        data-camera-yaw={snapshot.cameraYaw.toFixed(3)}
        data-camera-pitch={snapshot.cameraPitch.toFixed(3)}
        data-area={current.id}
        data-loaded={snapshot.loaded.filter(Boolean).length}
        data-draw-calls={snapshot.drawCalls}
        data-triangles={snapshot.triangles}
      >
        <div ref={host} className="world-canvas" />
        {!error && !ready && (
          <div className="spatial-loading" role="status">
            <span className="loading-rule" />
            <p>Preparando a jornada.</p>
            <small>A jornada carrega em etapas.</small>
          </div>
        )}
        {error && (
          <div className="spatial-fallback" role="alert">
            <h1>Um outro caminho.</h1>
            <p>{error}</p>
            <button className="primary" onClick={() => onClassic(current.id)}>
              Continuar no modo clássico
            </button>
          </div>
        )}
      </div>
      {!error && (
        <>
          <aside
            className="spatial-editorial"
            data-spatial-blocker
            aria-label="Ambiente atual"
          >
            <button className="area-disclosure" aria-expanded={areaDetails} onClick={()=>setAreaDetails(v=>!v)}>{areaDetails?"Fechar apresentação":"Sobre este ambiente"}</button>
            <p className="spatial-kicker">
              {current.number} / {current.name}
            </p>
            <h1>{current.title}</h1>
            <p>{current.description}</p>
            <button
              className="spatial-text-link"
              disabled={!ready}
              onClick={() =>
                openExhibit(
                  spatialExhibits.find((e) => e.area === snapshot.area)!.id,
                )
              }
            >
              {spatialExhibits.find((e) => e.area === snapshot.area)!.label}{" "}
              <span aria-hidden="true">→</span>
            </button>
            <button className="spatial-text-link studio-area-assistant" disabled={!ready} onClick={()=>openExhibit('npc-'+actors.find(a=>a.area===snapshot.area)!.id)}>Orientação do ambiente →</button>
            {snapshot.area === 3 && <button className="spatial-text-link" disabled={!ready} onClick={() => openExhibit("galeria")}>Filtrar projetos →</button>}
            {snapshot.area === 0 && (
              <div className="portal-actions" data-spatial-blocker>
                <button className="primary" onClick={() => goTo(1)}>
                  Explorar a jornada →
                </button>
                <button className="spatial-button" onClick={() => goTo(3)}>
                  Ver projetos
                </button>
              </div>
            )}
            {snapshot.area === 5 && (
              <div
                className="portal-actions destination-actions"
                data-spatial-blocker
              >
                <button
                  className="primary"
                  onClick={() => openExhibit("contato")}
                >
                  Preparar resumo local
                </button>
                <button className="spatial-button" onClick={() => goTo(3)}>
                  Visitar galeria
                </button>
              </div>
            )}
          </aside>
          {ready &&
            snapshot.hotspots.map((h) => {
              const item = spatialExhibits.find((e) => e.id === h.id)!;
              return (
                <button
                  className="world-hotspot"
                  key={h.id}
                  style={{
                    left: `clamp(85px, ${h.x}%, calc(100% - 85px))`,
                    top: `${h.y}%`,
                  }}
                  onClick={() => openExhibit(h.id)}
                  aria-label={`Abrir: ${item.label}`}
                >
                  <span aria-hidden="true">＋</span>
                  <span>{item.label}</span>
                </button>
              );
            })}

          <div className="studio-tools" data-spatial-blocker>
            {help&&<section id="studio-options" aria-label="Ajustes da visita" tabIndex={-1} onKeyDown={e=>{if(e.key==="Escape"){e.preventDefault();setHelp(false);stage.current?.focus({preventScroll:true})}}}>
              <h2>Explorar o estúdio</h2>
              <label className="graphic-quality">
                <span>Gráficos</span>
                <select aria-label="Gráficos" value={quality} disabled={!ready} onChange={e => {
                  const next = e.target.value as GraphicQuality;
                  setQuality(next); engine.current?.setQuality(next);
                }}>
                  <option value="auto">Automático</option>
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alto</option>
                </select>
              </label>
              <label className="motion-toggle">
                <input
                  type="checkbox"
                  checked={reduced}
                  onChange={(e) => setReduced(e.target.checked)}
                />
                Movimento reduzido
              </label>



                        {navigationMode === "walk" && <button className="spatial-button camera-reset" data-spatial-blocker disabled={!ready || paused} onClick={() => engine.current?.resetCamera()}>Recentrar câmera</button>}
              <label>Distância da câmera<input aria-label="Distância da câmera" type="range" min="2.2" max="8.5" step=".1" value={cameraDistance} onChange={e=>{const value=Number(e.target.value);setCameraDistance(value);engine.current?.setCamera(value,cameraShoulder)}}/></label>
              <label>Campo de visão<input aria-label="Campo de visão" type="range" min="40" max="65" step="1" value={fieldOfView} onChange={e=>{const value=Number(e.target.value);setFieldOfView(value);engine.current?.setFov(value)}}/></label>
              <label>Ombro da câmera<select aria-label="Ombro da câmera" value={cameraShoulder} onChange={e=>{const value=Number(e.target.value);setCameraShoulder(value);engine.current?.setCamera(cameraDistance,value)}}><option value={-1.2}>Esquerdo</option><option value={0}>Central</option><option value={1.2}>Direito</option></select></label>


                        <nav
            className="chapter-step"
            aria-label="Percorrer capítulos"
            data-spatial-blocker
          >
            <button
              disabled={!ready || snapshot.area === 0}
              onClick={() => goTo(snapshot.area - 1)}
            >
              ← Anterior
            </button>
            <span>{snapshot.area + 1} / 6</span>
            <button
              disabled={!ready || snapshot.area === 5}
              onClick={() => goTo(snapshot.area + 1)}
            >
              Próximo →
            </button>
          </nav>
              <nav
                className="environment-shortcuts"
                aria-label="Atalhos para ambientes"
              >
                {environments.map((e, i) => (
                  <button
                    key={e.id}
                    disabled={!ready}
                    aria-current={snapshot.area === i ? "step" : undefined}
                    onClick={() => goTo(i)}
                  >
                    <small>{e.number}</small>
                    <span>{e.name}</span>
                    <span aria-hidden="true">→</span>
                  </button>
                ))}
              </nav>
              <p>No celular, use o analógico para andar e arraste a cena com o outro dedo para olhar. WASD/setas: caminhar. Arraste: olhar. I/J/K/L: orientar a câmera. E: interagir por proximidade. R: recentrar. P/Esc: pausa. No Scroll, role ou deslize para avançar e retornar.</p>
              <p><Link href="/creditos">Créditos dos modelos e licenças →</Link></p>
              <p>Equipe fictícia e simulações locais. Nenhuma conversa com IA ao vivo.</p>
            </section>}
          </div>
          {snapshot.nearby&&ready&&!paused&&<button className="studio-nearby" data-spatial-blocker onClick={()=>openExhibit(snapshot.nearby!)}><kbd>E</kbd> {snapshot.nearby.startsWith('npc-')?'Conversar com '+actors.find(a=>'npc-'+a.id===snapshot.nearby)?.name:'Abrir '+spatialExhibits.find(e=>e.id===snapshot.nearby)?.label}</button>}
          {snapshot.reconnecting&&<p className="studio-route-status" role="status">Reconectando à visita por um caminho livre…</p>}
          {snapshot.guideUnavailable&&<p className="studio-route-status" role="status">O caminho está bloqueado. Caminhe para uma área livre e tente novamente.</p>}
          {snapshot.npcLoadError&&<p className="studio-load-note" role="status">Um personagem não carregou. A orientação continua disponível nos painéis e no modo clássico.</p>}
          <div className="spatial-compass" aria-hidden="true">
            <span>N</span>
            <i />
            <small>FRENTE</small>
          </div>
          <section
            className="journey-console"
            data-spatial-blocker
            aria-label="Controles da exploração"
          >
            <div className="journey-status">
              <p id="spatial-help">
                {navigationMode === "walk" ? (
                  <>
                    {!started ? "Foque o cenário para começar. " : ""}
                    <strong>WASD / setas</strong> para caminhar · arraste para olhar · I/J/K/L para câmera · R recentra
                  </>
                ) : (
                  <>
                    <strong>Rode o mouse ou deslize</strong> para avançar e
                    voltar
                  </>
                )}{" "}
                · P ou Esc para pausar
              </p>

            </div>
            <div className="journey-bottom">

              <div className="spatial-progress">
                <label htmlFor="journey-progress">
                  Percurso <span>{percentage}%</span>
                </label>
                <progress
                  id="journey-progress"
                  value={snapshot.distance}
                  max={JOURNEY_END}
                >
                  {percentage}%
                </progress>
                <small>
                  {snapshot.transitioning
                    ? "Em travessia"
                    : snapshot.distance > JOURNEY_END - 3
                      ? "Você chegou · reinicie ou visite a galeria"
                      : snapshot.transitioning
                        ? "Passagem entre ambientes"
                        : "Seis momentos. Uma jornada."}
                </small>
              </div>
            </div>
          </section>

          {navigationMode === "walk" ? (
            <VirtualJoystick disabled={paused || !ready || Boolean(exhibit) || help}
              onMove={(x, forward) => {
                analog.current = { x, forward };
                if (x || forward) setStarted(true);
                sendInput();
              }} />
          ) : (
            <div className="spatial-scroll-hint" data-spatial-blocker>
              <span aria-hidden="true">↕</span>
              <p>
                Role para explorar<small>Para cima, você retorna.</small>
              </p>
            </div>
          )}
          {paused && !exhibit && ready && (
            <div className="pause-notice" role="status">
              Exploração pausada.{" "}
              <button onClick={() => setPaused(false)}>Continuar →</button>
            </div>
          )}
          <span
            className="spatial-area-announcement sr-only"
            aria-live="polite"
          >
            Ambiente {current.number}: {current.name}
          </span>
        </>
      )}
      {active && (
        <dialog
          className="spatial-dialog"
          ref={dialog}
          aria-labelledby="exhibit-title"
          onCancel={(e) => {
            e.preventDefault();
            dialog.current?.close();
            closeExhibit();
          }}
          onClose={() => {
            if (exhibit) closeExhibit();
          }}
        >
          <div className="exhibit-heading">
            <span className="overline">{environments[active.area].name}</span>
            <button
              aria-label="Fechar painel"
              onClick={() => {
                dialog.current?.close();
                closeExhibit();
              }}
            >
              ×
            </button>
          </div>
          {active.id.startsWith("conceito-") && (
            <img
              className="concept-preview"
              src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/concepts/${active.id}.png`}
              alt={`Demonstração autoral de ${active.title}; projeto conceitual`}
            />
          )}
          {active.area === 4 && (
            <img
              className="brand-mark"
              src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/brand/zaion-original.png`}
              alt="zAIon Automações — logo original"
            />
          )}
          <h2 id="exhibit-title">{active.title}</h2>
          <p>{active.body}</p>
          {active.id === "contato" && <><BriefingAssistant/><ContactForm /></>}
          {activeActor&&<StudioAssistant actor={activeActor} onGuided={()=>{dialog.current?.close();closeExhibit();onNavigationChange("scroll")}} onFree={()=>{dialog.current?.close();closeExhibit();onNavigationChange("walk")}} onClassic={()=>onClassic(current.id)} onProjects={()=>setExhibit("galeria")}/>}
          {active.id === "galeria" && <ProjectGallery />}
          {active.id.startsWith("workstation-")&&<Link className="primary" href={`/projetos/${projects[Number(active.id.split('-')[1])].slug}`}>Abrir demonstração do projeto →</Link>}
          {active.id === "servicos" && (
            <div className="exhibit-services">
              {services.map((s) => (
                <article key={s.name}>
                  <h3>{s.name}</h3>
                  <p>{s.detail}</p>
                </article>
              ))}
            </div>
          )}
          {(active.id.startsWith("conceito-") || active.id === "conceito") && (
            <Link
              className="primary"
              href={`/projetos/${active.id === "conceito" ? "conceito-landing" : active.id}`}
            >
              Ver projeto conceitual →
            </Link>
          )}
          {active.id.startsWith("conceito-") && (
            <dl className="case-facts">
              <dt>Papel</dt>
              <dd>Estudo de interface autoral; sem cliente real.</dd>
              <dt>Problema / solução</dt>
              <dd>{projects.find((p) => p.slug === active.id)?.description}</dd>
              <dt>Stack</dt>
              <dd>Next.js, TypeScript, CSS autoral</dd>
            </dl>
          )}
          {active.id === "processo" && <AutomationDemo/>}
          {active.id === "processo" && <section aria-label="Fluxos conceituais locais">
            <h3>Automações em demonstração</h3>
            <p>Diagramas ilustrativos locais. Sem integração, envio ou operação real comprovada.</p>
            {automationConcepts.map(concept => <article key={concept.title}><h4>{concept.title}</h4><p>{concept.steps.join(" → ")}</p></article>)}
          </section>}
          {active.id === "processo" && (
            <ol>
              {[
                "Entender",
                "Planejar",
                "Desenhar",
                "Desenvolver",
                "Testar e entregar",
              ].map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ol>
          )}
          <button
            className="spatial-text-link"
            onClick={() => onClassic(environments[active.area].id)}
          >
            Ler no modo clássico →
          </button>
        </dialog>
      )}
    </main>
  );
}
