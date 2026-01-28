import { Printer, FileText, X, Github, Globe } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function Toolbar({ fileName, onClearContent }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="toolbar no-print">
      <div className="toolbar-left">
        <div className="app-title">
          <FileText size={24} />
          <h1>MD Viewer</h1>
        </div>

        {fileName && (
          <div className="current-file">
            <span className="file-label">Viewing:</span>
            <span className="file-name" title={fileName}>{fileName}</span>
            <button
              className="clear-file-btn"
              onClick={onClearContent}
              title="Close file"
              aria-label="Close current file"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="toolbar-right">
        {fileName && (
          <button
            className="toolbar-btn print-btn"
            onClick={handlePrint}
            title="Print document"
            aria-label="Print document"
          >
            <Printer size={18} />
            <span className="btn-text">Print</span>
          </button>
        )}

        <a
          href="https://github.com/amitdas45/md-viewer"
          target="_blank"
          rel="noopener noreferrer"
          className="toolbar-btn github-link"
          title="View on GitHub"
          aria-label="View on GitHub"
        >
          <Github size={18} />
        </a>

        <a
          href="https://amitdas.net"
          target="_blank"
          rel="noopener noreferrer"
          className="toolbar-btn website-link"
          title="amitdas.net"
          aria-label="Visit amitdas.net"
        >
          <Globe size={18} />
        </a>

        <ThemeToggle />
      </div>
    </header>
  );
}
