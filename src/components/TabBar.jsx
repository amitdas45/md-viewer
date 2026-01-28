import { X, Plus } from 'lucide-react';
import { DropZone } from './DropZone';

export function TabBar({ documents, activeDocId, onTabClick, onTabClose, onFileLoad }) {
  return (
    <div className="tab-bar no-print">
      <div className="tabs">
        {documents.map(doc => (
          <div
            key={doc.id}
            className={`tab ${doc.id === activeDocId ? 'active' : ''}`}
            onClick={() => onTabClick(doc.id)}
          >
            <span className="tab-name">{doc.fileName}</span>
            <button
              className="tab-close"
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(doc.id);
              }}
              aria-label={`Close ${doc.fileName}`}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="tab-dropzone">
        <DropZone onFileLoad={onFileLoad} compact />
      </div>
    </div>
  );
}
