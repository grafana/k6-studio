import { css } from '@emotion/react'
import { Flex } from '@radix-ui/themes'
import {
  AU,
  BH,
  BR,
  CA,
  CN,
  DE,
  FlagComponent,
  FR,
  GB,
  IE,
  IN,
  IT,
  JP,
  KR,
  SE,
  SG,
  US,
  ZA,
} from 'country-flag-icons/react/3x2'
import { ReactNode } from 'react'

import { AvailableLoadZones, LoadZoneData } from '@/types/testOptions'

type LoadZonesOption = {
  label: ReactNode
  value: AvailableLoadZones
  flag: FlagComponent
}

const loadZoneOptionsMap: Array<LoadZonesOption> = [
  { label: 'US East (Ohio)', value: 'amazon:us:columbus', flag: US },
  { label: 'Africa (Cape Town)', value: 'amazon:sa:cape town', flag: ZA },
  { label: 'Asia Pacific (Hong Kong)', value: 'amazon:cn:hong kong', flag: CN },
  { label: 'Asia Pacific (Mumbai)', value: 'amazon:in:mumbai', flag: IN },
  { label: 'Asia Pacific (Osaka)', value: 'amazon:jp:osaka', flag: JP },
  { label: 'Asia Pacific (Seoul)', value: 'amazon:kr:seoul', flag: KR },
  { label: 'Asia Pacific (Singapore)', value: 'amazon:sg:singapore', flag: SG },
  { label: 'Asia Pacific (Sydney)', value: 'amazon:au:sydney', flag: AU },
  { label: 'Asia Pacific (Tokyo)', value: 'amazon:jp:tokyo', flag: JP },
  { label: 'Canada (Montreal)', value: 'amazon:ca:montreal', flag: CA },
  { label: 'Europe (Frankfurt)', value: 'amazon:de:frankfurt', flag: DE },
  { label: 'Europe (Ireland)', value: 'amazon:ie:dublin', flag: IE },
  { label: 'Europe (London)', value: 'amazon:gb:london', flag: GB },
  { label: 'Europe (Milan)', value: 'amazon:it:milan', flag: IT },
  { label: 'Europe (Paris)', value: 'amazon:fr:paris', flag: FR },
  { label: 'Europe (Stockholm)', value: 'amazon:se:stockholm', flag: SE },
  { label: 'Middle East (Bahrain)', value: 'amazon:bh:bahrain', flag: BH },
  {
    label: 'South America (São Paulo)',
    value: 'amazon:br:sao paulo',
    flag: BR,
  },
  { label: 'US West (N. California)', value: 'amazon:us:palo alto', flag: US },
  { label: 'US West (Oregon)', value: 'amazon:us:portland', flag: US },
  { label: 'US East (N. Virginia)', value: 'amazon:us:ashburn', flag: US },
]

export const LOAD_ZONES_REGIONS_OPTIONS = loadZoneOptionsMap.map(
  ({ label, flag: Flag, value }) => ({
    label: (
      <Flex align="center">
        <Flag
          css={css`
            margin-right: var(--space-2);
            width: 20px;
          `}
        />
        {label}
      </Flex>
    ),

    value,
  })
)

export const findUnusedLoadZone = (usedLoadZones: LoadZoneData['zones']) => {
  const usedLoadZonesNames = usedLoadZones.map((item) => item.loadZone)

  return (
    loadZoneOptionsMap.find(
      (option) => !usedLoadZonesNames.includes(option.value)
    )?.value ?? 'amazon:us:columbus'
  )
}

export const getRemainingPercentage = (loadZones: LoadZoneData['zones']) => {
  const totalPercentage = loadZones.reduce(
    (sum, { percent }) => sum + percent,
    0
  )

  return 100 - totalPercentage
}
