export interface ParsedDriveLink {
  fileId: string;
  embedUrl: string;
  rawUrl: string;
}

/**
 * Parses a Google Drive sharing URL and returns an embeddable preview link.
 * Supports /file/d/{id}, id={id}, and open?id={id} formats.
 */
export function parseDriveLink(url: string): ParsedDriveLink | null {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();

  // Pattern 1: https://drive.google.com/file/d/{fileId}/view...
  const pathMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (pathMatch && pathMatch[1]) {
    const fileId = pathMatch[1];
    return {
      fileId,
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      rawUrl: trimmed,
    };
  }

  // Pattern 2: https://drive.google.com/open?id={fileId}
  const queryMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (queryMatch && queryMatch[1]) {
    const fileId = queryMatch[1];
    return {
      fileId,
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      rawUrl: trimmed,
    };
  }

  return null;
}
