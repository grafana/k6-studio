import { Button } from '@radix-ui/themes'
import { useGeneratorStore } from '@/store/generator'
import { AllowlistDialog } from './AllowlistDialog'
import { extractUniqueHosts } from '@/store/generator/slices/recording.utils'
import { GlobeIcon } from '@radix-ui/react-icons'
import { PopoverDialog } from '@/components/PopoverDialogs'

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

  return (
    <>
      <PopoverDialog
        open={showAllowlistDialog}
        onOpenChange={setShowAllowlistDialog}
        modal // needed to automatically open when switching recordings
        trigger={
          <Button
            size="1"
            variant="ghost"
            color="gray"
            onClick={() => setShowAllowlistDialog(true)}
          >
            <GlobeIcon />
            Allowed hosts [{allowlist.length}/{hosts.length}]
          </Button>
        }
      >
        <AllowlistDialog
          hosts={hosts}
          allowlist={allowlist}
          requests={requests}
          includeStaticAssets={includeStaticAssets}
          setAllowlist={setAllowlist}
          setIncludeStaticAssets={setIncludeStaticAssets}
        />
      </PopoverDialog>
    </>
  )
}
