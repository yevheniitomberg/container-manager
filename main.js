const { default: axios } = require("axios")
const {
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  dialog,
} = require("electron")
const path = require("path")
const constants = require("./constants.js")
const Store = require("./store.js")
const prompt = require("electron-prompt")
const {
  Server,
  createSSHConnection,
  executeCommands,
  copyFile,
  copyDir,
} = require("./utils/ssh_utils.js")
const {
  parseDockerStringObjects,
  listOfDomainRelatedToPort,
} = require("./utils/parsers.js")

const store = new Store({
  configName: "user-data",
  defaults: {},
})

var ssh2_conn = null

var mainWindow

function closeConnection() {
  ssh2_conn?.end()
  ssh2_conn = null
}

function handleSSHError(data) {
  dialog.showErrorBox("Command Execution Error", data.toString())
  mainWindow.webContents.send("general:error", {})
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "Electron",
    width: 1000,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, "./preload.js"),
    },
  })

  mainWindow.webContents.openDevTools()

  const isDev = app.isPackaged ? false : require("electron-is-dev")

  const startURL = isDev
    ? "http://localhost:3000"
    : `file://${path.join(__dirname, "./app/build/index.html")}`

  mainWindow.loadURL(startURL)
}

app.whenReady().then(createMainWindow)
app.on("browser-window-focus", function () {
  globalShortcut.register("CommandOrControl+R", () => {})
  globalShortcut.register("F5", () => {})
})
app.on("browser-window-blur", function () {
  globalShortcut.unregister("CommandOrControl+R")
  globalShortcut.unregister("F5")
})

const handleAxiosError = (error) => {
  console.log(error.message)
  if (error.response.status === 401) {
    mainWindow.webContents.send("auth:unauthorized", {})
    closeConnection()
    dialog.showMessageBox(mainWindow, {
      title: "Unauthorized!",
      message: error.response.data.messages.join("\n"),
      type: "info",
    })
  }
}

ipcMain.on("login", (event, args) => {
  axios
    .post(constants.PUBLIC_ENDPOINTS.LOGIN, { ...args })
    .then((response) => {
      const data = response.data
      if (!data.error) {
        store.set("token", data.data.token)
        axios.defaults.headers.common["Authorization"] = `Bearer ${store.get(
          "token"
        )}`
        mainWindow.webContents.send("login:success", {
          userData: data.data.user,
        })
      } else {
        mainWindow.webContents.send("login:fail", {
          messages: data.messages,
        })
      }
    })
    .catch((error) => handleAxiosError(error))
})

ipcMain.on("register", (event, args) => {
  axios
    .post(constants.PUBLIC_ENDPOINTS.REGISTER, { ...args })
    .then((response) => {
      const data = response.data
      if (!data.error) {
        mainWindow.webContents.send("register:success", {
          message: data.message,
        })
      } else {
        mainWindow.webContents.send("register:fail", {
          messages: data.messages,
        })
      }
    })
    .catch((error) => handleAxiosError(error))
})

ipcMain.on("addServer", (event, args) => {
  axios
    .post(constants.CRUD_ENDPOINTS.SERVER, { ...args })
    .then((response) => {
      const data = response.data
      if (!data.error) {
        mainWindow.webContents.send("addServer:success", {
          message: data.message,
          userData: data.data.user,
        })
      } else {
        mainWindow.webContents.send("addServer:fail", {
          messages: data.messages,
        })
      }
    })
    .catch((error) => handleAxiosError(error))
})

ipcMain.on("server:remove", (event, args) => {
  axios
    .delete(`${constants.CRUD_ENDPOINTS.SERVER}/${args.id}`)
    .then((response) => {
      mainWindow.webContents.send("server:removed", {
        message: response.data.message,
        userData: response.data.data.user,
      })
    })
    .catch((error) => handleAxiosError(error))
})

ipcMain.on("server:update", async (event, args) => {
  const output = await executeCommands(ssh2_conn, [
    constants.COMMANDS.DOCKER.CONTAINER.LIST,
    constants.COMMANDS.NGINX.CONFIG,
  ])
  const dataList = output.split("!delimeter!")
  mainWindow.webContents.send("server:update:success", {
    containers: parseDockerStringObjects(dataList[0]),
    nginx_config: listOfDomainRelatedToPort(JSON.parse(dataList[1])),
  })
})

