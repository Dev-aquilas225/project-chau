import '@testing-library/jest-dom/vitest';

// Node 22+'s experimental global `localStorage` (enabled by the test runner's
// `--localstorage-file` flag with no configured path) shadows jsdom's own
// implementation with a broken stub missing methods like `.clear()`. Replace
// it with a real in-memory implementation so tests can rely on localStorage.
class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  clear() {
    this.store.clear();
  }
  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null;
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  setItem(key: string, value: string) {
    this.store.set(key, String(value));
  }
}
Object.defineProperty(globalThis, 'localStorage', { value: new MemoryStorage(), configurable: true });
Object.defineProperty(window, 'localStorage', { value: globalThis.localStorage, configurable: true });

// MUI's Popper/Menu/Select/Tooltip rely on APIs jsdom doesn't implement.
window.matchMedia =
  window.matchMedia ||
  ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }) as unknown as MediaQueryList);

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
