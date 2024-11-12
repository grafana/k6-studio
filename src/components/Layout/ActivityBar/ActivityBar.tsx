import { css } from '@emotion/react'
import { Box, Flex, Grid, Text } from '@radix-ui/themes'

import K6Logo from '@/assets/logo.svg'
import { getRoutePath } from '@/routeMap'
import { VersionLabel } from './VersionLabel'
import { HomeIcon } from '@/components/icons'
import { NavIconButton } from './NavIconButton'
import { ApplicationLogButton } from './ApplicationLogButton'
import { SettingsButton } from './SettingsButton'
import { ProxyStatusIndicator } from './ProxyStatusIndicator'
import { HelpButton } from './HelpButton'
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
          <img src={K6Logo} alt="k6 Logo" width="32" height="32" />
          <Text
            weight="bold"
            css={css`
              font-size: 10px;
              cursor: default;
            `}
          >
            Studio
          </Text>
        </Flex>
        <Grid gap="5" mt="6">
          <NavIconButton
            to={getRoutePath('home')}
            icon={<HomeIcon />}
            tooltip="Home"
          />
        </Grid>

        <Flex direction="column" align="center" gap="3" mt="auto">
          <ThemeSwitcher />
          <ProxyStatusIndicator />
          <SettingsButton />
          <ApplicationLogButton />
          <HelpButton />
          <VersionLabel />
        </Flex>
      </Box>
    </Flex>
  )
}
