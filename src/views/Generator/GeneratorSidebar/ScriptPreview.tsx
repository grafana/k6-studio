import { useEffect, useState } from 'react'

import { exportScript } from '../Generator.utils'
import { selectFilteredRequests, useGeneratorStore } from '@/store/generator'
import { CodeEditor } from '@/components/CodeEditor'

export function ScriptPreview() {
  const [preview, setPreview] = useState('')
  const rules = useGeneratorStore((state) => state.rules)
  const filteredRequests = useGeneratorStore(selectFilteredRequests)

  useEffect(() => {
    async function updatePreview() {
      const script = await exportScript()
      setPreview(script)
    }

    updatePreview()
    // TODO: implement a more reactive way to update the preview
  }, [filteredRequests, rules])

  return <CodeEditor readOnly value={preview} />
}
