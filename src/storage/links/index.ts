export const PINNED_LINKS_KEY = "pinnedLinks";
export const MAX_PINNED_LINKS = 6;

export function readPinned(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string").slice(0, MAX_PINNED_LINKS) : [];
}

export function savePinned(ids: string[]): Promise<void> {
  return chrome.storage.local.set({ [PINNED_LINKS_KEY]: [...new Set(ids)].slice(0, MAX_PINNED_LINKS) });
}
