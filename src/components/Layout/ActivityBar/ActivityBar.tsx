import { css } from '@emotion/react'
import { Flex, Grid, Separator } from '@radix-ui/themes'
import { Link } from 'react-router-dom'

import k6LogoDark from '@/assets/logo-dark.svg'
import k6Logo from '@/assets/logo.svg'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { HomeIcon } from '@/components/icons'
import { useTheme } from '@/hooks/useTheme'
import { getRoutePath } from '@/routeMap'

import { HelpButton } from './HelpButton'
import { NavIconButton } from './NavIconButton'
import { Profile } from './Profile'
import { ProxyStatusIndicator } from './ProxyStatusIndicator'
import { SettingsButton } from './SettingsButton'
import { VersionLabel } from './VersionLabel'

export function ActivityBar() {
  const theme = useTheme()

  return (
    <Flex
      height="100%"
      maxHeight="100%"
      maxWidth="100%"
      py="3"
      direction="column"
      align="center"
      position="relative"
      overflow="hidden"
    >
      <Link
        to={getRoutePath('home')}
        css={css`
          text-align: center;
        `}
        aria-label="Home"
      >
        <img
          src={theme === 'dark' ? k6LogoDark : k6Logo}
          role="presentation"
          width="32"
        />
      </Link>
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
        <Separator orientation="horizontal" size="2" />
        <Flex direction="column" align="center" gap="3">
          <Profile />
          <VersionLabel />
        </Flex>
      </Flex>
    </Flex>
  )
}
