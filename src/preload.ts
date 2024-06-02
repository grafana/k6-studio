// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { ipcRenderer, contextBridge } from "electron";

const proxy = {
  launchProxy: () => {
    ipcRenderer.send('proxy:start');
  },
  onProxyStarted: (callback: () => void) => {
    ipcRenderer.on('proxy:started', () => {
      callback();
    });
  },
} as const;

const studio = {
  proxy: proxy,
} as const;

contextBridge.exposeInMainWorld('studio', studio);

export type Studio = typeof studio;
