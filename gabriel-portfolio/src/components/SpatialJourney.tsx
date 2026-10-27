"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { environments, spatialExhibits, services } from "@/data/site";
import { JOURNEY_END } from "@/lib/spatial-motion.mjs";
import type { SpatialEngine, SpatialSnapshot } from "@/lib/spatial-engine";

export default function SpatialJourney({
  initialDistance,
  onPosition,
  onClassic,
}: {
  initialDistance: number;
  onPosition: (distance: number) => void;
  onClassic: (id: string) => void;
}) {
  const host = useRef<HTMLDivElement>(null),
    stage = useRef<HTMLDivElement>(null),
    engine = useRef<SpatialEngine | null>(null);
  const [snapshot, setSnapshot] = useState<SpatialSnapshot>({
    distance: initialDistance,
    paused: false,
    x: 0,
    area: initialDistance < 35 ? 0 : 1,
    moving: false,
    transitioning: false,
    loaded: [false, false],
    hotspots: [],
    drawCalls: 0,
    triangles: 0,
    cameraZ: 0,
  });
  const [ready, setReady] = useState(false),
    [error, setError] = useState(""),
    [paused, setPaused] = useState(false),
    [reduced, setReduced] = useState(false),
    [started, setStarted] = useState(false);
  const [exhibit, setExhibit] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null),
    pauseBeforeDialog = useRef(false),
    keys = useRef(new Set<string>());
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;
  const positionCallback = useRef(onPosition);
  positionCallback.current = onPosition;
  const current = environments[snapshot.area],
    active = spatialExhibits.find((e) => e.id === exhibit);
  const clearInput = useCallback(() => {
    keys.current.clear();
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
              positionCallback.current(next.distance);
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
      Number(k.has("d")) - Number(k.has("a")),
      Number(k.has("w")) - Number(k.has("s")),
    );
  }
  function keyboard(e: React.KeyboardEvent, down: boolean) {
    if (e.target !== stage.current) return;
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
    if (down && !e.repeat && (key === "p" || key === "escape")) {
      e.preventDefault();
      setPaused((v) => !v);
    }
  }
  function goTo(index: number) {
    clearInput();
    setStarted(true);
    setPaused(false);
    engine.current?.setPaused(false);
    engine.current?.goTo(index);
    stage.current?.focus();
  }
  function openExhibit(id: string) {
    pauseBeforeDialog.current = paused;
    clearInput();
    setPaused(true);
    setExhibit(id);
  }
  function closeExhibit() {
    setExhibit(null);
    setPaused(pauseBeforeDialog.current);
    stage.current?.focus();
  }
  function touch(
    e: React.PointerEvent<HTMLButtonElement>,
    key: string,
    down: boolean,
  ) {
    if (down) {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      keys.current.add(key);
      setStarted(true);
    } else keys.current.delete(key);
    sendInput();
  }
  const percentage = Math.round((snapshot.distance / JOURNEY_END) * 100);
  return (
    <main className={`spatial-shell ${reduced ? "motion-reduced" : ""}`}>
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
          <span className="prototype-label">ESTUDO ESPACIAL / 01—02</span>
          <button
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
          )
            stage.current?.focus();
        }}
        data-distance={snapshot.distance.toFixed(3)}
        data-paused={snapshot.paused}
        data-x={snapshot.x.toFixed(3)}
        data-camera-z={snapshot.cameraZ.toFixed(3)}
        data-area={current.id}
        data-loaded={snapshot.loaded.filter(Boolean).length}
        data-draw-calls={snapshot.drawCalls}
        data-triangles={snapshot.triangles}
      >
        <div ref={host} className="world-canvas" />
        {!error && !ready && (
          <div className="spatial-loading" role="status">
            <span className="loading-rule" />
            <p>Preparando o átrio.</p>
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
            <p className="spatial-kicker">
              {current.number} / {current.name}
            </p>
            <h1>{current.title}</h1>
            <p>{current.description}</p>
            <button
              className="spatial-text-link"
              disabled={!ready}
              onClick={() =>
                openExhibit(snapshot.area === 0 ? "perfil" : "servicos")
              }
            >
              {snapshot.area === 0 ? "Conhecer Gabriel" : "Explorar serviços"}{" "}
              <span aria-hidden="true">→</span>
            </button>
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
                {!started ? "Foque o cenário para começar. " : ""}
                <strong>WASD / setas</strong> para caminhar · P ou Esc para
                pausar
              </p>
              <label className="motion-toggle">
                <input
                  type="checkbox"
                  checked={reduced}
                  onChange={(e) => setReduced(e.target.checked)}
                />
                Movimento reduzido
              </label>
              <button
                className="spatial-button pause-button"
                disabled={!ready}
                aria-pressed={paused}
                onClick={() => setPaused((v) => !v)}
              >
                {paused ? "Continuar exploração" : "Pausar exploração"}{" "}
                <span aria-hidden="true">{paused ? "▷" : "||"}</span>
              </button>
            </div>
            <div className="journey-bottom">
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
                    : snapshot.distance > 66
                      ? "Fim da demonstração · retorne ou explore os painéis"
                      : snapshot.distance > 22 && snapshot.distance < 37
                        ? "Passagem entre ambientes"
                        : "Dois espaços. Um caminho."}
                </small>
              </div>
            </div>
          </section>
          <div
            className="spatial-touch"
            data-spatial-blocker
            role="group"
            aria-label="Controles de toque"
          >
            {[
              { key: "w", label: "Caminhar para frente", symbol: "↑" },
              { key: "a", label: "Caminhar à esquerda", symbol: "←" },
              { key: "s", label: "Caminhar para trás", symbol: "↓" },
              { key: "d", label: "Caminhar à direita", symbol: "→" },
            ].map((b) => (
              <button
                key={b.key}
                className={`direction-${b.key}`}
                aria-label={b.label}
                disabled={paused || !ready}
                onPointerDown={(e) => touch(e, b.key, true)}
                onPointerUp={(e) => touch(e, b.key, false)}
                onPointerCancel={(e) => touch(e, b.key, false)}
                onLostPointerCapture={() => {
                  keys.current.delete(b.key);
                  sendInput();
                }}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    keys.current.add(b.key);
                    sendInput();
                  }
                }}
                onKeyUp={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    keys.current.delete(b.key);
                    sendInput();
                  }
                }}
                onBlur={() => {
                  keys.current.delete(b.key);
                  sendInput();
                }}
              >
                {b.symbol}
              </button>
            ))}
          </div>
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
          <h2 id="exhibit-title">{active.title}</h2>
          <p>{active.body}</p>
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
          {active.id === "conceito" && (
            <Link className="primary" href="/projetos/conceito-landing">
              Ver projeto conceitual →
            </Link>
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
