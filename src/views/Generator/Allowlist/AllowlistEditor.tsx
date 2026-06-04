import { css } from '@emotion/react'
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
import { InfoIcon, SearchIcon, XIcon } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Label } from '@/components/Label'
import { PopoverTooltip } from '@/components/PopoverTooltip'
import { ProxyData } from '@/types'
import { isNonStaticAssetResponse } from '@/utils/staticAssets'

import AllowlistCheckGroup from './AllowlistCheckGroup'

export interface Allowlist {
  hosts: string[]
  includeStaticAssets: boolean
}

interface AllowlistEditorProps {
  firstPartyHosts: string[]
  thirdPartyHosts: string[]
  allowlist: Allowlist
  requests: ProxyData[]
  onChange: (allowlist: Allowlist) => void
}

export function AllowlistEditor({
  firstPartyHosts,
  thirdPartyHosts,
  allowlist,
  requests,
  onChange,
}: AllowlistEditorProps) {
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
      return allowlist.hosts.includes(request.request.host)
    })

    return allowedRequests.filter(
      (request) => !isNonStaticAssetResponse(request)
    ).length
  }, [requests, allowlist.hosts])

  function handleSelectAll() {
    onChange({
      ...allowlist,
      hosts: [...allowlist.hosts, ...firstPartyFilteredHosts],
    })
  }

  function handleSelectNone() {
    onChange({ ...allowlist, hosts: [] })
  }

  function handleChangeHosts(hosts: string[]) {
    onChange({ ...allowlist, hosts })
  }

  function handleCheckStaticAssets(checked: boolean) {
    onChange({
      ...allowlist,
      includeStaticAssets: checked && staticAssetCount > 0,
    })
  }

  const isSelectAllDisabled = useMemo(
    () =>
      firstPartyFilteredHosts.every((host) => allowlist.hosts.includes(host)),
    [firstPartyFilteredHosts, allowlist.hosts]
  )

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
              <SearchIcon size={12} />
            </TextField.Slot>
            {filter !== '' && (
              <TextField.Slot>
                <IconButton
                  size="1"
                  variant="ghost"
                  onClick={() => setFilter('')}
                >
                  <XIcon size={12} />
                </IconButton>
              </TextField.Slot>
            )}
          </TextField.Root>
        </Flex>
        <Flex gap="1">
          <Button
            size="1"
            onClick={handleSelectAll}
            disabled={isSelectAllDisabled}
          >
            Select all
          </Button>
          <Button
            size="1"
            onClick={handleSelectNone}
            color="amber"
            disabled={allowlist.hosts.length === 0}
          >
            Select none
          </Button>
        </Flex>
      </Flex>

      <Card size="1" mb="2">
        <Inset css={{ height: '210px' }}>
          <ScrollArea scrollbars="vertical" type="always">
            <Flex direction="column" pt="2">
              {firstPartyFilteredHosts.length > 0 && (
                <AllowlistSeparator text="Hosts" />
              )}
              <AllowlistCheckGroup
                selected={allowlist.hosts}
                hosts={firstPartyFilteredHosts}
                onValueChange={handleChangeHosts}
              />
              {thirdPartyFilteredHosts.length > 0 && (
                <>
                  <AllowlistSeparator
                    text="3rd party hosts"
                    tooltip="Selecting third-party hosts may include irrelevant or sensitive data outside your control. It is recommended that only hosts directly related to your app are selected."
                  />
                  <AllowlistCheckGroup
                    selected={allowlist.hosts}
                    hosts={thirdPartyFilteredHosts}
                    onValueChange={handleChangeHosts}
                  />
                </>
              )}
            </Flex>
          </ScrollArea>
        </Inset>
      </Card>

      <Flex justify="between" align="center">
        <Label>
          <Checkbox
            checked={allowlist.includeStaticAssets}
            disabled={staticAssetCount === 0}
            onCheckedChange={handleCheckStaticAssets}
          />
          <Text size="2">Include static assets ({staticAssetCount})</Text>
        </Label>
      </Flex>
    </>
  )
}

function AllowlistSeparator({
  text,
  tooltip,
}: {
  text: string
  tooltip?: string
}) {
  return (
    <Flex align="center" px="2">
      <Text size="1" color="gray">
        {text}
      </Text>
      {tooltip && (
        <PopoverTooltip content={tooltip}>
          <InfoIcon
            css={css`
              margin-left: var(--space-1);
            `}
          />
        </PopoverTooltip>
      )}
      <Separator
        ml="2"
        css={css`
          flex-grow: 1;
        `}
      />
    </Flex>
  )
}
