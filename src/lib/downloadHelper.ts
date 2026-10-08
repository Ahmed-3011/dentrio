export interface DownloadableFile {
  url: string;
  name: string;
}

/**
 * Downloads multiple files at once directly into a folder selected by the user
 * without zipping or compressing them.
 *
 * Uses the native File System Access API (window.showDirectoryPicker).
 * Returns true if files were successfully downloaded into the chosen directory.
 */
export async function downloadFilesToDirectory(
  files: DownloadableFile[],
  onProgress?: (msg: string) => void
): Promise<boolean> {
  if (!files || files.length === 0) return false;

  // 1. Native Directory Picker (Chrome, Edge, Opera, Brave, Desktop Chromium)
  if ('showDirectoryPicker' in window) {
    try {
      onProgress?.('Please select a destination folder…');
      const dirHandle = await (window as unknown as {
        showDirectoryPicker: (options?: { mode?: 'readwrite' }) => Promise<{
          getFileHandle: (name: string, options?: { create?: boolean }) => Promise<{
            createWritable: () => Promise<{
              write: (data: Blob) => Promise<void>;
              close: () => Promise<void>;
            }>;
          }>;
        }>;
      }).showDirectoryPicker({ mode: 'readwrite' });

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        onProgress?.(`Saving ${file.name} (${i + 1}/${files.length})…`);

        const res = await fetch(file.url);
        if (!res.ok) throw new Error(`Failed to fetch ${file.name}`);
        const blob = await res.blob();

        const fileHandle = await dirHandle.getFileHandle(file.name, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
      }

      onProgress?.('');
      return true;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        // User cancelled folder selection
        onProgress?.('');
        return false;
      }
      console.warn('showDirectoryPicker failed or not allowed, falling back to direct downloads:', err);
    }
  }

  // 2. Fallback: Trigger direct individual file downloads
  onProgress?.('Downloading files…');
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Small delay between downloads so the browser handles them cleanly
    await new Promise((r) => setTimeout(r, 250));
  }

  onProgress?.('');
  return true;
}
