import { useState, useRef, useEffect } from 'react';
import { History, X, Trash2, ChevronDown } from 'lucide-react';

export function RecentFiles({ recentFiles, onClear, onRemove }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (recentFiles.length === 0) {
    return null;
  }

  return (
    <div className="recent-files" ref={dropdownRef}>
      <button
        className="recent-files-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <History size={16} />
        <span>Recent Files</span>
        <ChevronDown size={16} className={`chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="recent-files-dropdown" role="listbox">
          <div className="recent-files-header">
            <span>Recent Files</span>
            <button
              className="clear-all-btn"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
                setIsOpen(false);
              }}
              title="Clear all recent files"
            >
              <Trash2 size={14} />
              Clear All
            </button>
          </div>

          <ul className="recent-files-list">
            {recentFiles.map((file, index) => (
              <li key={`${file}-${index}`} className="recent-file-item">
                <span className="recent-file-name" title={file}>
                  {file}
                </span>
                <button
                  className="remove-file-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(file);
                  }}
                  title="Remove from recent files"
                  aria-label={`Remove ${file} from recent files`}
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
