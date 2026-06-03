import {
  Button,
  Dialog,
  Flex,
  RadioGroup,
  Select,
  Spinner,
  Text,
} from '@radix-ui/themes'
import { useMemo, useState } from 'react'

import { useExportScript } from '@/hooks/useExportScript'
import {
  extractUniqueHosts,
  groupHostsByParty,
} from '@/store/generator/slices/recording.utils'
import { useStudioUIStore } from '@/store/ui'
import { ProxyData } from '@/types'
import { safeAtob } from '@/utils/format'
import { createNewGeneratorFile } from '@/utils/generator'
import { isNonStaticAssetResponse } from '@/utils/staticAssets'
import { Allowlist } from '@/views/Generator/Allowlist/Allowlist'
import {
  generateScriptPreview,
  loadGeneratorFile,
} from '@/views/Generator/Generator.utils'

function parseContent<T extends { content: string | null } | undefined>(
  entry: T
): T {
  return (
    entry && {
      ...entry,
      content: entry.content ? safeAtob(entry.content) : entry.content,
    }
  )
}
function filterRequests(
  requests: ProxyData[],
  allowlist: string[],
  includeStaticAssets: boolean
) {
  const allowedRequests = requests.filter((r) =>
    allowlist.includes(r.request.host)
  )
  return includeStaticAssets
    ? allowedRequests
    : allowedRequests.filter(isNonStaticAssetResponse)
}

type ExportMode = 'allowlist' | 'generator'

interface ExportScriptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requests: ProxyData[]
}

export function ExportScriptDialog({
  open,
  onOpenChange,
  requests,
}: ExportScriptDialogProps) {
  const generators = useStudioUIStore((s) => [...s.generators.values()])

  const [isExporting, setIsExporting] = useState(false)

  const [mode, setMode] = useState<ExportMode>(
    generators.length > 0 ? 'generator' : 'allowlist'
  )

  const { firstParty, thirdParty } = useMemo(() => {
    const uniqueHosts = extractUniqueHosts(requests)

    return groupHostsByParty(uniqueHosts)
  }, [requests])

  const [allowlist, setAllowlist] = useState<string[]>(firstParty.slice(0, 1))
  const [includeStaticAssets, setIncludeStaticAssets] = useState(false)

  const [selectedGeneratorPath, setSelectedGeneratorPath] = useState(
    generators[0]?.path ?? ''
  )

  async function getGenerator() {
    switch (mode) {
      case 'allowlist':
        if (allowlist.length === 0) {
          return null
        }

        return {
          ...createNewGeneratorFile(),
          allowlist,
          includeStaticAssets,
        }

      case 'generator': {
        if (!selectedGeneratorPath) {
          return null
        }

        const { data } = await loadGeneratorFile(selectedGeneratorPath)
        return data
      }
    }
  }

  const exportScript = useExportScript({
    enableMenuItem: false,
    openOnSave: true,
    fileName: 'my-script.js',
    content: async (scriptPath) => {
      setIsExporting(true)

      const generator = await getGenerator()

      if (generator === null) {
        throw new Error('Failed to get generator.')
      }

      const filteredRequests = filterRequests(
        requests,
        generator.allowlist,
        generator.includeStaticAssets
      )

      return await generateScriptPreview(
        scriptPath,
        generator,
        filteredRequests.map((request) => {
          return {
            ...request,
            // Make sure that any base64 encoded content is decoded before the export,
            // otherwise rules won't be applied properly to the bodies
            request: parseContent(request.request),
            response: parseContent(request.response),
          }
        })
      )
    },
    onSuccess: () => {
      setIsExporting(false)
      onOpenChange(false)
    },
    onError: () => {
      setIsExporting(false)
    },
  })

  const isDisabled =
    isExporting ||
    (mode === 'allowlist' && allowlist.length === 0) ||
    (mode === 'generator' && !selectedGeneratorPath)

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content width="500px" size="3">
        <Dialog.Title>Export as script</Dialog.Title>

        <Flex direction="column" gap="4">
          <RadioGroup.Root
            value={mode}
            onValueChange={(v) => setMode(v as ExportMode)}
          >
            <Flex gap="4">
              <Text as="label" size="2">
                <Flex gap="2" align="center">
                  <RadioGroup.Item value="generator" />
                  Use generator
                </Flex>
              </Text>
              <Text as="label" size="2">
                <Flex gap="2" align="center">
                  <RadioGroup.Item value="allowlist" />
                  Apply allowlist
                </Flex>
              </Text>
            </Flex>
          </RadioGroup.Root>

          {mode === 'allowlist' && (
            <Allowlist
              firstPartyHosts={firstParty}
              thirdPartyHosts={thirdParty}
              allowlist={allowlist}
              requests={requests}
              includeStaticAssets={includeStaticAssets}
              setAllowlist={setAllowlist}
              setIncludeStaticAssets={setIncludeStaticAssets}
            />
          )}

          {mode === 'generator' && (
            <Flex direction="column" gap="2">
              <Text size="2" color="gray">
                Select an HTTP test generator to apply its rules and settings to
                the captured network traffic.
              </Text>
              {generators.length === 0 ? (
                <Text size="2" color="amber">
                  No generators found. Create a generator first or use the
                  allowlist option.
                </Text>
              ) : (
                <Select.Root
                  value={selectedGeneratorPath}
                  onValueChange={setSelectedGeneratorPath}
                >
                  <Select.Trigger />
                  <Select.Content>
                    {generators.map((g) => (
                      <Select.Item key={g.path} value={g.path}>
                        {g.displayName}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              )}
            </Flex>
          )}
        </Flex>

        <Flex justify="end" gap="2" mt="4">
          <Dialog.Close>
            <Button variant="outline" disabled={isExporting}>
              Cancel
            </Button>
          </Dialog.Close>
          <Button disabled={isDisabled} onClick={() => exportScript()}>
            {isExporting && <Spinner />}
            Export
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
