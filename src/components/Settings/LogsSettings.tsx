import { Button, Flex, Spinner, Text } from '@radix-ui/themes'
import * as monaco from 'monaco-editor'
import { useEffect, useState, useCallback } from 'react'

import { ReadOnlyEditor } from '../Monaco/ReadOnlyEditor'

import { SettingsSection } from './SettingsSection'

export function LogsSettings() {
  const [logContent, setLogContent] = useState<string>('')
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor>()

  const scrollToLastLine = useCallback(() => {
    if (!editor || !logContent) return
    const lineCount = editor.getModel()?.getLineCount() || 0
    editor.revealLine(lineCount)
  }, [editor, logContent])

  // retrieve the current content of the log file
  useEffect(() => {
    ;(async function fetchLogContent() {
      const content = await window.studio.log.getLogContent()
      setLogContent(content)
      scrollToLastLine()
    })()
  }, [scrollToLastLine])

  // subscribe to log changes
  useEffect(() => {
    return window.studio.log.onLogChange((content: string) => {
      setLogContent(content)
      scrollToLastLine()
    })
  }, [scrollToLastLine])

  const handleOpenLogClick = () => {
    window.studio.log.openLogFolder()
  }

  const handleEditorMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    setEditor(editor)
  }

  return (
    <SettingsSection>
      <Flex mb="4" justify="between" align="center">
        <Flex align="center">
          <Spinner mr="2" />
          <Text size="2" color="gray">
            Application logs are updated in real-time.
          </Text>
        </Flex>
        <Button onClick={handleOpenLogClick} variant="outline">
          Open logs folder
        </Button>
      </Flex>

      <Flex flexGrow="1">
        <ReadOnlyEditor
          language="log"
          value={logContent}
          onMount={handleEditorMount}
        />
      </Flex>
    </SettingsSection>
  )
}
