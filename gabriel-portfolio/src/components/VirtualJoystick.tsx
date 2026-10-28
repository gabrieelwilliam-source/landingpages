"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { joystickVector } from "@/lib/joystick.mjs";

export default function VirtualJoystick({ disabled, onMove }: {
  disabled: boolean;
  onMove: (x: number, forward: number) => void;
}) {
  const pointer = useRef<number | null>(null);
  const origin = useRef({ x: 0, y: 0, radius: 34 });
  const callback = useRef(onMove);
  callback.current = onMove;
  const held = useRef(new Set<string>());
  const [thumb, setThumb] = useState({ x: 0, y: 0 });
  const reset = useCallback(() => {
    pointer.current = null;
    held.current.clear();
    setThumb({ x: 0, y: 0 });
    callback.current(0, 0);
  }, []);
  useEffect(() => { if (disabled) reset(); }, [disabled, reset]);
  useEffect(() => () => { callback.current(0, 0); }, []);
  function move(clientX: number, clientY: number) {
    const vector = joystickVector(clientX - origin.current.x, clientY - origin.current.y, origin.current.radius);
    setThumb({ x: vector.thumbX, y: vector.thumbY });
    callback.current(vector.x, vector.forward);
  }
  function keyboard(e: React.KeyboardEvent, down: boolean) {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault(); e.stopPropagation();
    if (disabled || pointer.current !== null) return;
    if (down) held.current.add(e.key); else held.current.delete(e.key);
    const x = Number(held.current.has('ArrowRight')) - Number(held.current.has('ArrowLeft'));
    const y = Number(held.current.has('ArrowDown')) - Number(held.current.has('ArrowUp'));
    const vector = joystickVector(x * 34, y * 34, 34);
    setThumb({ x: vector.thumbX, y: vector.thumbY });
    callback.current(vector.x, vector.forward);
  }
  return <div className="spatial-joystick" data-spatial-blocker>
    <button type="button" className="joystick-base" aria-label="Analógico de movimento"
      aria-describedby="joystick-help" disabled={disabled}
      data-active={pointer.current !== null || held.current.size > 0}
      onPointerDown={e => {
        e.preventDefault(); e.stopPropagation();
        if (disabled || pointer.current !== null || e.button !== 0) return;
        const rect = e.currentTarget.getBoundingClientRect();
        origin.current = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, radius: rect.width * .29 };
        pointer.current = e.pointerId;
        e.currentTarget.setPointerCapture(e.pointerId);
        move(e.clientX, e.clientY);
      }}
      onPointerMove={e => {
        e.stopPropagation();
        if (!disabled && e.pointerId === pointer.current) { e.preventDefault(); move(e.clientX, e.clientY); }
      }}
      onPointerUp={e => { e.stopPropagation(); if (e.pointerId === pointer.current) reset(); }}
      onPointerCancel={e => { e.stopPropagation(); if (e.pointerId === pointer.current) reset(); }}
      onLostPointerCapture={e => { e.stopPropagation(); if (e.pointerId === pointer.current) reset(); }}
      onKeyDown={e => keyboard(e, true)} onKeyUp={e => keyboard(e, false)}
      onBlur={() => { if (pointer.current === null) reset(); }}>
      <span className="joystick-directions" aria-hidden="true">↕<br />↔</span>
      <span className="joystick-thumb" aria-hidden="true" style={{ transform: `translate(${thumb.x}px, ${thumb.y}px)` }} />
    </button>
    <span id="joystick-help">Arraste para andar · solte para parar</span>
  </div>;
}
