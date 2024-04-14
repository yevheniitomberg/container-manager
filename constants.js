const BACKEND_HOST = "http://localhost:8100"
const PUBLIC_API = "/api/public"
const PRIVATE_API = "/api/private"
const CRUD_API = "/api/crud"
const PUBLIC_ENDPOINT = `${BACKEND_HOST}${PUBLIC_API}`
const PRIVATE_ENDPOINT = `${BACKEND_HOST}${PRIVATE_API}`
const CRUD_ENDPOINT = `${BACKEND_HOST}${CRUD_API}`
const PUBLIC_ENDPOINTS = {
  LOGIN: `${PUBLIC_ENDPOINT}/login`,
  REGISTER: `${PUBLIC_ENDPOINT}/register`,
}
const CRUD_ENDPOINTS = {
  SERVER: `${CRUD_ENDPOINT}/server`,
}

const COMMANDS = {
  DOCKER: {
    CONTAINER: {
      LIST: `docker ps -a --format '{"containerId":"{{ .ID }}", "imageName": "{{ .Image }}", "containerName":"{{ .Names }}", "ports":"{{ .Ports }}", "status":"{{ .Status }}"}'`,
      STOP: `docker container stop `,
      START: `docker container start `,
      RESTART: `docker restart `,
      REMOVE: `docker rm -f `,
      LOGS: `docker container logs `,
      CREATE: (data) =>
        `docker container create --network ${data.network} --name ${data.containerName} -p ${data.hostPort}:${data.vmPort} ${data.imageName}`,
    },
    IMAGE: {
      LIST: `docker image ls --format '{"imageName":"{{ .Repository }}", "tag": "{{ .Tag }}", "imageId": "{{ .ID }}"}'`,
      CREATE: (imageName, path) =>
        `docker build -t ${imageName} --progress=plain --no-cache "${path}"`,
    },
    NETWORK: {
      LIST: `docker network ls --format '{"networkId":"{{ .ID }}", "name": "{{ .Name }}", "driver": "{{ .Driver }}", "scope": "{{ .Scope }}"}'`,
    },
  },
  NETSTAT: {
    USED_PORTS: `netstat -tulpn | jc --netstat`,
  },
  GENERAL: {
    FOLDER_EXISTS: (path) => {
      return `[ -d "${path}" ] && echo "true" || echo "false"`
    },
  },
  NGINX: {
    CONFIG: "crossplane parse /etc/nginx/nginx.conf",
    READ_EXACT_CONFIG: (path) => `cat ${path}`,
    CREATE_CONFIG: (domain, port) =>
      `python3 /home/nginx_config.py ${domain} ${port}`,
    REQUEST_SSL: (domain) => `certbot --nginx -d ${domain}`,
  },
}

const arrayRange = (start, stop, exceptions = [], step = 1) => {
  const list = []
  for (let i = start; i < stop; i += step) {
    if (exceptions.includes(i)) {
      continue
    }
    list.push(i)
  }
  return list
}

module.exports = {
  BACKEND_HOST,
  PUBLIC_ENDPOINTS,
  CRUD_ENDPOINTS,
  COMMANDS,
  arrayRange,
}
