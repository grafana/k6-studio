import { app } from 'electron'
import { getPlatform, getArch } from './utils/electron'
import { writeFile, readFile } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'
import { UsageReportSettings } from './types/settings'
import log from 'electron-log/main'

const URL = 'https://stats.grafana.org/k6-studio-usage-report'
const filename = '.installation_id'
const filePath = path.join(app.getPath('userData'), filename)

export const getOrSetInstallationId = async () => {
  if (!existsSync(filePath)) {
    const id = self.crypto.randomUUID()
    await writeFile(filePath, id)
    return id
  }

  return await readFile(filePath, { encoding: 'utf-8' })
}

export const sendReport = async (usageReportSettings: UsageReportSettings) => {
  if (!usageReportSettings.enabled) {
    return
  }

  if (process.env.NODE_ENV === 'development' || existsSync(filePath)) {
    // if we sent the report for this installation, do nothing
    return
  }

  // Update the Usage Report section in README when changing what data is being sent
  // https://github.com/grafana/k6-studio/blob/main/README.md#usage-report
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
    log.error(e)
  }
}