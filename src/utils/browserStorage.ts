export type ThemeMode = 'light' | 'dark'

const hasWindow = typeof window !== 'undefined'
const hasDocument = typeof document !== 'undefined'

class InMemoryStorage implements Storage {
  private data: Record<string, string> = {}
  get length() { return Object.keys(this.data).length }
  clear() { this.data = {} }
  getItem(key: string) { return this.data[key] || null }
  key(index: number) { return Object.keys(this.data)[index] || null }
  removeItem(key: string) { delete this.data[key] }
  setItem(key: string, value: string) { this.data[key] = String(value) }
}

const getSafeStorage = (): Storage => {
  if (!hasWindow) return new InMemoryStorage()
  
  try {
    // Check if the property itself throws or is inaccessible
    const storage = window['localStorage']
    if (!storage) return new InMemoryStorage()

    // Test functionality
    const x = '__storage_test__'
    storage.setItem(x, x)
    storage.removeItem(x)
    return storage
  } catch (e) {
    return new InMemoryStorage()
  }
}

const safeStorage = getSafeStorage()

export const readJSONStorage = <T>(key: string, fallback: T): T => {
  try {
    const rawValue = safeStorage.getItem(key)
    return rawValue ? JSON.parse(rawValue) as T : fallback
  } catch {
    return fallback
  }
}

export const writeJSONStorage = <T>(key: string, value: T): void => {
  try {
    safeStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore environments that block storage access.
  }
}

export const readStringStorage = (key: string, fallback: string): string => {
  try {
    return safeStorage.getItem(key) || fallback
  } catch {
    return fallback
  }
}

export const writeStringStorage = (key: string, value: string): void => {
  try {
    safeStorage.setItem(key, value)
  } catch {
    // Ignore environments that block storage access.
  }
}

export const readThemeMode = (): ThemeMode => {
  const fallback: ThemeMode = 'light'

  if (!hasWindow) return fallback

  try {
    const storedTheme = readStringStorage('theme', '') as ThemeMode | ''
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme
    }

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
  } catch {
    return fallback
  }

  return fallback
}

export const applyTheme = (theme: ThemeMode): void => {
  if (!hasDocument) return

  try {
    document.documentElement.setAttribute('data-theme', theme)
  } catch {
    // Ignore document access issues in restricted contexts.
  }
}