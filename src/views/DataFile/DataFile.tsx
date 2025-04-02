import { Grid } from '@radix-ui/themes'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

import { FileNameHeader } from '@/components/FileNameHeader'
import { View } from '@/components/Layout/View'
import { TableSkeleton } from '@/components/TableSkeleton'
import { getRoutePath } from '@/routeMap'
import { useToast } from '@/store/ui/useToast'
import { getFileNameWithoutExtension } from '@/utils/file'

import { useDataFilePreview } from './DataFile.hooks'
import { DataFileControls } from './DataFileControls'
import { DataFileTable } from './DataFileTable'

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

  if (!preview) {
    return null
  }

  return (
    <View
      title="Data file preview"
      subTitle={
        <FileNameHeader
          file={{
            fileName,
            displayName: getFileNameWithoutExtension(fileName),
            type: 'data-file',
          }}
          showExt
        />
      }
      actions={<DataFileControls fileName={fileName} />}
      loading={isLoading}
    >
      <Grid
        rows="auto minmax(0, 1fr)"
        p="2"
        gap="2"
        height="100%"
        minHeight="0"
      >
        {isLoading ? (
          <TableSkeleton rootProps={{ size: '1' }} columns={8} rows={10} />
        ) : (
          <DataFileTable preview={preview} isLoading={isLoading} />
        )}
      </Grid>
    </View>
  )
}
