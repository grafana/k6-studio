import { css } from '@emotion/react'
import { Flex, Separator } from '@radix-ui/themes'
import { BugPlay, HammerIcon, VideoIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import k6LogoDark from '@/assets/logo-dark.svg'
import k6Logo from '@/assets/logo.svg'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { useTheme } from '@/hooks/useTheme'
import { getRoutePath } from '@/routeMap'

import { selectFileCountPerType } from '../../../store/ui/selectors'
import { useStudioUIStore } from '../../../store/ui/useStudioUIStore'
import { SidebarTab } from '../Layout.types'

import { CreateNewPopover } from './CreateNewPopover'
import { HelpButton } from './HelpButton'
import { VerticalTabButton } from './NavIconButton'
import { Profile } from './Profile'
import { ProxyStatusIndicator } from './ProxyStatusIndicator'
import { SettingsButton } from './SettingsButton'
import { VersionLabel } from './VersionLabel'

interface ActivityBarProps {
  activeTab: SidebarTab
  onTabChange: (tab: SidebarTab) => void
}

export function ActivityBar({ activeTab, onTabChange }: ActivityBarProps) {
  const theme = useTheme()
  const { recordings, generators, browserTests, scripts } = useStudioUIStore(
    selectFileCountPerType
  )

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
      <Flex direction="column" align="center" gap="1" mt="4" width="100%">
        <CreateNewPopover />
        <Separator orientation="horizontal" size="2" my="2" />
        <VerticalTabButton
          icon={<VideoIcon />}
          itemCount={recordings}
          tooltip="Record"
          active={activeTab === 'record'}
          onClick={() => onTabChange('record')}
        />
        <VerticalTabButton
          icon={<HammerIcon />}
          itemCount={generators + browserTests}
          tooltip="Build"
          active={activeTab === 'build'}
          onClick={() => onTabChange('build')}
        />
        <VerticalTabButton
          icon={<BugPlay />}
          itemCount={scripts}
          tooltip="Debug"
          active={activeTab === 'validate'}
          onClick={() => onTabChange('validate')}
        />
      </Flex>

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
