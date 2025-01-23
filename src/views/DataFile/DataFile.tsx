import { Badge, Flex, Text } from '@radix-ui/themes'
import { useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

import { View } from '@/components/Layout/View'
import { getFileNameWithoutExtension } from '@/utils/file'
import { useDataFilePreview } from './DataFile.hooks'
import { DataFileControls } from './DataFileControls'
import { DataFilePreview } from '@/types/testData'
import { DataFileTable } from './DataFileTable'

export function DataFile() {
  const { fileName } = useParams()
  invariant(fileName, 'fileName is required')

  const { data: preview, isLoading } = useDataFilePreview(fileName)

  return (
    <View
      title="Data file"
      subTitle={
        <>
          {getFileNameWithoutExtension(fileName)}
          {!!preview && (
            <Badge color="gray" size="1">
              {preview.type.toUpperCase()}
            </Badge>
          )}
        </>
      }
      actions={<DataFileControls fileName={fileName} />}
      loading={isLoading}
    >
      <Flex direction="column" p="2" gap="2" height="100%">
        <DataFileTable preview={preview} isLoading={isLoading} />
        <Info preview={preview} isLoading={isLoading} />
      </Flex>
    </View>
  )
}

interface InfoProps {
  preview?: DataFilePreview | null
  isLoading: boolean
}

function Info({ preview, isLoading }: InfoProps) {
  if (isLoading) {
    return null
  }

  if (!preview) {
    return <Text size="2">No preview available</Text>
  }

  return (
    <Text size="2">
      <strong>{preview.data.length}</strong> out of{' '}
      <strong>{preview.total}</strong>{' '}
      {preview.type === 'csv' ? 'rows' : 'items'}.
      {preview.total > preview.data.length && (
        <>
          <br />
          To see full content, open the file in default app.
        </>
      )}
    </Text>
  )
}
