import { useEffect, useRef, useState, useMemo } from 'react';
import { renderMermaidDiagrams } from '../utils/mermaid';
import { DiagramModal } from './DiagramModal';

// Maximize2 icon SVG (from lucide) — used as inline HTML in injected button
const EXPAND_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`;

export function MarkdownRenderer({ html, onHeadingsUpdate }) {
  const containerRef = useRef(null);
  const [modalSvgHTML, setModalSvgHTML] = useState(null);

  // After HTML is rendered, run post-processing
  useEffect(() => {
    if (!containerRef.current || !html) return;

    const container = containerRef.current;
    let cancelled = false;
    const cleanups = [];

    // Highlight code blocks with Prism
    if (window.Prism) {
      window.Prism.highlightAllUnder(container);
    }

    // Add external link indicators
    const links = container.querySelectorAll('a[href^="http"]');
    links.forEach(link => {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });

    // Render Mermaid diagrams, then inject expand buttons once SVGs exist
    renderMermaidDiagrams(container).then(() => {
      if (cancelled) return;

      const wrappers = container.querySelectorAll('.mermaid-wrapper');

      wrappers.forEach(wrapper => {
        // Inject expand button
        const btn = document.createElement('button');
        btn.className = 'diagram-expand-btn';
        btn.setAttribute('aria-label', 'Expand diagram');
        btn.setAttribute('title', 'Expand diagram');
        btn.innerHTML = EXPAND_ICON_SVG;
        wrapper.appendChild(btn);

        const openModal = () => {
          // Guard against text selection triggering open
          const selection = window.getSelection();
          if (selection && selection.toString().length > 0) return;

          const svg = wrapper.querySelector('svg');
          if (svg) {
            setModalSvgHTML(svg.outerHTML);
          }
        };

        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const svg = wrapper.querySelector('svg');
          if (svg) setModalSvgHTML(svg.outerHTML);
        });

        wrapper.addEventListener('click', openModal);
        wrapper.style.cursor = 'pointer';

        cleanups.push(() => {
          wrapper.removeEventListener('click', openModal);
          btn.removeEventListener('click', openModal);
          wrapper.style.cursor = '';
          if (btn.parentNode) btn.parentNode.removeChild(btn);
        });
      });
    });

    return () => {
      cancelled = true;
      cleanups.forEach(fn => fn());
    };
  }, [html]);

  // Memoize the article element so that modal state changes (setModalSvgHTML)
  // never cause React to re-reconcile or re-apply dangerouslySetInnerHTML,
  // which would wipe out mermaid-rendered SVGs.
  const renderedArticle = useMemo(() => (
    <article
      ref={containerRef}
      className="markdown-body"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  ), [html]);

  if (!html) {
    return null;
  }

  return (
    <>
      {renderedArticle}
      <DiagramModal
        svgHTML={modalSvgHTML}
        onClose={() => setModalSvgHTML(null)}
      />
    </>
  );
}
