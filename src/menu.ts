import { Menu, shell } from 'electron'

import { openLogFolder } from './logger'
import { getPlatform } from './utils/electron'

const isDevEnv = process.env.NODE_ENV === 'development'
const isMac = getPlatform() === 'mac'

// Custom application menu
// https://www.electronjs.org/docs/latest/api/menu
const template: Electron.MenuItemConstructorOptions[] = [
  ...getAppMenu(),
  { role: 'fileMenu' },
  { role: 'editMenu' },
  {
    label: 'View',
    submenu: [
      ...getDevToolsMenu(),
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
    ],
  },
  { role: 'windowMenu' },
  {
    role: 'help',
    submenu: [
      {
        label: 'Documentation',
        click: async () => {
          await shell.openExternal('https://grafana.com/docs/k6-studio/')
        },
      },
      {
        label: 'Report an issue',
        click: async () => {
          await shell.openExternal(
            'https://github.com/grafana/k6-studio/issues'
          )
        },
      },
      {
        label: 'Application logs',
        click: () => openLogFolder(),
      },
    ],
  },
]

function getAppMenu(): Electron.MenuItemConstructorOptions[] {
  return isMac ? [{ role: 'appMenu' }] : []
}

function getDevToolsMenu(): Electron.MenuItemConstructorOptions[] {
  return isDevEnv
    ? [{ role: 'reload' }, { role: 'forceReload' }, { role: 'toggleDevTools' }]
    : []
}

export function configureApplicationMenu() {
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
