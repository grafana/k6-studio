import { PlusIcon, TrashIcon } from '@radix-ui/react-icons'
import {
  Button,
  Container,
  Flex,
  Heading,
  IconButton,
  Select,
  Table,
  Text,
  TextField,
} from '@radix-ui/themes'

import { useGeneratorStore } from '@/hooks/useGeneratorStore'

export function RequestFilters() {
  const { requestFilters = [], setRequestFilters } = useGeneratorStore()

  function handleAddFilter() {
    setRequestFilters([...requestFilters, { url: '', allowed: true }])
  }

  function handleRemoveFilter(index: number) {
    return () => {
      const newVariables = requestFilters.filter((_, i) => i !== index)
      setRequestFilters(newVariables)
    }
  }

  function handleChangeFilter(
    index: number,
    key: 'url' | 'allowed',
    value: string | boolean
  ) {
    const newRequestFilters = requestFilters.map((filter, i) => {
      if (i !== index) {
        return filter
      }

      return {
        ...filter,
        [key]: value,
      }
    })

    setRequestFilters(newRequestFilters)
  }

  return (
    <Container align="left" size="2" p="2">
      <Flex direction="column" gap="2">
        <div>
          <Heading color="gray" mb="1" size="3">
            Request Filters
          </Heading>
          <Text size="2" wrap="balance">
            Add URL patterns here to allow or block matching requests.
          </Text>
        </div>
        {requestFilters.length !== 0 && (
          <Table.Root layout="auto" size="1" variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>URL</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Allowed</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {requestFilters.map((filter, index) => (
                <Table.Row key={index}>
                  <Table.Cell>
                    <TextField.Root
                      placeholder="http://example.com"
                      value={filter.url}
                      onChange={(e) =>
                        handleChangeFilter(index, 'url', e.target.value)
                      }
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Select.Root
                      size="2"
                      defaultValue="true"
                      value={String(filter.allowed)}
                      onValueChange={(allowed) =>
                        handleChangeFilter(index, 'allowed', allowed === 'true')
                      }
                    >
                      <Select.Trigger style={{ width: '100%' }} />
                      <Select.Content>
                        <Select.Item value="true">true</Select.Item>
                        <Select.Item value="false">false</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </Table.Cell>
                  <Table.Cell justify="end" width="18px">
                    <IconButton onClick={handleRemoveFilter(index)}>
                      <TrashIcon width="18" height="18" />
                    </IconButton>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        )}
      </Flex>
      <Button m="4" variant="ghost" onClick={handleAddFilter}>
        <PlusIcon width="18" height="18" /> Add request filter
      </Button>
    </Container>
  )
}
