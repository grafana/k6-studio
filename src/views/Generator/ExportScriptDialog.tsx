import { FileTextIcon } from '@radix-ui/react-icons'
import {
  Box,
  Button,
  Code,
  AlertDialog,
  Flex,
  Text,
  TextField,
} from '@radix-ui/themes'
import { useState } from 'react'
import { scriptExists } from './Generator.utils'

export function ExportScriptDialog({
  open,
  onExport,
  onOpenChange,
}: {
  open: boolean
  onExport: (scriptName: string) => void
  onOpenChange: (open: boolean) => void
}) {
  const [scriptName, setScriptName] = useState('')
  const [showOverwriteWarning, setShowOverwriteWarning] = useState(false)

  async function handleExportScript(overwriteFile: boolean = false) {
    const fileName = `${scriptName}.js`
    const fileExists = await scriptExists(fileName)
    if (fileExists && !overwriteFile) {
      setShowOverwriteWarning(true)
      return
    }

    setShowOverwriteWarning(false)
    onExport(fileName)
    onOpenChange(false)
  }

  function handleCancelOverwrite() {
    setShowOverwriteWarning(false)
  }

  function handleScriptNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setScriptName(e.target.value.trim())
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Content size="3" maxWidth="450px">
        <AlertDialog.Title>
          <Flex align="center" gap="2">
            <FileTextIcon color="orange" width="20px" height="20px" />
            Export scrpt
          </Flex>
        </AlertDialog.Title>
        {showOverwriteWarning && (
          <>
            <Box mb="5">
              <Text>
                A script named <Code>{scriptName}</Code> already exists. Do you
                you want to overwrite it?
              </Text>
            </Box>
            <Flex justify="end" gap="2">
              <Button
                variant="outline"
                color="orange"
                onClick={handleCancelOverwrite}
              >
                No
              </Button>

              <Button color="orange" onClick={() => handleExportScript(true)}>
                Yes
              </Button>
            </Flex>
          </>
        )}

        {!showOverwriteWarning && (
          <>
            <Box mb="5">
              <Text size="2">Script name</Text>

              <TextField.Root
                placeholder="my-script"
                value={scriptName}
                onChange={handleScriptNameChange}
              />
            </Box>

            <Flex justify="end" gap="2">
              <AlertDialog.Cancel>
                <Button variant="outline" color="orange">
                  Cancel
                </Button>
              </AlertDialog.Cancel>

              <Button color="orange" onClick={() => handleExportScript()}>
                Export
              </Button>
            </Flex>
          </>
        )}
      </AlertDialog.Content>
    </AlertDialog.Root>
  )
}
