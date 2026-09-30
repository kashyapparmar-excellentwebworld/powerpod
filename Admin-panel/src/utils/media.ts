export const getMediaUrl = (url?: string | null): string => {
  if (!url) return "";

  // Handle cases where the URL is double-wrapped or malformed:
  // e.g. "https://.../uploads/https://..." or "/uploads/https://..."
  const httpMatch = url.match(/https?:\/\/[^\s]+/);
  if (httpMatch) {
    const matchedUrl = httpMatch[0];
    // Check if the matched url contains another http url inside its path
    const secondaryMatch = matchedUrl.slice(8).match(/https?:\/\/[^\s]+/);
    if (secondaryMatch) {
      return getMediaUrl(secondaryMatch[0]);
    }
    return matchedUrl;
  }

  // Remove any leading uploads/ or /uploads/ to avoid double path prefixing
  const cleanUrl = url.replace(/^\/?uploads\//i, "");

  let baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "";
  try {
    if (baseUrl) {
      const urlObj = new URL(baseUrl);
      baseUrl = urlObj.origin; // e.g. http://localhost:8080
    }
  } catch (e) {
    // ignore
  }

  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const finalUrl = cleanUrl.startsWith("/") ? cleanUrl.slice(1) : cleanUrl;
  return `${cleanBase}/uploads/${finalUrl}`;
};
