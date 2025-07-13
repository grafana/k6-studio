import { css } from '@emotion/react'
import {
  Button,
  DropdownMenu,
  Flex,
  IconButton,
  Text,
  Tooltip,
} from '@radix-ui/themes'
import {
  FilePlusIcon,
  InfoIcon,
  PlusIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from 'lucide-react'

import { PopoverTooltip } from '@/components/PopoverTooltip'
import { Table } from '@/components/Table'
import { useImportDataFile } from '@/hooks/useImportDataFile'
import { useGeneratorStore } from '@/store/generator'
import { useStudioUIStore } from '@/store/ui'
import { DataFile } from '@/types/testData'

export function DataFiles() {
  const selectedFiles = useGeneratorStore((store) => store.files)
  const setFiles = useGeneratorStore((store) => store.setFiles)

  const handleRemove = (fileName: string) => {
    setFiles(selectedFiles.filter((file) => file.name !== fileName))
  }

  return (
    <>
      <Text size="2" as="p" mb="2">
        Configure data files and use them in you test rules.
      </Text>
      <Table.Root size="1" variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Data file</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              <Flex align="center" gap="1">
                Access method
                <PopoverTooltip content="Defines how the items are accessed during the test">
                  <InfoIcon size={12} />
                </PopoverTooltip>
              </Flex>
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

          <Table.Row>
            <Table.RowHeaderCell colSpan={3} justify="center">
              <AddDataFileDropdown />
            </Table.RowHeaderCell>
          </Table.Row>
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

  const isFileMissing = useStudioUIStore(
    (store) => !store.dataFiles.has(file.name)
  )

  return (
    <Table.Row
      css={css`
        vertical-align: middle;
      `}
    >
      <Table.Cell>
        <Flex align="center" gap="1">
          {isFileMissing && (
            <Tooltip content="Data file is missing">
              <TriangleAlertIcon
                css={css`
                  color: var(--red-9);
                `}
                aria-label="Data file is missing"
              />
            </Tooltip>
          )}
          {file.name}
        </Flex>
      </Table.Cell>
      <Table.Cell>Unique item per iteration</Table.Cell>
      <Table.Cell>
        <Tooltip
          content="Data file is referenced in a rule"
          hidden={!isFileInUse && !isFileMissing}
        >
          <IconButton
            aria-label="Remove"
            disabled={isFileInUse && !isFileMissing}
            onClick={onRemove}
          >
            <Trash2Icon />
          </IconButton>
        </Tooltip>
      </Table.Cell>
    </Table.Row>
  )
}

function AddDataFileDropdown() {
  const setFiles = useGeneratorStore((store) => store.setFiles)
  const availableFiles = useStudioUIStore((store) => store.dataFiles)
  const selectedFiles = useGeneratorStore((store) => store.files)

  const options = [...availableFiles.values()].filter(
    (file) => !selectedFiles.find((f) => f.name === file.fileName)
  )

  const handleAdd = (fileName: string) => {
    if (selectedFiles.find((file) => file.name === fileName)) return

    setFiles([...selectedFiles, { name: fileName }])
  }

  const importDataFile = useImportDataFile()

  const handleImportDataFile = async () => {
    const fileName = await importDataFile()

    if (fileName) {
      handleAdd(fileName)
    }
  }

  return (
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
        {options.length > 0 && <DropdownMenu.Separator />}
        <DropdownMenu.Item onClick={handleImportDataFile}>
          <FilePlusIcon />
          Import new data file
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
