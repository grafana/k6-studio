const DB_NAME = 'jsonPathIndex'
const DB_VERSION = 5

const storePaths = 'paths'
const storeMeta = 'meta'

export const indexThreshold = 2000

type PathRow = {
  recordingId: string
  pathLower: string
  path: string
}

let dbPromise: Promise<IDBDatabase> | null = null

function resetDb() {
  dbPromise = null
}

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result

      if (!db.objectStoreNames.contains(storePaths)) {
        db.createObjectStore(storePaths, {
          keyPath: ['recordingId', 'pathLower'],
        })
      }

      if (!db.objectStoreNames.contains(storeMeta)) {
        db.createObjectStore(storeMeta)
      }
    }

    request.onsuccess = () => {
      const db = request.result

      db.onversionchange = () => {
        db.close()
        resetDb()
      }

      resolve(db)
    }

    request.onerror = () => {
      resetDb()
      reject(request.error)
    }

    request.onblocked = () => {
      resetDb()
      reject(new Error('IndexedDB open blocked (another tab/tx holding it)'))
    }
  })

  return dbPromise
}

async function withDb<T>(fn: (db: IDBDatabase) => Promise<T>): Promise<T> {
  try {
    return await fn(await openDb())
  } catch {
    resetDb()
    return await fn(await openDb())
  }
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)

    const tx = request.transaction
    if (tx) {
      tx.onabort = () =>
        reject(tx.error ?? new Error('IndexedDB transaction aborted'))
    }
  })
}

function transactionDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onabort = () =>
      reject(tx.error ?? new Error('IndexedDB transaction aborted'))
    tx.onerror = () =>
      reject(tx.error ?? new Error('IndexedDB transaction error'))
  })
}

function scheduleBackground(task: () => void) {
  setTimeout(task, 0)
}

function computeVersion(paths: string[]) {
  const sorted = [...paths].sort()
  let hash = 2166136261

  for (const s of sorted) {
    for (let i = 0; i < s.length; i++) {
      hash ^= s.charCodeAt(i)
      hash = Math.imul(hash, 16777619)
    }
  }

  return `${sorted.length}:${hash >>> 0}`
}

function metaKeyForRecording(recordingId: string) {
  return `version:${recordingId}`
}

function builtKeyForRecording(recordingId: string) {
  return `built:${recordingId}`
}

function compositePrefixRange(recordingId: string, prefixLower: string) {
  return IDBKeyRange.bound(
    [recordingId, prefixLower],
    [recordingId, `${prefixLower}\uffff`],
    false,
    false
  )
}

async function clearRecordingPaths(
  pathsStore: IDBObjectStore,
  recordingId: string
) {
  const range = IDBKeyRange.bound(
    [recordingId, ''],
    [recordingId, '\uffff'],
    false,
    false
  )

  await new Promise<void>((resolve, reject) => {
    const request = pathsStore.openCursor(range)
    request.onerror = () => reject(request.error)

    request.onsuccess = () => {
      const cursor = request.result
      if (!cursor) {
        resolve()
        return
      }
      cursor.delete()
      cursor.continue()
    }
  })
}

export async function getRecordingIndexVersion(recordingId: string) {
  return withDb(async (db) => {
    const tx = db.transaction(storeMeta, 'readonly')
    const meta = tx.objectStore(storeMeta)
    const version = await requestToPromise<string>(
      meta.get(metaKeyForRecording(recordingId)) as IDBRequest<string>
    )
    return version as unknown as string | undefined
  })
}

export async function setRecordingIndexVersion(
  recordingId: string,
  version: string
) {
  return withDb(async (db) => {
    const tx = db.transaction(storeMeta, 'readwrite')
    const meta = tx.objectStore(storeMeta)
    await requestToPromise(meta.put(version, metaKeyForRecording(recordingId)))
    await transactionDone(tx)
  })
}

export async function hasRecordingIndex(recordingId: string): Promise<boolean> {
  return withDb(async (db) => {
    const tx = db.transaction(storeMeta, 'readonly')
    const meta = tx.objectStore(storeMeta)
    const built = await requestToPromise<boolean>(
      meta.get(builtKeyForRecording(recordingId)) as IDBRequest<boolean>
    )
    return built === true
  })
}

const buildInFlight = new Map<string, Promise<void>>()

function runSingleFlight(recordingId: string, fn: () => Promise<void>) {
  const existing = buildInFlight.get(recordingId)
  if (existing) return existing

  const p = fn().finally(() => buildInFlight.delete(recordingId))
  buildInFlight.set(recordingId, p)
  return p
}

export function maybeBuildRecordingIndex(recordingId: string, paths: string[]) {
  if (paths.length < indexThreshold) return

  scheduleBackground(() => {
    void runSingleFlight(recordingId, async () => {
      const alreadyBuilt = await hasRecordingIndex(recordingId)
      if (alreadyBuilt) return

      const version = computeVersion(paths)

      await withDb(async (db) => {
        const tx = db.transaction([storePaths, storeMeta], 'readwrite')
        const pathsStore = tx.objectStore(storePaths)
        const metaStore = tx.objectStore(storeMeta)

        await clearRecordingPaths(pathsStore, recordingId)

        for (const path of paths) {
          const row: PathRow = {
            recordingId,
            pathLower: path.toLowerCase(),
            path,
          }
          await requestToPromise(pathsStore.put(row))
        }

        await requestToPromise(
          metaStore.put(version, metaKeyForRecording(recordingId))
        )
        await requestToPromise(
          metaStore.put(true, builtKeyForRecording(recordingId))
        )

        await transactionDone(tx)
      })
    })
  })
}

async function queryByPrefix(args: {
  recordingId: string
  prefixLower: string
  limit?: number
}) {
  const { recordingId, prefixLower, limit = 200 } = args

  return withDb(async (db) => {
    const tx = db.transaction(storePaths, 'readonly')
    const store = tx.objectStore(storePaths)

    const results: string[] = []
    const request = store.openCursor(
      compositePrefixRange(recordingId, prefixLower)
    )

    await new Promise<void>((resolve, reject) => {
      request.onerror = () => reject(request.error)

      request.onsuccess = () => {
        const cursor = request.result
        if (!cursor) {
          resolve()
          return
        }

        results.push((cursor.value as PathRow).path)

        if (results.length >= limit) {
          resolve()
          return
        }

        cursor.continue()
      }
    })

    await transactionDone(tx)
    return results
  })
}

export function queryByFullPrefix(
  recordingId: string,
  prefixLower: string,
  limit = 200
) {
  return queryByPrefix({ recordingId, prefixLower, limit })
}
