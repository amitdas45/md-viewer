import { useState, useMemo, useCallback } from 'react';
import { createMarkdownRenderer, renderMarkdown } from '../utils/markdown';

let documentIdCounter = 0;

export function useMarkdown() {
  const [documents, setDocuments] = useState([]);
  const [activeDocId, setActiveDocId] = useState(null);

  // Create markdown renderer once
  const md = useMemo(() => createMarkdownRenderer(), []);

  // Render markdown for all documents
  const renderedDocuments = useMemo(() => {
    return documents.map(doc => {
      const { html, headings } = renderMarkdown(doc.content, md);
      return { ...doc, html, headings };
    });
  }, [documents, md]);

  // Get active document
  const activeDocument = useMemo(() => {
    return renderedDocuments.find(doc => doc.id === activeDocId) || null;
  }, [renderedDocuments, activeDocId]);

  // Add a new document (opens as new tab)
  const addDocument = useCallback((content, fileName) => {
    const id = `doc-${++documentIdCounter}`;
    const newDoc = { id, fileName, content };
    setDocuments(prev => [...prev, newDoc]);
    setActiveDocId(id);
  }, []);

  // Remove a document (close tab)
  const removeDocument = useCallback((id) => {
    setDocuments(prev => {
      const index = prev.findIndex(doc => doc.id === id);
      const newDocs = prev.filter(doc => doc.id !== id);

      // If closing active tab, switch to adjacent tab
      if (id === activeDocId && newDocs.length > 0) {
        const newIndex = Math.min(index, newDocs.length - 1);
        setActiveDocId(newDocs[newIndex].id);
      } else if (newDocs.length === 0) {
        setActiveDocId(null);
      }

      return newDocs;
    });
  }, [activeDocId]);

  // Switch active document
  const setActiveDocument = useCallback((id) => {
    setActiveDocId(id);
  }, []);

  // Clear all documents
  const clearContent = useCallback(() => {
    setDocuments([]);
    setActiveDocId(null);
  }, []);

  return {
    documents: renderedDocuments,
    activeDocId,
    activeDocument,
    html: activeDocument?.html || '',
    headings: activeDocument?.headings || [],
    fileName: activeDocument?.fileName || '',
    hasContent: documents.length > 0,
    addDocument,
    removeDocument,
    setActiveDocument,
    clearContent
  };
}
