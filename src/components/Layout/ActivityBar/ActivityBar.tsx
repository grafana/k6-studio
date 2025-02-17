import { Box, Flex, Grid } from '@radix-ui/themes'

import k6Logo from '@/assets/logo.svg'
import k6LogoDark from '@/assets/logo-dark.svg'
import { getRoutePath } from '@/routeMap'
import { VersionLabel } from './VersionLabel'
import { HomeIcon } from '@/components/icons'
import { NavIconButton } from './NavIconButton'
import { SettingsButton } from './SettingsButton'
import { ProxyStatusIndicator } from './ProxyStatusIndicator'
import { HelpButton } from './HelpButton'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { useTheme } from '@/hooks/useTheme'
import { Profile } from './Profile'

export function ActivityBar() {
  const theme = useTheme()

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
          <img
            src={theme === 'dark' ? k6LogoDark : k6Logo}
            alt="k6 Logo"
            width="32"
          />
        </Flex>
        <Grid gap="5" mt="4">
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
          <HelpButton />
          <Profile />
          <VersionLabel />
        </Flex>
      </Box>
    </Flex>
  )
}
