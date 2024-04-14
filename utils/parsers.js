const parseDockerStringObjects = (objectsString) => {
  let dataSplit = `${objectsString}`.split("\n")
  let objects = []
  dataSplit.forEach((obj) => {
    if (obj) {
      objects.push(JSON.parse(obj))
    }
  })
  return objects
}

const listOfDomainRelatedToPort = (nginx_config_json) => {
  const list = []
  for (let file of nginx_config_json.config) {
    if (file?.file && file?.status === "ok" && file?.parsed) {
      const serverProps = file.parsed
      let server_name = ""
      let server_proxy = ""
      let has_ssl = ""
      for (let prop of serverProps) {
        if (prop.directive === "server") {
          for (let server of prop.block) {
            if (server.directive === "server_name") {
              let joined = server.args.join(" ")
              server_name = joined.includes("chat") ? "" : joined
            }
            if (server.directive === "location") {
              for (let location of server.block) {
                if (location.directive === "proxy_pass") {
                  server_proxy = location.args.join(" ").trim()
                }
              }
            }
            if (server.directive === "listen") {
              has_ssl = server.args.includes("443")
            }
          }
        }
      }
      if (server_name && server_proxy) {
        list.push({
          "domain": server_name,
          "proxy": server_proxy,
          "path": file.file,
          "ssl": has_ssl,
        })
      }
    }
  }

  return list
}

module.exports = {
  parseDockerStringObjects,
  listOfDomainRelatedToPort,
}
