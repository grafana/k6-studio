import { useGeneratorStore } from '@/store/generator'
import { ProxyData } from '@/types'
import { Button } from '@radix-ui/themes'
import { uniq } from 'lodash-es'
import { AllowlistDialog } from './AllowlistDialog'

export function Allowlist() {
  const requests = useGeneratorStore((store) => store.requests)
  const allowlist = useGeneratorStore((store) => store.allowlist)
  const setAllowlist = useGeneratorStore((store) => store.setAllowlist)
  const showAllowlistDialog = useGeneratorStore(
    (store) => store.showAllowlistDialog
  )
  const setShowAllowlistDialog = useGeneratorStore(
    (store) => store.setShowAllowlistDialog
  )

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
        />
      )}
    </>
  )
}

const extractUniqueHosts = (requests: ProxyData[]) => {
  return uniq(requests.map((request) => request.request.host).filter(Boolean))
}
