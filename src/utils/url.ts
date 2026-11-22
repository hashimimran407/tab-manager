export function isRestrictedUrl(url?: string): boolean {
  if (!url) return true;
  const restrictedPrefixes = [
    "chrome://",
    "edge://",
    "about:",
    "chrome-extension://",
    "view-source:",
    "devtools://",
  ];
  return restrictedPrefixes.some((prefix) => url.startsWith(prefix));
}

export function formatUrlForDisplay(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
