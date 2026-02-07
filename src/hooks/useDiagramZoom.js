import { useState, useCallback, useRef } from 'react';

const MIN_SCALE = 0.25;
const MAX_SCALE = 5.0;
const BUTTON_ZOOM_FACTOR = 1.2;
const WHEEL_ZOOM_FACTOR = 1.1;

function clampScale(s) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));
}

export function useDiagramZoom() {
  const [scale, setScale] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [smoothTransition, setSmoothTransition] = useState(false);

  const panStart = useRef({ x: 0, y: 0 });
  const panOrigin = useRef({ x: 0, y: 0 });
  const homePosition = useRef({ x: 0, y: 0, scale: 1 });

  const zoomPercent = `${Math.round(scale * 100)}%`;

  // Set the "home" position (called once on open to fit & center the diagram)
  const setHome = useCallback((x, y, s) => {
    const cs = clampScale(s);
    homePosition.current = { x, y, scale: cs };
    setScale(cs);
    setPanX(x);
    setPanY(y);
    setSmoothTransition(false);
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const pointerX = e.clientX - rect.left;
    const pointerY = e.clientY - rect.top;

    setScale((prevScale) => {
      const direction = e.deltaY < 0 ? 1 : -1;
      const factor = direction > 0 ? WHEEL_ZOOM_FACTOR : 1 / WHEEL_ZOOM_FACTOR;
      const newScale = clampScale(prevScale * factor);
      const ratio = newScale / prevScale;

      setPanX((px) => pointerX - ratio * (pointerX - px));
      setPanY((py) => pointerY - ratio * (pointerY - py));
      setSmoothTransition(false);

      return newScale;
    });
  }, []);

  const handlePointerDown = useCallback((e) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsPanning(true);
    setSmoothTransition(false);
    panStart.current = { x: e.clientX, y: e.clientY };
    setPanX((px) => { panOrigin.current.x = px; return px; });
    setPanY((py) => { panOrigin.current.y = py; return py; });
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    setPanX(panOrigin.current.x + dx);
    setPanY(panOrigin.current.y + dy);
  }, []);

  const handlePointerUp = useCallback((e) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setIsPanning(false);
  }, []);

  const zoomIn = useCallback(() => {
    setSmoothTransition(true);
    setScale((s) => clampScale(s * BUTTON_ZOOM_FACTOR));
  }, []);

  const zoomOut = useCallback(() => {
    setSmoothTransition(true);
    setScale((s) => clampScale(s / BUTTON_ZOOM_FACTOR));
  }, []);

  const resetZoom = useCallback(() => {
    setSmoothTransition(true);
    const h = homePosition.current;
    setScale(h.scale);
    setPanX(h.x);
    setPanY(h.y);
  }, []);

  const transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
  const transition = smoothTransition && !isPanning ? 'transform 0.2s ease' : 'none';

  return {
    scale,
    panX,
    panY,
    isPanning,
    zoomPercent,
    transform,
    transition,
    setHome,
    handleWheel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    zoomIn,
    zoomOut,
    resetZoom,
  };
}
