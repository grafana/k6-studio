import { Switch, Text } from '@radix-ui/themes'

import { Label } from '@/components/Label'

export function StaticAssetsFilter({
  includeStaticAssets,
  setIncludeStaticAssets,
  staticAssetCount,
}: {
  includeStaticAssets?: boolean
  setIncludeStaticAssets: (value: boolean) => void
  staticAssetCount: number
}) {
  if (staticAssetCount === 0) {
    return null
  }

  return (
    <Label>
      <Text size="2">Show static assets ({staticAssetCount})</Text>
      <Switch
        onCheckedChange={setIncludeStaticAssets}
        checked={includeStaticAssets}
      />
    </Label>
  )
}
