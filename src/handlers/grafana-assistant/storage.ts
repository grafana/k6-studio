import { app } from 'electron'
import { readFile, writeFile } from 'fs/promises'
import path from 'path'
import { z } from 'zod'

import {
  decryptString,
  encryptString,
  isEncryptionAvailable,
} from '@/main/encryption'

const fileName =
  process.env.NODE_ENV === 'development'
    ? 'k6-studio-grafana-assistant-dev.json'
    : 'k6-studio-grafana-assistant.json'

const filePath = path.join(app.getPath('userData'), fileName)

const StoredConnectionSchema = z.object({
  grafanaUrl: z.string(),
  apiEndpoint: z.string(),
  gatToken: z.string(),
  garToken: z.string(),
  expiresAt: z.string(),
  refreshExpiresAt: z.string(),
  encrypted: z.boolean(),
})

const GrafanaAssistantStoreSchema = z.object({
  version: z.literal('1.0'),
  connections: z.record(StoredConnectionSchema),
})

type GrafanaAssistantStore = z.infer<typeof GrafanaAssistantStoreSchema>

export interface ConnectionTokens {
  apiEndpoint: string
  gatToken: string
  garToken: string
  expiresAt: string
  refreshExpiresAt: string
}

function defaultStore(): GrafanaAssistantStore {
  return { version: '1.0', connections: {} }
}

function normalizeUrl(url: string): string {
  return url.replace(/\/$/, '')
}

async function readStore(): Promise<GrafanaAssistantStore> {
  try {
    const file = await readFile(filePath, 'utf-8')
    return GrafanaAssistantStoreSchema.parse(JSON.parse(file))
  } catch {
    return defaultStore()
  }
}

async function writeStore(store: GrafanaAssistantStore): Promise<void> {
  await writeFile(filePath, JSON.stringify(store, null, 2))
}

export async function saveConnection(
  grafanaUrl: string,
  tokens: ConnectionTokens
): Promise<void> {
  const store = await readStore()
  const key = normalizeUrl(grafanaUrl)
  const canEncrypt = isEncryptionAvailable()

  store.connections[key] = {
    grafanaUrl: key,
    apiEndpoint: tokens.apiEndpoint,
    gatToken: canEncrypt ? encryptString(tokens.gatToken) : tokens.gatToken,
    garToken: canEncrypt ? encryptString(tokens.garToken) : tokens.garToken,
    expiresAt: tokens.expiresAt,
    refreshExpiresAt: tokens.refreshExpiresAt,
    encrypted: canEncrypt,
  }

  await writeStore(store)
}

export async function getConnection(
  grafanaUrl: string
): Promise<ConnectionTokens | null> {
  const store = await readStore()
  const conn = store.connections[normalizeUrl(grafanaUrl)]
  if (!conn) return null

  return {
    apiEndpoint: conn.apiEndpoint,
    gatToken: conn.encrypted ? decryptString(conn.gatToken) : conn.gatToken,
    garToken: conn.encrypted ? decryptString(conn.garToken) : conn.garToken,
    expiresAt: conn.expiresAt,
    refreshExpiresAt: conn.refreshExpiresAt,
  }
}

export async function removeConnection(grafanaUrl: string): Promise<void> {
  const store = await readStore()
  delete store.connections[normalizeUrl(grafanaUrl)]
  await writeStore(store)
}

export async function getFirstStoredGrafanaUrl(): Promise<string | null> {
  const store = await readStore()
  const [first] = Object.keys(store.connections)
  return first ?? null
}
