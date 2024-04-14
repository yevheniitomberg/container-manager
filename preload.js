const { contextBridge, ipcRenderer } = require("electron")
const os = require("os")

contextBridge.exposeInMainWorld("electron", {
  homeDir: () => os.homedir(),
})

contextBridge.exposeInMainWorld("renderer", {
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, callback) => {
    if (ipcRenderer.eventNames().includes(channel)) {
      ipcRenderer.removeAllListeners(channel)
    }
    ipcRenderer.on(channel, (event, ...args) => callback(...args))
  },
})
