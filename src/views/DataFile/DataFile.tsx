import { Grid } from '@radix-ui/themes'

import { FileNameHeader } from '@/components/FileNameHeader'
import { View } from '@/components/Layout/View'
import { CsvFileContent, JsonFileContent } from '@/handlers/file/types'
import { StudioFile } from '@/types'

import { DataFileControls } from './DataFileControls'
import { DataFileTable } from './DataFileTable'

interface DataFileProps {
  file: StudioFile
  preview: JsonFileContent | CsvFileContent
}

export function DataFile({ file, preview }: DataFileProps) {
  return (
    <View
      title="Data file preview"
      subTitle={<FileNameHeader file={file} showExt />}
      actions={<DataFileControls file={file} />}
    >
      <Grid
        rows="auto minmax(0, 1fr)"
        p="2"
        gap="2"
        height="100%"
        minHeight="0"
      >
        <DataFileTable preview={preview} isLoading={false} />
      </Grid>
    </View>
  )
}
