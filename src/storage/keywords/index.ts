export const KEYWORDS_KEY = "keywords";

export async function getKeywords(): Promise<string[]> {
  const stored = await chrome.storage.local.get(KEYWORDS_KEY);
  const list = stored[KEYWORDS_KEY];
  return Array.isArray(list) ? list.filter((k): k is string => typeof k === "string") : [];
}

export function setKeywords(keywords: string[]): Promise<void> {
  const cleaned = [...new Set(keywords.map((k) => k.trim()).filter((k) => k !== ""))];
  return chrome.storage.local.set({ [KEYWORDS_KEY]: cleaned });
}
