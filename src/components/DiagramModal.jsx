import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ZoomIn, ZoomOut, RotateCcw, X } from 'lucide-react';
import { useDiagramZoom } from '../hooks/useDiagramZoom';

const FIT_PADDING = 40; // px padding on each side when fitting to viewport

export function DiagramModal({ svgHTML, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const closingRef = useRef(false);
  const closeTimeoutRef = useRef(null);
  const originalOverflowRef = useRef('');
  const viewportRef = useRef(null);
  const contentRef = useRef(null);

  const {
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
  } = useDiagramZoom();

  // Open animation + body scroll lock + fit diagram to viewport
  useEffect(() => {
    if (!svgHTML) return;

    closingRef.current = false;
    originalOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Trigger enter animation on next frame, then measure & fit
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsVisible(true);

        // Measure and fit diagram to viewport
        const viewport = viewportRef.current;
        const content = contentRef.current;
        if (viewport && content) {
          const vw = viewport.clientWidth - FIT_PADDING * 2;
          const vh = viewport.clientHeight - FIT_PADDING * 2;
          const sw = content.offsetWidth;
          const sh = content.offsetHeight;

          if (sw > 0 && sh > 0 && vw > 0 && vh > 0) {
            const fitScale = Math.min(vw / sw, vh / sh);
            const scaledW = sw * fitScale;
            const scaledH = sh * fitScale;
            const px = (viewport.clientWidth - scaledW) / 2;
            const py = (viewport.clientHeight - scaledH) / 2;
            setHome(px, py, fitScale);
          }
        }
      });
    });

    return () => {
      document.body.style.overflow = originalOverflowRef.current;
    };
  }, [svgHTML, setHome]);

  // Clear pending close timeout if new SVG arrives
  useEffect(() => {
    if (svgHTML && closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, [svgHTML]);

  const handleClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setIsVisible(false);
    closeTimeoutRef.current = setTimeout(() => {
      closeTimeoutRef.current = null;
      onClose();
    }, 200);
  }, [onClose]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!svgHTML) return;

    const onKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          handleClose();
          break;
        case '+':
        case '=':
          e.preventDefault();
          zoomIn();
          break;
        case '-':
          e.preventDefault();
          zoomOut();
          break;
        case '0':
          e.preventDefault();
          resetZoom();
          break;
        case 'Tab':
          // Basic focus trap — keep focus inside modal
          e.preventDefault();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [svgHTML, handleClose, zoomIn, zoomOut, resetZoom]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  if (!svgHTML) return null;

  return createPortal(
    <>
      <div
        className={`diagram-modal-backdrop${isVisible ? ' visible' : ''}`}
        onClick={handleClose}
      />
      <div
        className={`diagram-modal-container${isVisible ? ' visible' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Diagram viewer"
      >
        <div className="diagram-modal-header">
          <span className="diagram-modal-zoom-level">{zoomPercent}</span>
          <div className="diagram-modal-controls">
            <button
              className="diagram-modal-btn"
              onClick={zoomOut}
              aria-label="Zoom out"
              title="Zoom out (−)"
            >
              <ZoomOut size={18} />
            </button>
            <button
              className="diagram-modal-btn"
              onClick={zoomIn}
              aria-label="Zoom in"
              title="Zoom in (+)"
            >
              <ZoomIn size={18} />
            </button>
            <button
              className="diagram-modal-btn"
              onClick={resetZoom}
              aria-label="Reset zoom"
              title="Reset zoom (0)"
            >
              <RotateCcw size={18} />
            </button>
            <button
              className="diagram-modal-btn diagram-modal-close"
              onClick={handleClose}
              aria-label="Close"
              title="Close (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <div
          ref={viewportRef}
          className={`diagram-modal-viewport${isPanning ? ' panning' : ''}`}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onDoubleClick={resetZoom}
        >
          <div
            ref={contentRef}
            className="diagram-modal-svg-container"
            style={{ transform, transition }}
            dangerouslySetInnerHTML={{ __html: svgHTML }}
          />
        </div>
      </div>
    </>,
    document.body
  );
}
