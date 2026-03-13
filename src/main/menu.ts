import { app, BrowserWindow, dialog, Menu, shell } from 'electron'
import log from 'electron-log/main'
import path from 'path'

import { AppHandler } from '../handlers/app/types'
import { reportNewIssue } from '../utils/bugReport'
import { getPlatform, sendToast } from '../utils/electron'

import { openLogFolder } from './logger'

const isDevEnv = process.env.NODE_ENV === 'development'
const isMac = getPlatform() === 'mac'

function getOpenRecentSubmenu(): Electron.MenuItemConstructorOptions[] {
  const recentPaths =
    typeof app.getRecentDocuments === 'function' ? app.getRecentDocuments() : []

  const items: Electron.MenuItemConstructorOptions[] = recentPaths.map(
    (filePath) => ({
      label: path.basename(filePath),
      click: (_menuItem, window) => {
        if (window instanceof BrowserWindow === false) {
          return
        }

        window.workspace.switch(filePath).catch((error) => {
          log.error(error)

          sendToast(window.webContents, {
            title: 'Failed to open workspace',
            status: 'error',
          })
        })
      },
    })
  )

  if (items.length > 0) {
    items.push({ type: 'separator' })
  }

  items.push({
    label: 'Clear Recently Opened',
    click: () => {
      app.clearRecentDocuments()
      refreshApplicationMenu()
    },
  })

  return items
}

function refreshApplicationMenu() {
  const menu = Menu.buildFromTemplate(getMenuTemplate())

  Menu.setApplicationMenu(menu)
}

// Custom application menu
// https://www.electronjs.org/docs/latest/api/menu
function getMenuTemplate(): Electron.MenuItemConstructorOptions[] {
  return [
    ...getAppMenu(),
    {
      role: 'fileMenu',
      submenu: [
        {
          label: 'New',
          submenu: [
            {
              label: 'Recording',
              click: (_menuItem, browserWindow) => {
                if (browserWindow instanceof BrowserWindow === false) {
                  return
                }

                browserWindow.webContents.send(AppHandler.DeepLink, '/recorder')
              },
            },
            {
              label: 'HTTP test',
              click: (_menuItem, browserWindow) => {
                if (browserWindow instanceof BrowserWindow === false) {
                  return
                }

                browserWindow.webContents.send(
                  AppHandler.DeepLink,
                  '/new/generator'
                )
              },
            },
            {
              label: 'Browser test',
              click: (_menuItem, browserWindow) => {
                if (browserWindow instanceof BrowserWindow === false) {
                  return
                }

                browserWindow.webContents.send(
                  AppHandler.DeepLink,
                  '/new/browser-test'
                )
              },
            },
          ],
        },
        { type: 'separator' },
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

            browserWindow.workspace.switch(selectedPath).catch((error) => {
              log.error(error)

              sendToast(browserWindow.webContents, {
                title: 'Failed to open workspace',
                status: 'error',
              })
            })
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
        {
          label: 'Open Recent',
          submenu: getOpenRecentSubmenu(),
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
}

function getAppMenu(): Electron.MenuItemConstructorOptions[] {
  return isMac ? [{ role: 'appMenu' }] : []
}

function getDevToolsMenu(): Electron.MenuItemConstructorOptions[] {
  return isDevEnv
    ? [{ role: 'reload' }, { role: 'forceReload' }, { role: 'toggleDevTools' }]
    : []
}

export function configureApplicationMenu() {
  refreshApplicationMenu()
}

export function addToRecentDocuments(filePath: string) {
  app.addRecentDocument(filePath)

  refreshApplicationMenu()
}
