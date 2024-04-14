import React, { useState } from "react"
import Modal from "react-modal"
import { modalStyles } from "../../styles/styles"
import {
  ValidatorDefaults,
  displayErrors,
  isValid,
  rejectField,
  validateForm,
} from "../../utils/validator"
import { Tooltip } from "react-tooltip"
import { handleChange } from "../../utils/shared_funcs"
import { useSelector } from "react-redux"

function CreateConfig({ opened, setOpened, update, notify }) {
  const renderer = window.renderer
  const nginx_config = useSelector((state) => state.data.nginx_config)
  const connectedServer = useSelector((state) => state.data.connectedServer)
  const [payload, setPayload] = useState({
    port: null,
    domain: "",
    cert: false,
  })

  const getValidatedObject = () => {
    return validateForm(payload, {
      port: ValidatorDefaults.PORT,
      domain: ValidatorDefaults.DOMAIN,
      cert: ValidatorDefaults.ANY,
    })
  }

  const checkPortExists = (port) => {
    let exist = false
    nginx_config.forEach((config) => {
      if (config.proxy.split(":")[2].trim() === `${port}`) {
        exist = true
      }
    })
    return exist
  }

  const checkDomainExists = (domain) => {
    let exist = false
    nginx_config.forEach((config) => {
      if (config.domain === domain) {
        exist = true
      }
    })
    return exist
  }

  const createConfig = () => {
    notify()
    const validatedObject = getValidatedObject()
    if (checkPortExists(payload.port)) {
      update("Port already in use!", "error")
      rejectField("port")
    } else if (checkDomainExists(payload.domain)) {
      update("Domain already in use!", "error")
      rejectField("domain")
    } else if (isValid(validatedObject)) {
      renderer.send("nginx:create_config", {
        payload: payload,
        server: connectedServer,
      })
    } else {
      displayErrors(validatedObject)
      update("Check your input values!", "error")
    }
  }

  return (
    <Modal isOpen={opened} style={modalStyles}>
      <div className="container">
        <h3>Create Config</h3>
        <form>
          <div className="form-group">
            <label htmlFor="containerName">Domain</label>
            <input
              onChange={(e) => handleChange(e, payload, setPayload)}
              type="text"
              className="form-control"
              id="domain"
              name="domain"
              placeholder="Enter domain"
            />
          </div>
          <div className="form-group">
            <label htmlFor="port">Proxy Localhost Port</label>
            <input
              value={payload.vmPort}
              onChange={(e) => handleChange(e, payload, setPayload)}
              type="number"
              className="form-control"
              id="port"
              name="port"
            />
            <Tooltip
              className="tooltip"
              anchorSelect="#port"
              content={"1024-49151"}
            />
          </div>
          <div className="form-check mt-2">
            <input
              onChange={(e) => handleChange(e, payload, setPayload)}
              type="checkbox"
              className="form-check-input"
              id="cert"
              name="cert"
            />
            <label htmlFor="cert">Request SSL</label>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault()
              createConfig()
            }}
            className="btn btn-success mt-2"
          >
            Create
          </button>
          <button
            onClick={(e) => {
              e.preventDefault()
              setOpened(false)
            }}
            className="btn btn-primary mt-2 mx-2"
          >
            Close
          </button>
        </form>
      </div>
    </Modal>
  )
}

export default CreateConfig
