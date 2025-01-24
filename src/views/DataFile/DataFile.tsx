import { Badge, Flex } from '@radix-ui/themes'
import { useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

import { View } from '@/components/Layout/View'
import { getFileNameWithoutExtension } from '@/utils/file'
import { useDataFilePreview } from './DataFile.hooks'
import { DataFileControls } from './DataFileControls'
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
      </Flex>
    </View>
  )
}
