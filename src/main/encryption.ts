import { safeStorage } from 'electron'

export function encryptString(plainText: string): string {
  const encrypted = safeStorage.encryptString(plainText)
  return encrypted.toString('base64')
}

export function decryptString(encrypted: string): string {
  const buffer = Buffer.from(encrypted, 'base64')
  return safeStorage.decryptString(buffer)
}

export function isEncryptionAvailable(): boolean {
  return safeStorage.isEncryptionAvailable()
}
