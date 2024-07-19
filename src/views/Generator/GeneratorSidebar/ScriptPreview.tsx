import { useEffect, useState } from 'react'

import { exportScript } from '../Generator.utils'
import {
  selectFilteredRequests,
  useGeneratorStore,
} from '@/hooks/useGeneratorStore'
import { CodeEditor } from '@/components/CodeEditor'

export function ScriptPreview() {
  const [preview, setPreview] = useState('')
  const rules = useGeneratorStore((state) => state.rules)
  const filteredRequests = useGeneratorStore(selectFilteredRequests)

  useEffect(() => {
    async function updatePreview() {
      const script = await exportScript(filteredRequests, rules)
      setPreview(script)
    }

    updatePreview()
  }, [filteredRequests, rules])

  return <CodeEditor readOnly value={preview} />
}
