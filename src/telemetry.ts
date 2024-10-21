import { v4 as uuidv4 } from 'uuid'
import { app } from 'electron'
import { getPlatform, getArch } from './utils/electron'
import { writeFile, readFile } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

const URL = 'https://stats.grafana.org/k6-studio-usage-report'
const filename = '.installation_id'
const filePath = path.join(app.getPath('userData'), filename)

// TODO: check settings to disable telemetry

export const getOrSetInstallationId = async () => {
  if (!existsSync(filePath)) {
    const id = uuidv4()
    await writeFile(filePath, id)
    return id
  }

  return await readFile(filePath, { encoding: 'utf-8' })
}

export const sendReport = async () => {
  if (process.env.NODE_ENV === 'development' || existsSync(filePath)) {
    // if we sent the report for this installation, do nothing
    return
  }

  const id = await getOrSetInstallationId()
  const data = {
    usageStatsId: id,
    timestamp: Date(),
    os: getPlatform(),
    arch: getArch(),
    version: app.getVersion(),
  }

  try {
    await fetch(URL, {
      method: 'post',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (e) {
    console.log('Error sending report', e)
  }
}
