import { useEffect, useRef } from 'react';
import { renderMermaidDiagrams } from '../utils/mermaid';

export function MarkdownRenderer({ html, onHeadingsUpdate }) {
  const containerRef = useRef(null);

  // After HTML is rendered, run post-processing
  useEffect(() => {
    if (!containerRef.current || !html) return;

    const container = containerRef.current;

    // Render Mermaid diagrams
    renderMermaidDiagrams(container);

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

  }, [html]);

  if (!html) {
    return null;
  }

  return (
    <article
      ref={containerRef}
      className="markdown-body"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
