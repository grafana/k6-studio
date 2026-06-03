import { K6_GENERATOR_FILE_EXTENSION } from '@/constants/files'
import { GENERATORS_PATH } from '@/constants/workspace'
import { trackEvent } from '@/services/usageTracking'
import { UsageEventName } from '@/services/usageTracking/types'
import { createFileWithUniqueName } from '@/utils/fs'
import { createNewGeneratorFile } from '@/utils/generator'
import * as path from '@/utils/path'

import { serializeGenerator } from './serialization'

export async function createGenerator(recordingPath?: string): Promise<string> {
  const generator = createNewGeneratorFile(recordingPath)

  const filePath = await createFileWithUniqueName({
    data: JSON.stringify(
      serializeGenerator(
        path.join(GENERATORS_PATH, `Generator${K6_GENERATOR_FILE_EXTENSION}`),
        generator
      ),
      null,
      2
    ),
    directory: GENERATORS_PATH,
    ext: K6_GENERATOR_FILE_EXTENSION,
    prefix: 'Generator',
  })

  trackEvent({ event: UsageEventName.GeneratorCreated })

  return filePath
}