ipcMain.on("server:launch", async (event, args) => {
  if (ssh2_conn) {
    closeConnection()
  }
  axios
    .get(`${constants.CRUD_ENDPOINTS.SERVER}/${args.id}`, {
      ...args,
      params: {
        "passwd": await prompt({
          title: "Authorization",
          label: "Password to connect remote server",
          value: "Tribunalow.228",
          height: 200,
          inputAttrs: {
            type: "password",
          },
          type: "input",
        }).then((input) => (!!input ? input : "")),
      },
    })
    .then(async (response) => {
      ssh2_conn = await createSSHConnection(response.data, () => {
        mainWindow.webContents.send("server:launch:fail", {
          message: !!response.data.password
            ? "Bad credentials!"
            : "Launch aborted!",
        })
      })
      if (ssh2_conn) {
        const output = await executeCommands(ssh2_conn, [
          constants.COMMANDS.DOCKER.CONTAINER.LIST,
          constants.COMMANDS.NGINX.CONFIG,
        ])
        const dataList = output.split("!delimeter!")
        mainWindow.webContents.send("server:launch:success", {
          containers: parseDockerStringObjects(dataList[0]),
          server: new Server(response.data),
          nginx_config: listOfDomainRelatedToPort(JSON.parse(dataList[1])),
        })
      }
    })
    .catch((error) => handleAxiosError(error))
})

ipcMain.on("container:start", async (event, args) => {
  const commands = [
    constants.COMMANDS.DOCKER.CONTAINER.START + args.container.containerId,
    constants.COMMANDS.DOCKER.CONTAINER.LIST,
  ]
  const output = await executeCommands(ssh2_conn, commands, handleSSHError)
  const outputList = output.split("!delimeter!")
  let containers = []
  try {
    containers = parseDockerStringObjects(outputList[1])
    mainWindow.webContents.send("container:start:success", {
      containers: containers,
    })
  } catch (error) {}
})

ipcMain.on("container:restart", async (event, args) => {
  const commands = [
    constants.COMMANDS.DOCKER.CONTAINER.RESTART + args.container.containerId,
    constants.COMMANDS.DOCKER.CONTAINER.LIST,
  ]
  const output = await executeCommands(ssh2_conn, commands, handleSSHError)
  const outputList = output.split("!delimeter!")
  mainWindow.webContents.send("container:restart:success", {
    containers: parseDockerStringObjects(outputList[1]),
  })
})

ipcMain.on("container:remove", async (event, args) => {
  dialog
    .showMessageBox(mainWindow, {
      message: `Are you sure you want to remove container: ${args.container.containerName} (${args.container.containerId})`,
      buttons: ["Remove Container", "Cancel"],
    })
    .then(async (response) => {
      if (response.response === 0) {
        const commands = [
          constants.COMMANDS.DOCKER.CONTAINER.STOP + args.container.containerId,
          constants.COMMANDS.DOCKER.CONTAINER.REMOVE +
            args.container.containerId,
          constants.COMMANDS.DOCKER.CONTAINER.LIST,
        ]
        const output = await executeCommands(
          ssh2_conn,
          commands,
          handleSSHError
        )
        const outputList = output.split("!delimeter!")
        mainWindow.webContents.send("container:remove:success", {
          containers: parseDockerStringObjects(outputList[2]),
        })
      } else {
        mainWindow.webContents.send("container:remove:aborted", {
          message: "Container removing aborted!",
        })
      }
    })
})

ipcMain.on("container:logs", async (event, args) => {
  const output = await executeCommands(ssh2_conn, [
    constants.COMMANDS.DOCKER.CONTAINER.LOGS + args.container.containerId,
  ])
  const logs = output.split("\n").join("<br>")
  mainWindow.webContents.send("container:logs:display", {
    content: !!logs.trim()
      ? logs
      : "There is no logs available for this container yet!🤥",
  })
})

ipcMain.on("container:stop", async (event, args) => {
  const commands = [
    constants.COMMANDS.DOCKER.CONTAINER.STOP + args.container.containerId,
    constants.COMMANDS.DOCKER.CONTAINER.LIST,
  ]
  const output = await executeCommands(ssh2_conn, commands, handleSSHError)
  const outputList = output.split("!delimeter!")
  mainWindow.webContents.send("container:stop:success", {
    containers: parseDockerStringObjects(outputList[1]),
  })
})

ipcMain.on("container:create:prepare", async (event, args) => {
  const commands = [
    constants.COMMANDS.DOCKER.NETWORK.LIST,
    constants.COMMANDS.DOCKER.IMAGE.LIST,
  ]
  const output = await executeCommands(ssh2_conn, commands, handleSSHError)
  const outputList = output.split("!delimeter!")
  const networksJson = parseDockerStringObjects(outputList[0])
  const imagesJson = parseDockerStringObjects(outputList[1])
  mainWindow.webContents.send("container:create:preload", {
    networks: networksJson,
    images: imagesJson,
  })
})

