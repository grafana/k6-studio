import { app } from 'electron'
import log from 'electron-log/main'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { z } from 'zod'

import { decryptString, encryptString } from '@/main/encryption'

const AssistantTokenDataSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  apiEndpoint: z.string(),
  expiresAt: z.number(),
  refreshExpiresAt: z.number(),
})

const AssistantTokenStoreSchema = z.object({
  version: z.literal('1.0'),
  tokens: z.record(AssistantTokenDataSchema),
})

export type AssistantTokenData = z.infer<typeof AssistantTokenDataSchema>

type AssistantTokenStore = z.infer<typeof AssistantTokenStoreSchema>

const fileName =
  process.env.NODE_ENV === 'development'
    ? 'k6-studio-assistant-tokens-dev.json'
    : 'k6-studio-assistant-tokens.json'

const filePath = path.join(app.getPath('userData'), fileName)

let cache: AssistantTokenStore | null = null

function emptyStore(): AssistantTokenStore {
  return {
    version: '1.0',
    tokens: {},
  }
}

async function readStore(): Promise<AssistantTokenStore> {
  if (cache) {
    return cache
  }

  try {
    const file = await readFile(filePath, 'utf-8')
    cache = AssistantTokenStoreSchema.parse(JSON.parse(file))
    return cache
  } catch (error) {
    log.warn('[TokenStore] Failed to read token store:', error)
    return emptyStore()
  }
}

async function writeStore(store: AssistantTokenStore): Promise<void> {
  try {
    await writeFile(filePath, JSON.stringify(store, null, 2), { mode: 0o600 })
    cache = store
  } catch (error) {
    cache = null
    throw error
  }
}

export async function getAssistantTokens(
  stackId: string
): Promise<AssistantTokenData | null> {
  const store = await readStore()
  const encrypted = store.tokens[stackId]

  if (!encrypted) {
    return null
  }

  try {
    return {
      accessToken: decryptString(encrypted.accessToken),
      refreshToken: decryptString(encrypted.refreshToken),
      apiEndpoint: encrypted.apiEndpoint,
      expiresAt: encrypted.expiresAt,
      refreshExpiresAt: encrypted.refreshExpiresAt,
    }
  } catch (error) {
    log.warn('[TokenStore] Failed to decrypt tokens for stack', stackId, error)
    return null
  }
}

export async function saveAssistantTokens(
  stackId: string,
  tokens: AssistantTokenData
): Promise<void> {
  const store = await readStore()

  const newStore: AssistantTokenStore = {
    ...store,
    tokens: {
      ...store.tokens,
      [stackId]: {
        ...tokens,
        accessToken: encryptString(tokens.accessToken),
        refreshToken: encryptString(tokens.refreshToken),
      },
    },
  }

  await writeStore(newStore)
}

export async function clearAssistantTokens(stackId: string): Promise<void> {
  const store = await readStore()

  const { [stackId]: _, ...rest } = store.tokens

  await writeStore({
    ...store,
    tokens: rest,
  })
}

export async function hasAssistantTokens(stackId: string): Promise<boolean> {
  const store = await readStore()
  return stackId in store.tokens
}
