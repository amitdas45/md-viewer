import { useState, useCallback } from 'react';
import { getRecentFiles, addRecentFile, clearRecentFiles, removeRecentFile } from '../utils/storage';

export function useRecentFiles() {
  const [recentFiles, setRecentFiles] = useState(getRecentFiles);

  const addFile = useCallback((fileName) => {
    const updated = addRecentFile(fileName);
    setRecentFiles(updated);
  }, []);

  const clearFiles = useCallback(() => {
    const updated = clearRecentFiles();
    setRecentFiles(updated);
  }, []);

  const removeFile = useCallback((fileName) => {
    const updated = removeRecentFile(fileName);
    setRecentFiles(updated);
  }, []);

  return {
    recentFiles,
    addFile,
    clearFiles,
    removeFile
  };
}
