import { Flex, Grid, Separator } from '@radix-ui/themes'

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
import { css } from '@emotion/react'
import { Feature } from '@/components/Feature'

export function ActivityBar() {
  const theme = useTheme()

  return (
    <Flex direction="column" align="center" asChild position="relative">
      <Flex
        direction="column"
        height="100%"
        maxHeight="100%"
        maxWidth="100%"
        py="3"
        overflow="hidden"
        gap="3"
      >
        <Flex direction="column" align="center">
          <img
            src={theme === 'dark' ? k6LogoDark : k6Logo}
            alt="k6 Logo"
            width="32"
          />
        </Flex>
        <Grid
          css={css`
            flex: 1 1 0;
          `}
          gap="5"
          mt="4"
        >
          <NavIconButton
            to={getRoutePath('home')}
            icon={<HomeIcon />}
            tooltip="Home"
          />
        </Grid>

        <Flex direction="column" align="center" gap="3">
          <ThemeSwitcher />
          <ProxyStatusIndicator />
          <SettingsButton />
          <HelpButton />
        </Flex>
        <Feature feature="cloud-auth">
          <Separator orientation="horizontal" size="2" />
        </Feature>
        <Flex direction="column" align="center" gap="3">
          <Feature feature="cloud-auth">
            <Profile />
          </Feature>
          <VersionLabel />
        </Flex>
      </Flex>
    </Flex>
  )
}
