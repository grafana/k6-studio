import { useEffect, useState } from 'react'
import { uniq } from 'lodash-es'

import { Button } from '@radix-ui/themes'
import { useGeneratorStore } from '@/store/generator'
import { ProxyData } from '@/types'
import { AllowlistDialog } from './AllowlistDialog'

export function Allowlist() {
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

  useEffect(() => {
    if (hasRecording && allowlist.length === 0) {
      setShowAllowlistDialog(true)
    }
  }, [allowlist, hasRecording])

  const hosts = extractUniqueHosts(requests)

  return (
    <>
      {requests.length > 0 && (
        <Button onClick={() => setShowAllowlistDialog(true)}>
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
          onAllowlistChange={setAllowlist}
          includeStaticAssets={includeStaticAssets}
          setIncludeStaticAssets={setIncludeStaticAssets}
        />
      )}
    </>
  )
}

const extractUniqueHosts = (requests: ProxyData[]) => {
  return uniq(requests.map((request) => request.request.host).filter(Boolean))
}