ipcMain.on("data:image:list", async (event, args) => {
  const commands = [constants.COMMANDS.DOCKER.IMAGE.LIST]
  const output = await executeCommands(ssh2_conn, commands, handleSSHError)
  const imageList = []
  for (let image of parseDockerStringObjects(output)) {
    imageList.push(image.imageName)
  }
  mainWindow.webContents.send("data:image:list:success", {
    images: imageList,
  })
})

ipcMain.on("container:create:procced", async (event, args) => {
  const commands = [
    constants.COMMANDS.DOCKER.CONTAINER.CREATE(args),
    constants.COMMANDS.DOCKER.CONTAINER.LIST,
  ]
  const output = await executeCommands(ssh2_conn, commands, handleSSHError)
  const outputList = output.split("!delimeter!")
  const containers = parseDockerStringObjects(outputList[1])
  mainWindow.webContents.send("container:create:success", {
    containers: containers,
  })
})

ipcMain.on("image:create:procced", async (event, args) => {
  mainWindow.webContents.send("alert:update", {
    message: "Copying source files...",
  })
  await copyFile(
    args.server,
    args.imageData.dockerfile,
    args.imageData.linuxHome,
    (data) => {
      console.log(data.message)
    }
  )
  await copyDir(
    args.server,
    args.imageData.buildPath,
    args.imageData.linuxHome,
    (data) => {
      console.log(data.message)
    }
  )
  mainWindow.webContents.send("alert:update", {
    message: "Creating image...",
  })
  const dockerOutput = await executeCommands(
    ssh2_conn,
    [
      constants.COMMANDS.DOCKER.IMAGE.CREATE(
        args.imageData.imageName,
        args.imageData.linuxHome
      ),
    ],
    handleSSHError,
    true
  )
  console.log(dockerOutput)
  const output = await executeCommands(
    ssh2_conn,
    [constants.COMMANDS.DOCKER.IMAGE.LIST],
    handleSSHError
  )
  const images = parseDockerStringObjects(output)
  mainWindow.webContents.send("image:create:success", {
    images: images,
  })
})

ipcMain.on("browseFolder", async (event, args) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory"],
  })
  if (!result.canceled) {
    mainWindow.webContents.send("browseFolder:success", {
      path: result.filePaths[0],
      name: args.name,
    })
  }
})

ipcMain.on("browseFile", async (event, args) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
  })
  if (!result.canceled) {
    mainWindow.webContents.send("browseFile:success", {
      path: result.filePaths[0],
      name: args.name,
    })
  }
})

ipcMain.on("check:folder:exist", async (event, args) => {
  const output = await executeCommands(
    ssh2_conn,
    [constants.COMMANDS.GENERAL.FOLDER_EXISTS(args.path)],
    handleSSHError
  )
  mainWindow.webContents.send("check:folder:exist:result", {
    exist: output.trim() === "true",
  })
})

ipcMain.on("nginx:config:read_config", async (event, args) => {
  const output = await executeCommands(
    ssh2_conn,
    [constants.COMMANDS.NGINX.READ_EXACT_CONFIG(args.path)],
    handleSSHError
  )
  mainWindow.webContents.send("nginx:config:read_config:success", {
    content: output,
  })
})

ipcMain.on("nginx:create_config", async (event, args) => {
  mainWindow.webContents.send("alert:update", {
    message: "Copying files...",
  })
  await copyFile(args.server, "./python/nginx/nginx_config.py", "/home")
  mainWindow.webContents.send("alert:update", {
    message: "Creating Nginx configuration files...",
  })
  await executeCommands(
    ssh2_conn,
    [
      constants.COMMANDS.NGINX.CREATE_CONFIG(
        args.payload.domain,
        args.payload.port
      ),
    ],
    handleSSHError,
    true
  )
  if (args.payload.cert) {
    mainWindow.webContents.send("alert:update", {
      message: "Requesting SSL certificate...",
    })
    await executeCommands(
      ssh2_conn,
      [constants.COMMANDS.NGINX.REQUEST_SSL(args.payload.domain)],
      handleSSHError,
      true
    )
  }
  const output = await executeCommands(
    ssh2_conn,
    [constants.COMMANDS.NGINX.CONFIG],
    handleSSHError
  )
  mainWindow.webContents.send("nginx:create_config:success", {
    message: "Nginx configuration created successfully!🎉",
    nginx_config: listOfDomainRelatedToPort(JSON.parse(output)),
  })
})

ipcMain.on("logout", (event, args) => {
  store.set("token", "")
  closeConnection()
  mainWindow.webContents.send("logout:success")
})

ipcMain.on("test", async (event, args) => {
  const output = await executeCommands(
    ssh2_conn,
    [constants.COMMANDS.NGINX.CONFIG],
    handleSSHError
  )
})
