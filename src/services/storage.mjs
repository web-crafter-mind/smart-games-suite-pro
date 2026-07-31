export function readJson(storage, key, fallback) {
  try {
    const parsed = JSON.parse(storage.getItem(key) || 'null');
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch (error) {
    return fallback;
  }
}

export function writeJson(storage, key, value) {
  storage.setItem(key, JSON.stringify(value));
}
