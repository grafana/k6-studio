import { Box, Grid, Heading, Text } from '@radix-ui/themes'
import { FilterField } from './FilterField'
import { SelectorField } from './SelectorField'
import { ParamaterizationValueEditor } from './ParameterizationValueEditor'

export function ParameterizationEditor() {
  return (
    <>
      <Heading size="2" weight="medium" mb="2">
        Parameterization
      </Heading>

      <Text size="2" as="p" mb="2" color="gray">
        Replace request data with variables or custom values.
      </Text>
      <Grid columns="2" gap="3">
        <Box>
          <FilterField field="filter" />
          <SelectorField field="selector" />
        </Box>
        <Box>
          <ParamaterizationValueEditor />
        </Box>
      </Grid>
    </>
  )
}
