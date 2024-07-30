import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { loadGenerator } from './Generator.utils'

export function useGeneratorView() {
  const [loading, setLoading] = useState(false)
  const { path } = useParams()

  useEffect(() => {
    if (!path) {
      return
    }

    ;(async () => {
      setLoading(true)
      await loadGenerator(path)
      setLoading(false)
    })()
  }, [path])

  return { loading }
}
