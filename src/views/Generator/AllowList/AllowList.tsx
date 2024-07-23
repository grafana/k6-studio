import { useGeneratorStore } from '@/store/generator'
import { ProxyData } from '@/types'
import { Button } from '@radix-ui/themes'
import { uniq } from 'lodash-es'
import { AllowListDialog } from './AllowListDialog'

export function AllowList() {
  const requests = useGeneratorStore((store) => store.requests)
  const allowList = useGeneratorStore((store) => store.allowList)
  const setAllowList = useGeneratorStore((store) => store.setAllowList)
  const showAllowListDialog = useGeneratorStore(
    (store) => store.showAllowListDialog
  )
  const setShowAllowListDialog = useGeneratorStore(
    (store) => store.setShowAllowListDialog
  )

  const hosts = extractUniqueHosts(requests)

  return (
    <>
      {requests.length > 0 && (
        <Button onClick={() => setShowAllowListDialog(true)}>
          Allowed hosts [{allowList.length}/{hosts.length}]
        </Button>
      )}
      {/* Radix does not unmount dialog on close, this is need to clear local state */}
      {showAllowListDialog && (
        <AllowListDialog
          open={showAllowListDialog}
          onOpenChange={setShowAllowListDialog}
          hosts={hosts}
          allowList={allowList}
          onAllowListChange={setAllowList}
        />
      )}
    </>
  )
}

const extractUniqueHosts = (requests: ProxyData[]) => {
  return uniq(requests.map((request) => request.request.host).filter(Boolean))
}
