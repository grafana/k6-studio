import { z } from 'zod'

export const AvailableLoadZonesSchema = z.enum([
  'amazon:us:columbus',
  'amazon:sa:cape town',
  'amazon:cn:hong kong',
  'amazon:in:mumbai',
  'amazon:jp:osaka',
  'amazon:kr:seoul',
  'amazon:sg:singapore',
  'amazon:au:sydney',
  'amazon:jp:tokyo',
  'amazon:ca:montreal',
  'amazon:de:frankfurt',
  'amazon:ie:dublin',
  'amazon:gb:london',
  'amazon:it:milan',
  'amazon:fr:paris',
  'amazon:se:stockholm',
  'amazon:bh:bahrain',
  'amazon:br:sao paulo',
  'amazon:us:palo alto',
  'amazon:us:portland',
  'amazon:us:ashburn',
])

export const LoadZoneItemSchema = z.object({
  id: z.string(),
  loadZone: AvailableLoadZonesSchema,
  percent: z
    .number({ message: 'Invalid percentage' })
    .int()
    .min(1, { message: 'Invalid percentage' })
    .max(100, { message: 'Invalid percentage' }),
})

export const LoadZoneSchema = z.object({
  distribution: z.enum(['even', 'manual']),
  zones: z.array(LoadZoneItemSchema).refine(
    (data) => {
      if (data.length === 0) {
        return true
      }

      const totalPercentage = currentLoadZonePercentage(data)
      return totalPercentage === 100
    },
    (data) => {
      const totalPercentage = currentLoadZonePercentage(data)
      return {
        message: `Total percentage must be 100 (currently ${totalPercentage})`,
        path: ['root'],
      }
    }
  ),
})

function currentLoadZonePercentage(data: { percent: number }[]) {
  return data.reduce((sum, { percent }) => sum + percent, 0)
}
