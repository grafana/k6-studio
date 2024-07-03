import { useState, ChangeEvent } from 'react'
import { Box, Button, Flex, IconButton, TextField } from '@radix-ui/themes'
import { PlusIcon, TrashIcon } from '@radix-ui/react-icons'

interface Variable {
  name: string
  value: string
}

export function VariablesEditor() {
  const [variables, setVariables] = useState<Variable[]>([])

  function handleAddVariable() {
    setVariables([...variables, { name: '', value: '' }])
  }

  function handleRemoveVariable(index: number) {
    return () => {
      const newVariables = variables.filter((_, i) => i !== index)
      setVariables(newVariables)
    }
  }

  function handleChangeVariable(index: number, key: 'name' | 'value') {
    return (e: ChangeEvent<HTMLInputElement>) => {
      const newVariables = variables.map((variable, i) => {
        if (i !== index) {
          return variable
        }

        return {
          ...variable,
          [key]: e.target.value,
        }
      })

      setVariables(newVariables)
    }
  }

  return (
    <Box p="2">
      {variables.length !== 0 && (
        <Flex gap="2" p="2" direction="column" width="100%">
          {variables.map((variable, index) => (
            <Flex gap="2" key={index}>
              <TextField.Root
                placeholder="name"
                value={variable.name}
                onChange={handleChangeVariable(index, 'name')}
              />

              <TextField.Root
                placeholder="value"
                value={variable.value}
                onChange={handleChangeVariable(index, 'value')}
              />

              <IconButton>
                <TrashIcon
                  width="18"
                  height="18"
                  onClick={handleRemoveVariable(index)}
                />
              </IconButton>
            </Flex>
          ))}
        </Flex>
      )}
      <Button m="4" variant="ghost" onClick={handleAddVariable}>
        <PlusIcon width="18" height="18" /> Add variable
      </Button>
    </Box>
  )
}
