import { Box, Grid, Text } from '@radix-ui/themes'
import { ValueEditor } from './ValueEditor'
import { FilterField } from '../FilterField'
import { SelectorField } from '../SelectorField'

export function ParameterizationEditor() {
  return (
    <>
      <Text size="2" as="p" mb="2" color="gray">
        Replace request data with variables or custom values.
      </Text>
      <Grid columns="2" gap="3">
        <Box>
          <FilterField field="filter" />
          <SelectorField field="selector" />
        </Box>
        <Box>
          <ValueEditor />
        </Box>
      </Grid>
    </>
  )
}
