"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { environments } from "@/data/site";
import { areaAt, destinations } from "@/lib/spatial-motion.mjs";
import ClassicPortfolio from "./ClassicPortfolio";
import SpatialJourney from "./SpatialJourney";
import type { NavigationMode } from "@/lib/spatial-engine";

export default function Experience() {
  // Server-render the complete classic content; enhance into 3D only with JavaScript.
  const [mode, setMode] = useState<"classic" | "spatial">("classic");
  const position = useRef(0),
    section = useRef("sobre");
  const [entry, setEntry] = useState(0);
  const [navigationMode, setNavigationMode] =
    useState<NavigationMode>("scroll");
  useEffect(() => {
    const chapter = new URL(location.href).searchParams.get("chapter");
    const index = environments.findIndex((e) => e.id === chapter);
    if (index >= 0) setEntry(destinations[index]);
    if (
      !location.hash &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      setMode("spatial");
    const anchor = () => setMode("classic");
    window.addEventListener("hashchange", anchor);
    return () => window.removeEventListener("hashchange", anchor);
  }, []);
  const rememberSection = useCallback((id: string) => {
    section.current = id;
  }, []);
  function explore() {
    history.replaceState(null, "", location.pathname + location.search);
    const i = environments.findIndex((e) => e.id === section.current);
    setEntry(
      i >= 0 && areaAt(position.current) !== i
        ? destinations[i]
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
      navigationMode={navigationMode}
      onNavigationChange={setNavigationMode}
      onPosition={(distance) => {
        position.current = distance;
        section.current = environments[areaAt(distance)].id;
      }}
      onClassic={classic}
    />
  ) : (
    <ClassicPortfolio onExplore={explore} onSection={rememberSection} />
  );
}
