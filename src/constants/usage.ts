import { app } from 'electron'
import * as path from 'pathe'

export const TRACKING_URL = 'https://stats.grafana.org/k6-studio-usage-report'
export const INSTALLATION_ID_FILE = path.join(
  app.getPath('userData'),
  '.installation_id'
)
