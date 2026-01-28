// Configure markdown-it with all plugins and custom renderers

// Mermaid diagram types to detect
const MERMAID_TYPES = [
  'graph', 'flowchart', 'sequenceDiagram', 'classDiagram',
  'stateDiagram', 'erDiagram', 'journey', 'gantt', 'pie',
  'gitGraph', 'mindmap', 'timeline', 'quadrantChart',
  'requirementDiagram', 'C4Context', 'sankey'
];

// Create regex pattern for auto-detecting Mermaid diagrams
const mermaidPattern = new RegExp(`^\\s*(${MERMAID_TYPES.join('|')})`, 'i');

// Check if code block content looks like a Mermaid diagram
function isMermaidContent(code) {
  return mermaidPattern.test(code.trim());
}

// Escape HTML for safe output
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Render math using KaTeX
function renderMath(tex, displayMode = false) {
  try {
    if (window.katex) {
      return window.katex.renderToString(tex, {
        displayMode,
        throwOnError: false,
        output: 'html'
      });
    }
  } catch (e) {
    console.error('KaTeX rendering error:', e);
  }
  return displayMode ? `<pre>${escapeHtml(tex)}</pre>` : `<code>${escapeHtml(tex)}</code>`;
}

// Create and configure markdown-it instance
export function createMarkdownRenderer() {
  if (!window.markdownit) {
    console.error('markdown-it not loaded');
    return null;
  }

  const md = window.markdownit({
    html: true,
    linkify: true,
    typographer: true,
    breaks: false,
    highlight: function(code, lang) {
      // Mermaid blocks - don't highlight, will be rendered separately
      if (lang === 'mermaid' || isMermaidContent(code)) {
        return null; // Will be handled by fence renderer
      }

      // Return null to let Prism handle highlighting after render
      return null;
    }
  });

  // Store original fence renderer
  const defaultFenceRenderer = md.renderer.rules.fence || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

  // Custom fence renderer for code blocks
  md.renderer.rules.fence = function(tokens, idx, options, env, self) {
    const token = tokens[idx];
    const code = token.content;
    const lang = token.info.trim().toLowerCase();

    // Handle Mermaid blocks
    if (lang === 'mermaid' || isMermaidContent(code)) {
      // Use a unique ID for each Mermaid diagram
      const id = `mermaid-${Date.now()}-${idx}`;
      return `<div class="mermaid-wrapper"><pre class="mermaid" id="${id}">${escapeHtml(code)}</pre></div>`;
    }

    // Handle math blocks (alternative syntax with ```math)
    if (lang === 'math' || lang === 'latex' || lang === 'katex') {
      return `<div class="math-block">${renderMath(code, true)}</div>`;
    }

    // Regular code block with language class for Prism
    const langClass = lang ? ` class="language-${lang}"` : '';
    return `<pre class="code-block"><code${langClass}>${escapeHtml(code)}</code></pre>`;
  };

  // Custom inline code renderer (for potential inline math)
  const defaultCodeInlineRenderer = md.renderer.rules.code_inline || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

  md.renderer.rules.code_inline = function(tokens, idx, options, env, self) {
    const token = tokens[idx];
    const code = token.content;
    return `<code class="inline-code">${escapeHtml(code)}</code>`;
  };

  return md;
}

// Process inline math ($...$) and block math ($$...$$)
function processMath(html) {
  // Process block math ($$...$$)
  html = html.replace(/\$\$([\s\S]*?)\$\$/g, (match, tex) => {
    return `<div class="math-block">${renderMath(tex.trim(), true)}</div>`;
  });

  // Process inline math ($...$) - but not escaped \$ or $$
  html = html.replace(/(?<!\$)\$(?!\$)((?:[^$\\]|\\.)+?)\$(?!\$)/g, (match, tex) => {
    return `<span class="math-inline">${renderMath(tex.trim(), false)}</span>`;
  });

  return html;
}

// Extract headings from markdown for TOC
export function extractHeadings(markdown) {
  const headings = [];
  const lines = markdown.split('\n');
  let inCodeBlock = false;

  lines.forEach((line, index) => {
    // Track code blocks to ignore headings inside them
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      return;
    }

    if (inCodeBlock) return;

    // Match ATX-style headings (# Heading)
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      // Create slug from heading text
      const slug = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      headings.push({
        level,
        text,
        slug: `heading-${slug}-${index}`,
        line: index
      });
    }
  });

  return headings;
}

// Add IDs to headings in HTML for anchor links
function addHeadingIds(html, headings) {
  let headingIndex = 0;

  // Replace each heading tag with one that has an ID
  return html.replace(/<h([1-6])>([\s\S]*?)<\/h\1>/gi, (match, level, content) => {
    if (headingIndex < headings.length) {
      const heading = headings[headingIndex];
      headingIndex++;
      return `<h${level} id="${heading.slug}">${content}</h${level}>`;
    }
    return match;
  });
}

// Main render function
export function renderMarkdown(markdown, md) {
  if (!md) {
    md = createMarkdownRenderer();
  }

  if (!md) {
    return { html: '<p>Error: Markdown renderer not available</p>', headings: [] };
  }

  // Extract headings before rendering
  const headings = extractHeadings(markdown);

  // Render markdown to HTML
  let html = md.render(markdown);

  // Process math expressions
  html = processMath(html);

  // Add IDs to headings
  html = addHeadingIds(html, headings);

  // Sanitize HTML with DOMPurify
  if (window.DOMPurify) {
    html = window.DOMPurify.sanitize(html, {
      ADD_TAGS: ['iframe'], // Allow iframes for embeds if needed
      ADD_ATTR: ['target', 'id'], // Allow target="_blank" and IDs on headings
      ALLOW_DATA_ATTR: false,
      USE_PROFILES: { html: true }
    });
  }

  return { html, headings };
}
