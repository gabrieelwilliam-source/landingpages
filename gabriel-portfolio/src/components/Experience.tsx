"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import ClassicPortfolio from "./ClassicPortfolio";
import SpatialJourney from "./SpatialJourney";

export default function Experience() {
  // Server-render the complete classic content; enhance into 3D only with JavaScript.
  const [mode, setMode] = useState<"classic" | "spatial">("classic");
  const position = useRef(0),
    section = useRef("sobre");
  const [entry, setEntry] = useState(0);
  useEffect(() => {
    if (!location.hash) setMode("spatial");
    const anchor = () => setMode("classic");
    window.addEventListener("hashchange", anchor);
    return () => window.removeEventListener("hashchange", anchor);
  }, []);
  const rememberSection = useCallback((id: string) => {
    if (id === "sobre" || id === "servicos") section.current = id;
  }, []);
  function explore() {
    history.replaceState(null, "", location.pathname + location.search);
    setEntry(
      section.current === "servicos" && position.current < 35
        ? 49
        : section.current === "sobre" && position.current >= 35
          ? 4
          : position.current,
    );
    setMode("spatial");
  }
  function classic(id: string) {
    section.current = id;
    setMode("classic");
    history.replaceState(null, "", `#${id}`);
    requestAnimationFrame(() => {
      const target = document.getElementById(id);
      target?.scrollIntoView({ behavior: "instant" });
      target?.setAttribute("tabindex", "-1");
      target?.focus({ preventScroll: true });
    });
  }
  return mode === "spatial" ? (
    <SpatialJourney
      initialDistance={entry}
      onPosition={(distance) => {
        position.current = distance;
        section.current = distance < 35 ? "sobre" : "servicos";
      }}
      onClassic={classic}
    />
  ) : (
    <ClassicPortfolio onExplore={explore} onSection={rememberSection} />
  );
}
