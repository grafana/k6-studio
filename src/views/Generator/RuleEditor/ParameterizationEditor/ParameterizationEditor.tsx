import { Box, Grid, Separator, Text } from '@radix-ui/themes'

import { FilterField } from '../FilterField'
import { SelectorField } from '../SelectorField'

import { ValueEditor } from './ValueEditor'

export function ParameterizationEditor() {
  return (
    <>
      <Text size="2" as="p" mb="2" color="gray">
        Replace request data with variables or custom values.
      </Text>
      <Grid columns="1fr auto 1fr" gap="4">
        <Box>
          <FilterField field="filter" />
          <SelectorField field="selector" />
        </Box>
        <Separator orientation="vertical" size="4" decorative />
        <Box>
          <ValueEditor />
        </Box>
      </Grid>
    </>
  )
}
