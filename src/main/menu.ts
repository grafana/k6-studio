import { Menu } from 'electron'

import { getPlatform } from '../utils/electron'

export function configureApplicationMenu() {
  const isMac = getPlatform() === 'mac'
  const menu = Menu.buildFromTemplate(isMac ? [{ role: 'appMenu' }] : [])
  Menu.setApplicationMenu(menu)
}
