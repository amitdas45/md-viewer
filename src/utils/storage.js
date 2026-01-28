const RECENT_FILES_KEY = 'md-viewer-recent-files';
const MAX_RECENT_FILES = 10;

export function getRecentFiles() {
  try {
    const stored = localStorage.getItem(RECENT_FILES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addRecentFile(fileName) {
  const files = getRecentFiles();

  // Remove if already exists (to move it to top)
  const filtered = files.filter(f => f !== fileName);

  // Add to beginning
  const updated = [fileName, ...filtered].slice(0, MAX_RECENT_FILES);

  localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(updated));
  return updated;
}

export function clearRecentFiles() {
  localStorage.removeItem(RECENT_FILES_KEY);
  return [];
}

export function removeRecentFile(fileName) {
  const files = getRecentFiles();
  const updated = files.filter(f => f !== fileName);
  localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(updated));
  return updated;
}
