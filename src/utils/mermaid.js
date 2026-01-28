// Mermaid diagram rendering utilities

let mermaidInitialized = false;

// Initialize Mermaid with theme
export function initMermaid(theme = 'default') {
  if (window.mermaid) {
    window.mermaid.initialize({
      startOnLoad: false,
      theme: theme === 'dark' ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true
      },
      sequence: {
        useMaxWidth: true
      },
      gantt: {
        useMaxWidth: true
      }
    });
    mermaidInitialized = true;
  }
}

// Update Mermaid theme
export function updateMermaidTheme(theme) {
  if (window.mermaid) {
    window.mermaid.initialize({
      startOnLoad: false,
      theme: theme === 'dark' ? 'dark' : 'default'
    });
  }
}

// Render all Mermaid diagrams in the container
export async function renderMermaidDiagrams(container) {
  if (!window.mermaid || !container) return;

  if (!mermaidInitialized) {
    initMermaid();
  }

  const mermaidElements = container.querySelectorAll('.mermaid:not([data-processed])');

  if (mermaidElements.length === 0) return;

  try {
    // Mark elements as being processed
    mermaidElements.forEach(el => {
      el.setAttribute('data-processing', 'true');
    });

    // Use mermaid.run() for batch rendering
    await window.mermaid.run({
      nodes: mermaidElements
    });

    // Mark as processed
    mermaidElements.forEach(el => {
      el.removeAttribute('data-processing');
      el.setAttribute('data-processed', 'true');
    });
  } catch (error) {
    console.error('Mermaid rendering error:', error);

    // Show error message in failed diagrams
    mermaidElements.forEach(el => {
      if (el.getAttribute('data-processing')) {
        el.removeAttribute('data-processing');
        const code = el.textContent;
        el.innerHTML = `<div class="mermaid-error">
          <p>Failed to render diagram</p>
          <pre>${code}</pre>
        </div>`;
      }
    });
  }
}

// Reset Mermaid state (needed when content changes)
export function resetMermaid(container) {
  if (!container) return;

  const processedElements = container.querySelectorAll('.mermaid[data-processed]');
  processedElements.forEach(el => {
    el.removeAttribute('data-processed');
  });
}
