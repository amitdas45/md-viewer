import { useState, useRef, useCallback } from 'react';
import { Upload, FileText } from 'lucide-react';

export function DropZone({ onFileLoad, fileName }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    const validExtensions = ['.md', '.markdown', '.txt'];
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

    if (!validExtensions.includes(extension)) {
      return 'Please select a Markdown file (.md, .markdown, or .txt)';
    }

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      return 'File size must be less than 10MB';
    }

    return null;
  };

  const handleFile = useCallback((file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    const reader = new FileReader();

    reader.onload = (e) => {
      onFileLoad(e.target.result, file.name);
    };

    reader.onerror = () => {
      setError('Failed to read file');
    };

    reader.readAsText(file);
  }, [onFileLoad]);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if we're leaving the dropzone entirely
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleInputChange = useCallback((e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
    // Reset input so the same file can be selected again
    e.target.value = '';
  }, [handleFile]);

  return (
    <div
      className={`drop-zone ${isDragging ? 'dragging' : ''} ${fileName ? 'has-file' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label="Drop a Markdown file here or click to select"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.markdown,.txt"
        onChange={handleInputChange}
        className="file-input"
        aria-hidden="true"
      />

      <div className="drop-zone-content">
        {fileName ? (
          <>
            <FileText size={24} />
            <span className="file-name">{fileName}</span>
            <span className="drop-hint">Drop another file or click to change</span>
          </>
        ) : (
          <>
            <Upload size={32} />
            <span className="drop-text">Drop a Markdown file here</span>
            <span className="drop-hint">or click to select</span>
          </>
        )}
      </div>

      {error && <div className="drop-zone-error">{error}</div>}
    </div>
  );
}
