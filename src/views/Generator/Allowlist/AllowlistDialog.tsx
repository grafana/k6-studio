import {
  Cross2Icon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
} from '@radix-ui/react-icons'
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Flex,
  IconButton,
  ScrollArea,
  TextField,
  Text,
  Card,
  Inset,
  Tooltip,
} from '@radix-ui/themes'
import { isEqual } from 'lodash-es'
import { useMemo, useState } from 'react'

import { Label } from '@/components/Label'
import { isHostThirdParty } from '@/store/generator/slices/recording.utils'
import { ProxyData } from '@/types'
import { isNonStaticAssetResponse } from '@/utils/staticAssets'

export function AllowlistDialog({
  hosts,
  allowlist,
  requests,
  includeStaticAssets,
  setAllowlist,
  setIncludeStaticAssets,
}: {
  hosts: string[]
  allowlist: string[]
  includeStaticAssets: boolean
  requests: ProxyData[]
  setAllowlist: (allowlist: string[]) => void
  setIncludeStaticAssets: (includeStaticAssets: boolean) => void
}) {
  const [filter, setFilter] = useState('')

  const filteredHosts = useMemo(
    () => hosts.filter((host) => host.includes(filter)),
    [hosts, filter]
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
    setAllowlist(filteredHosts)
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
            disabled={isEqual(filteredHosts, allowlist)}
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
            <Flex p="2" pr="4" asChild overflow="hidden">
              <CheckboxGroup.Root
                size="2"
                value={allowlist}
                onValueChange={handleChangeHosts}
              >
                {filteredHosts.map((host) => (
                  <Text as="label" size="2" key={host}>
                    <Flex gap="2" align="center">
                      <CheckboxGroup.Item value={host} />{' '}
                      <Text truncate>{host}</Text>
                      {isHostThirdParty(host) && (
                        <Tooltip content="This host belongs to a third-party service">
                          <ExclamationTriangleIcon />
                        </Tooltip>
                      )}
                    </Flex>
                  </Text>
                ))}
              </CheckboxGroup.Root>
            </Flex>
          </ScrollArea>
        </Inset>
      </Card>

      <Flex justify="between" align="center" mb="2">
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
