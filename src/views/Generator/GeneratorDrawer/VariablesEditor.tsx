import { useState, ChangeEvent } from 'react'
import { PlusIcon, TrashIcon } from '@radix-ui/react-icons'
import { Box, Button, IconButton, Table, TextField } from '@radix-ui/themes'

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
        <Table.Root size="1" variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Value</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {variables.map((variable, index) => (
              <Table.Row key={index}>
                <Table.Cell>
                  <TextField.Root
                    placeholder="name"
                    value={variable.name}
                    onChange={handleChangeVariable(index, 'name')}
                  />
                </Table.Cell>
                <Table.Cell>
                  <TextField.Root
                    placeholder="value"
                    value={variable.value}
                    onChange={handleChangeVariable(index, 'value')}
                  />
                </Table.Cell>
                <Table.Cell>
                  <IconButton onClick={handleRemoveVariable(index)}>
                    <TrashIcon width="18" height="18" />
                  </IconButton>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}
      <Button m="4" variant="ghost" onClick={handleAddVariable}>
        <PlusIcon width="18" height="18" /> Add variable
      </Button>
    </Box>
  )
}
