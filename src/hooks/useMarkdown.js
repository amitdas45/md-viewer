import { useState, useMemo, useCallback } from 'react';
import { createMarkdownRenderer, renderMarkdown } from '../utils/markdown';

export function useMarkdown() {
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');

  // Create markdown renderer once
  const md = useMemo(() => createMarkdownRenderer(), []);

  // Render markdown content
  const { html, headings } = useMemo(() => {
    if (!content) {
      return { html: '', headings: [] };
    }
    return renderMarkdown(content, md);
  }, [content, md]);

  // Load content from file
  const loadContent = useCallback((newContent, newFileName) => {
    setContent(newContent);
    setFileName(newFileName);
  }, []);

  // Clear content
  const clearContent = useCallback(() => {
    setContent('');
    setFileName('');
  }, []);

  return {
    content,
    fileName,
    html,
    headings,
    loadContent,
    clearContent,
    hasContent: content.length > 0
  };
}
