import { css } from '@emotion/react'
import { Box, Flex, Text } from '@radix-ui/themes'

import K6Logo from '@/assets/logo.svg'
import { getRoutePath } from '@/routeMap'
import { Link } from 'react-router-dom'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'

export function ActivityBar() {
  return (
    <Flex direction="column" align="center" asChild position="relative">
      <Box
        height="100%"
        maxHeight="100%"
        maxWidth="100%"
        py="3"
        overflow="hidden"
      >
        <Flex direction="column" align="center">
          <Link to={getRoutePath('home')} aria-label="Home">
            <img src={K6Logo} alt="k6 Logo" width="32" height="32" />
          </Link>
          <Text
            weight="bold"
            mt="-2"
            css={css`
              font-size: 10px;
              cursor: default;
            `}
          >
            Studio
          </Text>
        </Flex>

        <Box mt="auto">
          <ThemeSwitcher />
        </Box>
      </Box>
    </Flex>
  )
}
