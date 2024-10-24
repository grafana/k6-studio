import { Menu, shell } from 'electron'

const isDevEnv = process.env.NODE_ENV === 'development'

// Custom application menu
// https://www.electronjs.org/docs/latest/api/menu
const template: Electron.MenuItemConstructorOptions[] = [
  { role: 'appMenu' },
  { role: 'fileMenu' },
  { role: 'editMenu' },
  {
    // { role: 'viewMenu' }
    label: 'View',
    submenu: [
      ...(isDevEnv
        ? ([
            { role: 'reload' },
            { role: 'forceReload' },
            { role: 'toggleDevTools' },
          ] as Electron.MenuItemConstructorOptions[])
        : []),
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
        label: 'Report an issue',
        click: async () => {
          await shell.openExternal(
            'https://github.com/grafana/k6-studio/issues'
          )
        },
      },
    ],
  },
]

export function configureApplicationMenu() {
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
