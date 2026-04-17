import { css } from '@emotion/react'
import { Box, Text } from '@radix-ui/themes'

export function CloudWorkspaceHome() {
  return (
    <Box p="6" height="100%">
      <Text
        size="3"
        color="gray"
        css={css`
          max-width: 32rem;
        `}
      >
        Select a test from the cloud workspace tree in the sidebar to open the
        script editor.
      </Text>
    </Box>
  )
}
