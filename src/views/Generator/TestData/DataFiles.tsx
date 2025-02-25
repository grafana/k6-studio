import { Table } from '@/components/Table'
import { useGeneratorStore } from '@/store/generator'
import { useStudioUIStore } from '@/store/ui'
import { DataFile } from '@/types/testData'
import { InfoCircledIcon, PlusIcon, TrashIcon } from '@radix-ui/react-icons'
import {
  Button,
  DropdownMenu,
  IconButton,
  Text,
  Tooltip,
} from '@radix-ui/themes'

export function DataFiles() {
  const availableFiles = useStudioUIStore((store) => store.dataFiles)
  const selectedFiles = useGeneratorStore((store) => store.files)
  const setFiles = useGeneratorStore((store) => store.setFiles)
  const options = [...availableFiles.values()].filter(
    (file) => !selectedFiles.find((f) => f.name === file.fileName)
  )

  const handleAdd = (fileName: string) => {
    setFiles([...selectedFiles, { name: fileName }])
  }

  const handleRemove = (fileName: string) => {
    setFiles(selectedFiles.filter((file) => file.name !== fileName))
  }

  return (
    <>
      <Text size="2" as="p" mb="2">
        Add data files to make tests more realistic and prevent server-side
        caching from affecting the results.
      </Text>
      <Table.Root size="1" variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Data file</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              Access method <InfoCircledIcon />{' '}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width="0"></Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {selectedFiles.map((file) => (
            <DataFileRow
              key={file.name}
              file={file}
              onRemove={() => handleRemove(file.name)}
            />
          ))}
          {options.length > 0 && (
            <Table.Row>
              <Table.RowHeaderCell colSpan={3} justify="center">
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <Button variant="ghost">
                      Add data file <PlusIcon />
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content>
                    {options.map((file) => (
                      <DropdownMenu.Item
                        key={file.fileName}
                        onClick={() => handleAdd(file.fileName)}
                      >
                        {file.fileName}
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </Table.RowHeaderCell>
            </Table.Row>
          )}
        </Table.Body>
      </Table.Root>
    </>
  )
}

interface DataFileRowProps {
  file: DataFile
  onRemove: () => void
}

function DataFileRow({ file, onRemove }: DataFileRowProps) {
  const isFileInUse = useGeneratorStore((state) =>
    state.rules.some(
      (rule) =>
        rule.type === 'parameterization' &&
        rule.value.type === 'dataFileValue' &&
        rule.value.fileName === file.name
    )
  )

  return (
    <Table.Row>
      <Table.Cell>{file.name}</Table.Cell>
      <Table.Cell>Random selection</Table.Cell>
      <Table.Cell>
        <Tooltip
          content="Data file is referenced in a rule"
          hidden={!isFileInUse}
        >
          <IconButton
            aria-label="Remove"
            disabled={isFileInUse}
            onClick={onRemove}
          >
            <TrashIcon width="18" height="18" />
          </IconButton>
        </Tooltip>
      </Table.Cell>
    </Table.Row>
  )
}
