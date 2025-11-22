export interface ModuleProgress {
  moduleId: string
  stars: number
  levelsCompleted: number
  lastPlayed: number
}

export interface PlayerProfile {
  name: string
  grade: string
  section?: string
  preferredLanguage: string
}

const STORAGE_KEYS = {
  profile: 'reap.playerProfile',
  progress: 'reap.moduleProgress',
} as const

const memoryStore = new Map<string, string>()

const isBrowser = typeof window !== 'undefined'

const readRaw = (key: string): string | null => {
  if (isBrowser) {
    try {
      const value = window.localStorage.getItem(key)
      if (value !== null) return value
    } catch (error) {
      console.warn('Unable to read localStorage key', key, error)
    }
  }
  return memoryStore.get(key) ?? null
}

const writeRaw = (key: string, value: string): void => {
  if (isBrowser) {
    try {
      window.localStorage.setItem(key, value)
    } catch (error) {
      console.warn('Unable to persist localStorage key', key, error)
    }
  }
  memoryStore.set(key, value)
}

const readJson = <T>(key: string): T | null => {
  const raw = readRaw(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch (error) {
    console.warn('Failed to parse stored value for', key, error)
    return null
  }
}

const writeJson = <T>(key: string, value: T): void => {
  writeRaw(key, JSON.stringify(value))
}

const emptyProgress = (moduleId: string): ModuleProgress => ({
  moduleId,
  stars: 0,
  levelsCompleted: 0,
  lastPlayed: 0,
})

const readProgressRecord = (): Record<string, ModuleProgress> => {
  return readJson<Record<string, ModuleProgress>>(STORAGE_KEYS.progress) ?? {}
}

export const getProgress = (moduleId: string): ModuleProgress => {
  const record = readProgressRecord()
  return record[moduleId] ?? emptyProgress(moduleId)
}

export const setProgress = (moduleId: string, progress: Partial<ModuleProgress>): ModuleProgress => {
  const record = readProgressRecord()
  const next = {
    ...emptyProgress(moduleId),
    ...record[moduleId],
    ...progress,
    moduleId,
    lastPlayed: progress.lastPlayed ?? Date.now(),
  }
  record[moduleId] = next
  writeJson(STORAGE_KEYS.progress, record)
  return next
}

export const getPlayerProfile = (): PlayerProfile | null => {
  return readJson<PlayerProfile>(STORAGE_KEYS.profile)
}

export const setPlayerProfile = (profile: PlayerProfile): void => {
  writeJson(STORAGE_KEYS.profile, profile)
}
