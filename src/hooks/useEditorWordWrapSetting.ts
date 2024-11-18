import { EditorSettings } from '@/types/settings'
import { useState, useEffect } from 'react'
import { useDebounce } from 'react-use'

export function useEditorWordWrapSetting(key: keyof EditorSettings) {
  const [wordWrap, setWordWrap] = useState<'on' | 'off'>('off')
  const [editor, setEditor] = useState<EditorSettings>()

  useEffect(() => {
    async function fetchSettings() {
      const settings = await window.studio.settings.getSettings()
      setEditor(settings.editor)
      setWordWrap(settings.editor[key])
    }
    fetchSettings()
  }, [key])

  useDebounce(
    () => {
      window.studio.settings.saveSettingsByKey('editor', {
        ...editor,
        [key]: wordWrap,
      })
    },
    500,
    [wordWrap]
  )

  return {
    wordWrap,
    setWordWrap: (checked: boolean) => setWordWrap(checked ? 'on' : 'off'),
  }
}
