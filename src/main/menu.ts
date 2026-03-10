import { BrowserWindow, dialog, Menu, shell } from 'electron'

import { AppHandler } from '../handlers/app/types'
import { reportNewIssue } from '../utils/bugReport'
import { getPlatform } from '../utils/electron'

import { openLogFolder } from './logger'

const isDevEnv = process.env.NODE_ENV === 'development'
const isMac = getPlatform() === 'mac'

// Custom application menu
// https://www.electronjs.org/docs/latest/api/menu
const template: Electron.MenuItemConstructorOptions[] = [
  ...getAppMenu(),
  {
    role: 'fileMenu',
    submenu: [
      {
        label: 'Open workspace...',
        click: async (_menuItem, browserWindow) => {
          if (browserWindow instanceof BrowserWindow === false) {
            return
          }

          const {
            filePaths: [selectedPath],
          } = await dialog.showOpenDialog(browserWindow, {
            properties: ['openDirectory'],
            title: 'Open workspace',
          })

          if (selectedPath === undefined) {
            return
          }

          browserWindow.workspace.switch(selectedPath)
        },
      },
      {
        label: 'Open file...',
        click: async (_menuItem, browserWindow) => {
          if (browserWindow instanceof BrowserWindow === false) {
            return
          }

          const {
            filePaths: [selectedPath],
          } = await dialog.showOpenDialog(browserWindow, {
            properties: ['openFile'],
            title: 'Open file',
          })

          if (selectedPath === undefined) {
            return
          }

          const route = `/file/${encodeURIComponent(selectedPath)}`
          browserWindow.webContents.send(AppHandler.DeepLink, route)
        },
      },
      { type: 'separator' },
      {
        label: 'Save',
        accelerator: isMac ? 'Cmd+S' : 'Ctrl+S',
        click: (_menuItem, browserWindow) => {
          if (browserWindow instanceof BrowserWindow === false) {
            return
          }

          browserWindow.webContents.send(AppHandler.SaveRequested)
        },
      },
      {
        label: 'Save As...',
        accelerator: isMac ? 'Cmd+Shift+S' : 'Ctrl+Shift+S',
        click: (_menuItem, browserWindow) => {
          if (browserWindow instanceof BrowserWindow === false) {
            return
          }

          browserWindow.webContents.send(AppHandler.SaveRequested, {
            saveAs: true,
          })
        },
      },
      { type: 'separator' },
      { role: 'close' },
    ],
  },
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
        click: reportNewIssue,
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
