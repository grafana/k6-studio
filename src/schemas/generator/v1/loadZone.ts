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

export const LoadZoneIitemSchema = z.object({
  id: z.string(),
  loadZone: AvailableLoadZonesSchema,
  percent: z.number().int().min(1).max(100),
})

export const LoadZoneSchema = z.object({
  distribution: z.enum(['even', 'manual']),
  loadZones: z.array(LoadZoneIitemSchema).refine(
    (data) => {
      if (data.length === 0) {
        return true
      }

      const totalPercentage = data.reduce(
        (sum, { percent }) => sum + percent,
        0
      )
      return totalPercentage === 100
    },
    { message: 'The sum of all distribution percentages must be 100' }
  ),
})
