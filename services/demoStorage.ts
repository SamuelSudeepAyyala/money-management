export function readDemoValue<T>(key: string, fallback: T): T {
  try {
    const saved = window.localStorage.getItem(key);
    return saved ? JSON.parse(saved) as T : fallback;
  } catch {
    window.localStorage.removeItem(key);
    return fallback;
  }
}

export function writeDemoValue<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

