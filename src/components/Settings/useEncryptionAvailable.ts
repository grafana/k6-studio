import { useEffect, useState } from 'react'

export function useEncryptionAvailable() {
  const [isAvailable, setIsAvailable] = useState(true)

  useEffect(() => {
    const checkEncryption = async () => {
      try {
        const available = await window.studio.settings.isEncryptionAvailable()
        setIsAvailable(available)
      } catch {
        console.error('Failed to check encryption availability')
        setIsAvailable(false)
      }
    }

    void checkEncryption()
  }, [])

  return isAvailable
}
