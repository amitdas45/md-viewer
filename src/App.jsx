import { useState, useCallback, useEffect } from 'react';
import { Toolbar } from './components/Toolbar';
import { DropZone } from './components/DropZone';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { TableOfContents } from './components/TableOfContents';
import { useMarkdown } from './hooks/useMarkdown';
import { useRecentFiles } from './hooks/useRecentFiles';
import { useTheme } from './hooks/useTheme';
import { updateMermaidTheme } from './utils/mermaid';
import './App.css';

function App() {
  const [tocCollapsed, setTocCollapsed] = useState(false);
  const { html, headings, fileName, loadContent, clearContent, hasContent } = useMarkdown();
  const { recentFiles, addFile, clearFiles, removeFile } = useRecentFiles();
  const { theme } = useTheme();

  useEffect(() => {
    updateMermaidTheme(theme);
  }, [theme]);

  const handleFileLoad = useCallback((content, name) => {
    loadContent(content, name);
    addFile(name);
  }, [loadContent, addFile]);

  const handleClearContent = useCallback(() => {
    clearContent();
  }, [clearContent]);

  const toggleToc = useCallback(() => {
    setTocCollapsed(prev => !prev);
  }, []);

  const sampleMarkdown = "# Hello World\n\nThis is **bold** and *italic* text.\n\n## Code\n\n```javascript\nconsole.log(\"Hello!\");\n```\n\n## Diagram\n\n```mermaid\ngraph LR\n    A[Start] --> B[End]\n```\n\nInline math: $E = mc^2$";

  return (
    <div className="app">
      <Toolbar
        fileName={fileName}
        recentFiles={recentFiles}
        onClearRecent={clearFiles}
        onRemoveRecent={removeFile}
        onClearContent={handleClearContent}
      />

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

              <div className="sample-hint">
                <p>Try it with a sample Markdown file containing:</p>
                <pre className="sample-code">{sampleMarkdown}</pre>
              </div>
            </div>
          </div>
        )}
      </div>

      {hasContent && (
        <div className="floating-dropzone no-print">
          <DropZone onFileLoad={handleFileLoad} fileName={fileName} />
        </div>
      )}
    </div>
  );
}

export default App;
