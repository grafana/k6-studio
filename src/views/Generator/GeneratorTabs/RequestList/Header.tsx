import { Flex, Switch, Text } from '@radix-ui/themes'

import { Filter } from '@/components/WebLogView/Filter'
import { useGeneratorStore } from '@/store/generator'

import { RecordingSelector } from '../../RecordingSelector'

interface HeaderProps {
  filter: string
  filterAllData?: boolean
  onChangeRecording: () => void
  setFilter: (filter: string) => void
  setFilterAllData: (filterAllData: boolean) => void
}

export function Header({
  filter,
  setFilter,
  filterAllData,
  setFilterAllData,
  onChangeRecording,
}: HeaderProps) {
  const previewOriginalRequests = useGeneratorStore(
    (state) => state.previewOriginalRequests
  )

  const setPreviewOriginalRequests = useGeneratorStore(
    (store) => store.setPreviewOriginalRequests
  )

  return (
    <Flex justify="between" align="center" px="2" py="1" gap="2">
      <RecordingSelector onChangeRecording={onChangeRecording} />
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
