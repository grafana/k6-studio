import { Badge, Flex } from '@radix-ui/themes'
import { useNavigate, useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

import { View } from '@/components/Layout/View'
import { getFileNameWithoutExtension } from '@/utils/file'
import { useDataFilePreview } from './DataFile.hooks'
import { DataFileControls } from './DataFileControls'
import { DataFileTable } from './DataFileTable'
import { useEffect } from 'react'
import { useToast } from '@/store/ui/useToast'
import { getRoutePath } from '@/routeMap'

export function DataFile() {
  const { fileName } = useParams()
  const navigate = useNavigate()
  const showToast = useToast()
  invariant(fileName, 'fileName is required')

  const { data: preview, isLoading, isError } = useDataFilePreview(fileName)

  useEffect(() => {
    if (isError) {
      showToast({
        title: 'Failed to load data file',
        status: 'error',
      })
      navigate(getRoutePath('home'))
    }
  }, [isError, navigate, showToast])

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
