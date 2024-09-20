import { css } from '@emotion/react'
import {
  Box,
  DropdownMenu,
  Flex,
  Grid,
  IconButton,
  Text,
} from '@radix-ui/themes'
import { Link, useMatch } from 'react-router-dom'

import K6Logo from '@/assets/logo.svg'
import { getRoutePath } from '@/routeMap'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { VersionLabel } from './VersionLabel'
import { HomeIcon } from '@/components/icons'
import { useCreateGenerator } from '@/hooks/useCreateGenerator'
import { NavIconButton } from './NavIconButton'
import { PlusIcon } from '@/components/icons/PlusIcon'

export function ActivityBar() {
  const createNewGenerator = useCreateGenerator()
  const homeMatch = useMatch(getRoutePath('home'))

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
            active={Boolean(homeMatch)}
          />
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <IconButton variant="ghost" color="gray">
                <PlusIcon />
              </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content side="right">
              <DropdownMenu.Item asChild>
                <Link to={getRoutePath('recorder')} state={{ autoStart: true }}>
                  Record flow
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item onSelect={createNewGenerator}>
                Generate test
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <Link to={getRoutePath('validator', {})}>Validate script</Link>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Grid>

        <Flex direction="column" align="center" gap="3" mt="auto">
          <ThemeSwitcher />
          <VersionLabel />
        </Flex>
      </Box>
    </Flex>
  )
}
