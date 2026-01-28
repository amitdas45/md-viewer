import { Printer, FileText, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { RecentFiles } from './RecentFiles';

export function Toolbar({
  fileName,
  recentFiles,
  onClearRecent,
  onRemoveRecent,
  onClearContent
}) {
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
        <RecentFiles
          recentFiles={recentFiles}
          onClear={onClearRecent}
          onRemove={onRemoveRecent}
        />

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

        <ThemeToggle />
      </div>
    </header>
  );
}
