import { css } from '@emotion/react'
import { Cross2Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons'
import {
  Button,
  Checkbox,
  Flex,
  IconButton,
  ScrollArea,
  TextField,
  Text,
  Card,
  Inset,
  Separator,
} from '@radix-ui/themes'
import { every, includes } from 'lodash'
import { useMemo, useState } from 'react'

import { Label } from '@/components/Label'
import { ProxyData } from '@/types'
import { isNonStaticAssetResponse } from '@/utils/staticAssets'

import AllowlistCheckGroup from './AllowlistCheckGroup'

export function AllowlistDialog({
  firstPartyHosts,
  thirdPartyHosts,
  allowlist,
  requests,
  includeStaticAssets,
  setAllowlist,
  setIncludeStaticAssets,
}: {
  firstPartyHosts: string[]
  thirdPartyHosts: string[]
  allowlist: string[]
  includeStaticAssets: boolean
  requests: ProxyData[]
  setAllowlist: (allowlist: string[]) => void
  setIncludeStaticAssets: (includeStaticAssets: boolean) => void
}) {
  const [filter, setFilter] = useState('')

  const firstPartyFilteredHosts = useMemo(
    () => firstPartyHosts.filter((host) => host.includes(filter)),
    [firstPartyHosts, filter]
  )

  const thirdPartyFilteredHosts = useMemo(
    () => thirdPartyHosts.filter((host) => host.includes(filter)),
    [thirdPartyHosts, filter]
  )

  const staticAssetCount = useMemo(() => {
    const allowedRequests = requests.filter((request) => {
      return allowlist.includes(request.request.host)
    })

    return allowedRequests.filter(
      (request) => !isNonStaticAssetResponse(request)
    ).length
  }, [requests, allowlist])

  function handleSelectAll() {
    setAllowlist([...allowlist, ...firstPartyFilteredHosts])
  }

  function handleSelectNone() {
    setAllowlist([])
  }

  function handleChangeHosts(hosts: string[]) {
    setAllowlist(hosts)
  }

  function handleCheckStaticAssets(checked: boolean) {
    setIncludeStaticAssets(checked && staticAssetCount > 0)
  }

  function shouldDisableSelectAll() {
    return every(firstPartyFilteredHosts, (host) => includes(allowlist, host))
  }

  return (
    <>
      <Text size="2" as="p" mb="2">
        Select which hosts you want to include in your test
      </Text>
      <Flex mb="3" justify="between" gap="1">
        <Flex flexGrow="1" asChild>
          <TextField.Root
            placeholder="Filter"
            size="1"
            onChange={(e) => setFilter(e.target.value)}
            value={filter}
          >
            <TextField.Slot>
              <MagnifyingGlassIcon height="16" width="16" />
            </TextField.Slot>
            {filter !== '' && (
              <TextField.Slot>
                <IconButton
                  size="1"
                  variant="ghost"
                  onClick={() => setFilter('')}
                >
                  <Cross2Icon height="12" width="12" />
                </IconButton>
              </TextField.Slot>
            )}
          </TextField.Root>
        </Flex>
        <Flex gap="1">
          <Button
            size="1"
            onClick={handleSelectAll}
            disabled={shouldDisableSelectAll()}
          >
            Select all
          </Button>
          <Button
            size="1"
            onClick={handleSelectNone}
            color="amber"
            disabled={allowlist.length === 0}
          >
            Select none
          </Button>
        </Flex>
      </Flex>

      <Card size="1" mb="2">
        <Inset css={{ height: '210px' }}>
          <ScrollArea scrollbars="vertical" type="always">
            <>
              <AllowlistCheckGroup
                allowlist={allowlist}
                onValueChange={handleChangeHosts}
                hosts={firstPartyFilteredHosts}
              />
              {thirdPartyFilteredHosts.length > 0 && (
                <>
                  <Flex align="center" px="2">
                    <Text size="1" color="gray">
                      3rd party hosts
                    </Text>
                    <Separator
                      ml="2"
                      css={css`
                        flex-grow: 1;
                      `}
                    />
                  </Flex>
                  <AllowlistCheckGroup
                    allowlist={allowlist}
                    onValueChange={handleChangeHosts}
                    hosts={thirdPartyFilteredHosts}
                  />
                </>
              )}
            </>
          </ScrollArea>
        </Inset>
      </Card>

      <Flex justify="between" align="center">
        <Label>
          <Checkbox
            onCheckedChange={handleCheckStaticAssets}
            checked={includeStaticAssets}
            disabled={staticAssetCount === 0}
          />
          <Text size="2">Include static assets ({staticAssetCount})</Text>
        </Label>
      </Flex>
    </>
  )
}
