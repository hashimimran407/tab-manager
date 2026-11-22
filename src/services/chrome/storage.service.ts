export async function getFromStorage<T>(key: string): Promise<T | null> {
  const result = await chrome.storage.local.get(key);
  return (result[key] as T) ?? null;
}

export async function setToStorage<T>(key: string, value: T): Promise<void> {
  await chrome.storage.local.set({ [key]: value });
}

export async function removeFromStorage(key: string): Promise<void> {
  await chrome.storage.local.remove(key);
}
