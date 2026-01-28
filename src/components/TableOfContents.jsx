import { useState, useEffect, useCallback } from 'react';
import { List, ChevronRight, ChevronDown } from 'lucide-react';

export function TableOfContents({ headings, isCollapsed, onToggle }) {
  const [activeSlug, setActiveSlug] = useState('');

  // Scroll spy - track which heading is currently visible
  useEffect(() => {
    if (!headings || headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSlug(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0% -35% 0%',
        threshold: 0
      }
    );

    // Observe all heading elements
    headings.forEach((heading) => {
      const element = document.getElementById(heading.slug);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  const handleClick = useCallback((e, slug) => {
    e.preventDefault();
    const element = document.getElementById(slug);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSlug(slug);
    }
  }, []);

  if (!headings || headings.length === 0) {
    return null;
  }

  // Find minimum heading level to normalize indentation
  const minLevel = Math.min(...headings.map(h => h.level));

  return (
    <nav className={`toc ${isCollapsed ? 'collapsed' : ''}`} aria-label="Table of Contents">
      <button
        className="toc-toggle"
        onClick={onToggle}
        aria-expanded={!isCollapsed}
        title={isCollapsed ? 'Expand table of contents' : 'Collapse table of contents'}
      >
        <List size={18} />
        <span className="toc-title">Contents</span>
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
      </button>

      {!isCollapsed && (
        <ul className="toc-list">
          {headings.map((heading, index) => (
            <li
              key={`${heading.slug}-${index}`}
              className={`toc-item level-${heading.level - minLevel + 1} ${activeSlug === heading.slug ? 'active' : ''}`}
            >
              <a
                href={`#${heading.slug}`}
                onClick={(e) => handleClick(e, heading.slug)}
                title={heading.text}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
