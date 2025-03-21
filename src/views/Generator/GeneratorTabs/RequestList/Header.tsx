import { Flex, Switch, Text } from '@radix-ui/themes'

import { Filter } from '@/components/WebLogView/Filter'
import { RecorderIcon } from '@/components/icons'
import { useGeneratorStore } from '@/store/generator'
import { getFileNameWithoutExtension } from '@/utils/file'

export function Header({
  filter,
  setFilter,
  filterAllData,
  setFilterAllData,
}: {
  filter: string
  setFilter: (filter: string) => void
  filterAllData?: boolean
  setFilterAllData: (filterAllData: boolean) => void
}) {
  const previewOriginalRequests = useGeneratorStore(
    (state) => state.previewOriginalRequests
  )

  const setPreviewOriginalRequests = useGeneratorStore(
    (store) => store.setPreviewOriginalRequests
  )

  const recordingPath = useGeneratorStore((state) => state.recordingPath)

  return (
    <Flex justify="between" align="center" px="2" py="1" gap="2">
      <Text color="gray" size="2" truncate>
        <Flex align="center" gap="1">
          <Flex flexShrink="0">
            <RecorderIcon width="22px" />
          </Flex>
          <Text truncate>{getFileNameWithoutExtension(recordingPath)}</Text>
        </Flex>
      </Text>
      <Flex justify="end" align="center" gap="4">
        <Text
          as="label"
          size="1"
          color={previewOriginalRequests ? undefined : 'gray'}
          css={{ whiteSpace: 'nowrap' }}
        >
          <Flex gap="2">
            <Switch
              size="1"
              checked={previewOriginalRequests}
              onCheckedChange={setPreviewOriginalRequests}
            />
            View original requests
          </Flex>
        </Text>

        <Filter
          filter={filter}
          setFilter={setFilter}
          css={{
            width: '300px',
          }}
          size="2"
          filterAllData={filterAllData}
          setFilterAllData={setFilterAllData}
        />
      </Flex>
    </Flex>
  )
}
