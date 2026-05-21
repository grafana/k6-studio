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
import { useNavigate } from 'react-router-dom'

import { generateScript } from '@/codegen'
import { getViewPath } from '@/routeMap'
import {
  extractUniqueHosts,
  groupHostsByParty,
} from '@/store/generator/slices/recording.utils'
import { useStudioUIStore } from '@/store/ui'
import { useToast } from '@/store/ui/useToast'
import { ProxyData } from '@/types'
import { GeneratorFileData } from '@/types/generator'
import { createNewGeneratorFile } from '@/utils/generator'
import { prettify } from '@/utils/prettify'
import { isNonStaticAssetResponse } from '@/utils/staticAssets'
import { Allowlist } from '@/views/Generator/Allowlist/Allowlist'

type ExportMode = 'allowlist' | 'generator'

interface ExportScriptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requests: ProxyData[]
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

export function ExportScriptDialog({
  open,
  onOpenChange,
  requests,
}: ExportScriptDialogProps) {
  const generators = useStudioUIStore((s) => [...s.generators.values()])

  const navigate = useNavigate()
  const showToast = useToast()

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

  const handleExport = async (generator: GeneratorFileData) => {
    try {
      setIsExporting(true)

      const filteredRequests = filterRequests(
        requests,
        generator.allowlist,
        generator.includeStaticAssets
      )

      const scriptPath = await window.studio.fs.showSaveAsDialog('my-script.js')

      if (!scriptPath) {
        return
      }

      const rawScript = generateScript({
        recording: filteredRequests,
        generator,
        scriptPath,
      })

      const script = await prettify(rawScript)

      await window.studio.script.saveScript(scriptPath, script)

      onOpenChange(false)
      navigate(getViewPath('script', scriptPath))
    } catch {
      showToast({ title: 'Failed to export script.', status: 'error' })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportWithAllowlist = () => {
    if (allowlist.length === 0) {
      return
    }

    return handleExport({
      ...createNewGeneratorFile(),
      allowlist,
      includeStaticAssets,
    })
  }

  const handleExportWithGenerator = async () => {
    if (!selectedGeneratorPath) {
      return
    }

    try {
      setIsExporting(true)

      const generator = await window.studio.generator.loadGenerator(
        selectedGeneratorPath
      )

      return await handleExport(generator)
    } catch {
      showToast({ title: 'Failed to load generator.', status: 'error' })
    } finally {
      setIsExporting(false)
    }
  }

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
          <Button
            disabled={isDisabled}
            onClick={
              mode === 'allowlist'
                ? handleExportWithAllowlist
                : handleExportWithGenerator
            }
          >
            {isExporting && <Spinner />}
            Export
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
