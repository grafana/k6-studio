import { Button } from '@radix-ui/themes'
import { useGeneratorStore } from '@/store/generator'
import { AllowlistDialog } from './AllowlistDialog'
import { extractUniqueHosts } from '@/store/generator/slices/recording.utils'
import { GlobeIcon } from '@radix-ui/react-icons'

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

  const includeStaticAssets = useGeneratorStore(
    (store) => store.includeStaticAssets
  )
  const setIncludeStaticAssets = useGeneratorStore(
    (store) => store.setIncludeStaticAssets
  )

  const hosts = extractUniqueHosts(requests)

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
          size="1"
          variant="ghost"
          color="gray"
          onClick={() => setShowAllowlistDialog(true)}
        >
          <GlobeIcon />
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
