import {
  BrowserWindow,
  Menu,
  MenuItemConstructorOptions,
  shell,
} from 'electron'

import { PROJECT_PATH } from '@/constants/workspace'
import { AppHandler } from '@/handlers/app/types'
import { createBrowserTest } from '@/handlers/browserTest/create'
import { createGenerator } from '@/handlers/generator/create'
import { UIHandler } from '@/handlers/ui/types'
import { getStudioFileFromPath } from '@/main/file'
import { getViewPath, routeMap } from '@/routeMap'
import { showOpenDialog } from '@/utils/dialog'
import * as path from '@/utils/path'
import {
  addRecentFile,
  clearRecentFiles,
  getRecentFiles,
} from '@/utils/recentFiles'

import { reportNewIssue } from '../utils/bugReport'
import { getPlatform } from '../utils/electron'

import { openLogFolder } from './logger'

const isDevEnv = process.env.NODE_ENV === 'development'
const isMac = getPlatform() === 'mac'

/**
 * Recursively walk through the menu template and make sure that the
 * state of each menu item is kept between rebuilds.
 */
function defineMenu(
  menu: MenuItemConstructorOptions[]
): MenuItemConstructorOptions[] {
  const currentMenu = Menu.getApplicationMenu()

  for (const item of menu) {
    if (item.id !== undefined) {
      item.enabled =
        currentMenu?.getMenuItemById(item.id)?.enabled ?? item.enabled
    }

    if (Array.isArray(item.submenu)) {
      item.submenu = defineMenu(item.submenu)
    }
  }

  return menu
}

function buildRecentFilesSubmenu(): Electron.MenuItemConstructorOptions[] {
  const recentFiles = getRecentFiles()

  if (recentFiles.length === 0) {
    return [{ label: 'No Recent Files', enabled: false }]
  }

  return [
    ...recentFiles.map(
      (filePath): Electron.MenuItemConstructorOptions => ({
        label: path.basename(filePath),
        click: (_, window) => {
          if (window instanceof BrowserWindow === false) {
            return
          }

          const file = getStudioFileFromPath(filePath)

          if (!file) {
            return
          }

          addRecentFile(filePath)
          configureApplicationMenu()

          window.webContents.send(
            AppHandler.Navigate,
            getViewPath(file.type, file.path)
          )
        },
      })
    ),
    { type: 'separator' },
    {
      label: 'Clear Menu',
      click: () => {
        clearRecentFiles()
        configureApplicationMenu()
      },
    },
  ]
}

// Custom application menu
// https://www.electronjs.org/docs/latest/api/menu
function buildTemplate(): Electron.MenuItemConstructorOptions[] {
  return defineMenu([
    ...getAppMenu(),
    {
      label: 'File',
      submenu: [
        {
          label: 'New',
          submenu: [
            {
              label: 'Recording',
              click: (_, window) => {
                if (window instanceof BrowserWindow === false) {
                  return
                }

                window.webContents.send(AppHandler.Navigate, routeMap.recorder)
              },
            },
            {
              label: 'HTTP test',
              click: async (_, window) => {
                if (window instanceof BrowserWindow === false) {
                  return
                }

                const filePath = await createGenerator()

                window.webContents.send(
                  AppHandler.Navigate,
                  getViewPath('generator', filePath)
                )
              },
            },
            {
              label: 'Browser test',
              click: async (_, window) => {
                if (window instanceof BrowserWindow === false) {
                  return
                }

                const filePath = await createBrowserTest()

                window.webContents.send(
                  AppHandler.Navigate,
                  getViewPath('browser-test', filePath)
                )
              },
            },
          ],
        },
        { type: 'separator' },
        {
          label: 'Open...',
          accelerator: 'CmdOrCtrl+O',
          click: async (_, window) => {
            if (window instanceof BrowserWindow === false) {
              return
            }

            const {
              filePaths: [filePath],
            } = await showOpenDialog(window, {
              defaultPath: PROJECT_PATH,
              properties: ['openFile'],
            })

            if (!filePath) {
              return
            }

            const file = getStudioFileFromPath(filePath)

            if (!file) {
              return
            }

            addRecentFile(filePath)
            configureApplicationMenu()

            window.webContents.send(
              AppHandler.Navigate,
              getViewPath(file.type, file.path)
            )
          },
        },
        {
          label: 'Open Recent',
          submenu: buildRecentFilesSubmenu(),
        },
        { type: 'separator' },
        {
          id: 'save',
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          enabled: false,
          click: (menuItem, window) => {
            if (window instanceof BrowserWindow === false) {
              return
            }

            window.webContents.send(UIHandler.RequestSave, {
              menuItem: menuItem.id,
              saveAs: false,
            })
          },
        },
        {
          id: 'save-as',
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          enabled: false,
          click: (menuItem, window) => {
            if (window instanceof BrowserWindow === false) {
              return
            }

            window.webContents.send(UIHandler.RequestSave, {
              menuItem: menuItem.id,
              saveAs: true,
            })
          },
        },
        { type: 'separator' },
        {
          label: 'Export...',
          submenu: [
            {
              id: 'export-script',
              label: 'Script',
              enabled: false,
              click: (menuItem, window) => {
                if (window instanceof BrowserWindow === false) {
                  return
                }

                window.webContents.send(UIHandler.RequestSave, {
                  menuItem: menuItem.id,
                  saveAs: false,
                })
              },
            },
          ],
        },
        { type: 'separator' },
        getCloseMenuItem(),
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
  ])
}

function getAppMenu(): Electron.MenuItemConstructorOptions[] {
  return isMac ? [{ role: 'appMenu' }] : []
}

function getCloseMenuItem(): Electron.MenuItemConstructorOptions {
  return isMac ? { role: 'close' } : { role: 'quit' }
}

function getDevToolsMenu(): Electron.MenuItemConstructorOptions[] {
  return isDevEnv
    ? [{ role: 'reload' }, { role: 'forceReload' }, { role: 'toggleDevTools' }]
    : []
}

export function configureApplicationMenu() {
  const menu = Menu.buildFromTemplate(buildTemplate())
  Menu.setApplicationMenu(menu)
}
