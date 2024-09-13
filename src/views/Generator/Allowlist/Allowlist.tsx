import { useEffect, useMemo, useState } from 'react'
import { uniq } from 'lodash-es'

import { Button } from '@radix-ui/themes'
import { useGeneratorStore } from '@/store/generator'
import { ProxyData } from '@/types'
import { AllowlistDialog } from './AllowlistDialog'
import { usePrevious } from 'react-use'

export function Allowlist({ isLoading }: { isLoading: boolean }) {
  const requests = useGeneratorStore((store) => store.requests)
  const hasRecording = useGeneratorStore(
    (store) => !!store.recordingPath && store.requests.length > 0
  )
  const allowlist = useGeneratorStore((store) => store.allowlist)
  const setAllowlist = useGeneratorStore((store) => store.setAllowlist)

  const includeStaticAssets = useGeneratorStore(
    (store) => store.includeStaticAssets
  )
  const setIncludeStaticAssets = useGeneratorStore(
    (store) => store.setIncludeStaticAssets
  )

  const [showAllowlistDialog, setShowAllowlistDialog] = useState(false)

  const previousRequests = usePrevious(requests)
  const hosts = extractUniqueHosts(requests)

  const shouldResetAllowList = useMemo(() => {
    // Reset allowlist if selected recording doesn't have previously selected hosts
    return !allowlist.every((host) => hosts.includes(host))
  }, [hosts, allowlist])

  const newHostsDetected = useMemo(() => {
    if (!previousRequests) {
      return false
    }
    const previousHosts = extractUniqueHosts(previousRequests)
    return previousHosts && hosts.length > previousHosts.length
  }, [hosts, previousRequests])

  const shouldShowAllowlistDialog = useMemo(() => {
    if (hasRecording && allowlist.length === 0) {
      return true
    }

    return !isLoading && newHostsDetected
  }, [allowlist, hasRecording, newHostsDetected, isLoading])

  useEffect(() => {
    if (shouldResetAllowList) {
      setAllowlist([])
    }
  }, [setAllowlist, shouldResetAllowList])

  useEffect(() => {
    if (shouldShowAllowlistDialog) {
      setShowAllowlistDialog(true)
    }
  }, [shouldShowAllowlistDialog])

  const handleSave = ({
    allowlist,
    includeStaticAssets,
  }: {
    allowlist: string[]
    includeStaticAssets: boolean
  }) => {
    setAllowlist(allowlist)
    setIncludeStaticAssets(includeStaticAssets)
  }

  return (
    <>
      {requests.length > 0 && (
        <Button
          onClick={() => setShowAllowlistDialog(true)}
          variant="soft"
          color="gray"
        >
          Allowed hosts [{allowlist.length}/{hosts.length}]
        </Button>
      )}
      {/* Radix does not unmount dialog on close, this is need to clear local state */}
      {showAllowlistDialog && (
        <AllowlistDialog
          open={showAllowlistDialog}
          onOpenChange={setShowAllowlistDialog}
          hosts={hosts}
          allowlist={allowlist}
          onSave={handleSave}
          requests={requests}
          includeStaticAssets={includeStaticAssets}
        />
      )}
    </>
  )
}

const extractUniqueHosts = (requests: ProxyData[]) => {
  return uniq(requests.map((request) => request.request.host).filter(Boolean))
}
