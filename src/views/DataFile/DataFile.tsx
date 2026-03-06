import { Grid } from '@radix-ui/themes'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { FileNameHeader } from '@/components/FileNameHeader'
import { View } from '@/components/Layout/View'
import { TableSkeleton } from '@/components/TableSkeleton'
import { useCurrentFile } from '@/hooks/useFileNameParam'
import { getRoutePath } from '@/routeMap'
import { useToast } from '@/store/ui/useToast'

import { useDataFilePreview } from './DataFile.hooks'
import { DataFileControls } from './DataFileControls'
import { DataFileTable } from './DataFileTable'

export function DataFile() {
  const file = useCurrentFile('data-file')
  const navigate = useNavigate()
  const showToast = useToast()

  const { data: preview, isLoading, isError } = useDataFilePreview(file.path)

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
      subTitle={<FileNameHeader file={file} showExt />}
      actions={<DataFileControls file={file} />}
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
