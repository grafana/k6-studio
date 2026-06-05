import { Grid } from '@radix-ui/themes'

import { FileNameHeader } from '@/components/FileNameHeader'
import { View } from '@/components/Layout/View'
import { DataFileContent } from '@/handlers/fs/types'
import { StudioFile } from '@/types'

import { DataFileControls } from './DataFileControls'
import { DataFileTable } from './DataFileTable'

interface DataFileProps {
  file: StudioFile
  content: DataFileContent
}

export function DataFile({ file, content }: DataFileProps) {
  return (
    <View
      title="Data file preview"
      subTitle={
        <FileNameHeader file={file} showExt canRename={!content.isExternal} />
      }
      actions={<DataFileControls file={file} />}
    >
      <Grid
        rows="auto minmax(0, 1fr)"
        p="2"
        gap="2"
        height="100%"
        minHeight="0"
      >
        <DataFileTable preview={content.data} isLoading={false} />
      </Grid>
    </View>
  )
}
