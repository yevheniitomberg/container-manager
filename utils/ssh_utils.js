const SSH_CLIENT = require("ssh2").Client
const SCP_CLIENT = require("node-scp").Client

class Server {
  constructor(serverObj) {
    this.username = serverObj.username
    this.password = serverObj.password
    this.port = serverObj.port
    this.host = serverObj.host
  }
}

function createSSHConnection(connectionParams, onError = () => {}) {
  const conn = new SSH_CLIENT()
  return new Promise((resolve, reject) => {
    conn
      .on("ready", () => {
        console.log("Connected to the remote server")
        resolve(conn)
      })
      .on("error", (err) => {
        onError()
      })
      .connect(connectionParams)
  })
}

const executeCommand = async (
  conn,
  command,
  successProcedure = (data) => {}
) => {
  conn.exec(command, (err, stream) => {
    if (err) throw err
    stream
      .on("data", (data) => successProcedure(data))
      .stderr.on("data", (data) => {
        console.log("STDERR: " + data)
      })
  })
}

function executeCommands(
  connection,
  commands,
  onError = (data) => {},
  ignoreError = false
) {
  let hasErrors = false
  return new Promise((resolve, reject) => {
    const output = []

    const executeNextCommand = () => {
      if (commands.length === 0 || hasErrors) {
        resolve(output.join("!delimeter!"))
        return
      }

      const command = commands.shift()
      connection.exec(command, (err, stream) => {
        if (err) {
          reject(err)
          return
        }

        let commandOutput = ""

        stream
          .on("data", (data) => {
            commandOutput += data.toString()
          })
          .on("close", (code, signal) => {
            output.push(commandOutput)
            executeNextCommand()
          })
          .stderr.on("data", (data) => {
            if (!ignoreError) {
              console.error(`Error for command '${command}': ${data}`)
              hasErrors = true
              onError(data)
            }
          })
      })
    }

    executeNextCommand()
  })
}

const copyFile = async (server, localPath, destinationPath, err = () => {}) => {
  try {
    const client = await SCP_CLIENT({ ...server })
    await client.uploadFile(
      localPath,
      `${destinationPath}/${localPath.split("/").pop()}`
    )
    client.close()
    return true
  } catch (e) {
    err(e)
    return false
  }
}

const copyDir = async (server, localPath, destinationPath, err = () => {}) => {
  try {
    const client = await SCP_CLIENT({ ...server })
    await client.uploadDir(
      localPath,
      `${destinationPath}/${localPath.split("/").pop()}`
    )
    client.close()
    return true
  } catch (e) {
    err(e)
    return false
  }
}

module.exports = {
  Server,
  executeCommand,
  createSSHConnection,
  executeCommands,
  copyDir,
  copyFile,
}
