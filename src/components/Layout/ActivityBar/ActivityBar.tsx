import { css } from '@emotion/react'
import { Box, Flex, Grid, Text } from '@radix-ui/themes'
import { useMatch } from 'react-router-dom'

import K6Logo from '@/assets/logo.svg'
import { getRoutePath } from '@/routeMap'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { VersionLabel } from './VersionLabel'
import {
  GeneratorIcon,
  HomeIcon,
  RecorderIcon,
  ValidatorIcon,
} from '@/components/icons'
import { useCreateGenerator } from '@/hooks/useCreateGenerator'
import { NavIconButton } from './NavIconButton'

export function ActivityBar() {
  const createNewGenerator = useCreateGenerator()
  const homeMatch = useMatch(getRoutePath('home'))
  const recorderMatch = useMatch(getRoutePath('recorder'))
  const validatorMatch = useMatch(getRoutePath('validator'))
  const generatorMatch = useMatch({
    path: getRoutePath('generator'),
    end: false,
  })

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
          <NavIconButton
            to={getRoutePath('recorder')}
            icon={<RecorderIcon />}
            tooltip="Test recorder"
            active={Boolean(recorderMatch)}
          />
          <NavIconButton
            onClick={createNewGenerator}
            icon={<GeneratorIcon />}
            tooltip="New test generator"
            active={Boolean(generatorMatch)}
          />
          <NavIconButton
            to={getRoutePath('validator', {})}
            icon={<ValidatorIcon />}
            tooltip="Test validator"
            active={Boolean(validatorMatch)}
          />
        </Grid>

        <Flex direction="column" align="center" gap="3" mt="auto">
          <ThemeSwitcher />
          <VersionLabel />
        </Flex>
      </Box>
    </Flex>
  )
}
