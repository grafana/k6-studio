import { spawnSignFile } from './src/utils/signing'

export default async function (filePath: string): Promise<void> {
  return spawnSignFile(filePath)
}
