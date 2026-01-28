import { useState, useCallback, useEffect } from 'react';
import { Toolbar } from './components/Toolbar';
import { DropZone } from './components/DropZone';
import { TabBar } from './components/TabBar';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { TableOfContents } from './components/TableOfContents';
import { useMarkdown } from './hooks/useMarkdown';
import { useTheme } from './hooks/useTheme';
import { updateMermaidTheme } from './utils/mermaid';
import './App.css';

function App() {
  const [tocCollapsed, setTocCollapsed] = useState(false);
  const {
    documents,
    activeDocId,
    html,
    headings,
    fileName,
    hasContent,
    addDocument,
    removeDocument,
    setActiveDocument,
    clearContent
  } = useMarkdown();
  const { theme } = useTheme();

  useEffect(() => {
    updateMermaidTheme(theme);
  }, [theme]);

  const handleFileLoad = useCallback((content, name) => {
    addDocument(content, name);
  }, [addDocument]);

  const handleClearContent = useCallback(() => {
    clearContent();
  }, [clearContent]);

  const toggleToc = useCallback(() => {
    setTocCollapsed(prev => !prev);
  }, []);

  return (
    <div className="app">
      <Toolbar
        fileName={fileName}
        onClearContent={handleClearContent}
      />

      {hasContent && (
        <TabBar
          documents={documents}
          activeDocId={activeDocId}
          onTabClick={setActiveDocument}
          onTabClose={removeDocument}
          onFileLoad={handleFileLoad}
        />
      )}

      <div className="main-container">
        {hasContent ? (
          <>
            {headings.length > 0 && (
              <aside className={"sidebar no-print" + (tocCollapsed ? " collapsed" : "")}>
                <TableOfContents
                  headings={headings}
                  isCollapsed={tocCollapsed}
                  onToggle={toggleToc}
                />
              </aside>
            )}

            <main className="content">
              <MarkdownRenderer html={html} />
            </main>
          </>
        ) : (
          <div className="welcome-screen">
            <div className="welcome-content">
              <h2>Welcome to MD Viewer</h2>
              <p>A beautiful Markdown viewer with support for:</p>
              <ul className="feature-list">
                <li>GitHub Flavored Markdown</li>
                <li>Mermaid diagrams</li>
                <li>Syntax highlighting</li>
                <li>Math equations (KaTeX)</li>
                <li>Dark/Light themes</li>
                <li>Table of Contents</li>
              </ul>

              <DropZone onFileLoad={handleFileLoad} fileName={fileName} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
