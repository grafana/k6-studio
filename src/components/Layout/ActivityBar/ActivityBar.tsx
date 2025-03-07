import { Link } from 'react-router-dom'
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
