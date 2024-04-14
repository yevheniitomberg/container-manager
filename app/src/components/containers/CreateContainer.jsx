import React, { useEffect, useState } from "react"
import Modal from "react-modal"
import { modalStyles } from "../../styles/styles"
import { useSelector } from "react-redux"
import { messages } from "../../utils/message"
import { handleChange } from "../../utils/shared_funcs"
import {
  ValidatorDefaults,
  displayErrors,
  isValid,
  validateForm,
} from "../../utils/validator"
import { Tooltip } from "react-tooltip"

function CreateContainer({ opened, setOpened, data, update, notify }) {
  const renderer = window.renderer
  const containers = useSelector((state) => state.data.containers)
  const [payload, setPayload] = useState({})

  const getValidatedObject = () => {
    return validateForm(payload, {
      vmPort: ValidatorDefaults.PORT,
      hostPort: ValidatorDefaults.PORT,
      containerName: ValidatorDefaults.ANY,
      imageName: ValidatorDefaults.ANY,
      network: ValidatorDefaults.ANY,
    })
  }

  const emptyOption = () => {
    return <option></option>
  }

  const checkContainerNameExists = (name) => {
    let exist = false
    containers.forEach((container) => {
      if (container.containerName === name) {
        exist = true
      }
    })
    return exist
  }

  useEffect(() => {
    setPayload({
      vmPort: 2222,
      hostPort: 2222,
      containerName: "",
      imageName: "",
      network: "",
    })
  }, [opened])

  const createContainer = () => {
    notify()
    const validatedObject = getValidatedObject()
    if (checkContainerNameExists(payload.containerName)) {
      update(messages.container.exist, "error")
    } else if (!isValid(validatedObject)) {
      displayErrors(validatedObject)
      update("Check your input values!", "error")
    } else {
      renderer.send("container:create:procced", payload)
    }
  }

  return (
    <Modal isOpen={opened} style={modalStyles}>
      <div className="container">
        <h2>Create Container</h2>
        <form>
          <div className="form-group">
            <label htmlFor="network">Network</label>
            <select
              className="form-control"
              id="network"
              name="network"
              onChange={(e) => handleChange(e, payload, setPayload)}
            >
              {emptyOption()}
              {data?.networks?.map((network, idx) => {
                return (
                  <option key={idx} value={network.networkId}>
                    {network.name}
                  </option>
                )
              })}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="containerName">Container Name</label>
            <input
              onChange={(e) => handleChange(e, payload, setPayload)}
              type="text"
              className="form-control"
              id="containerName"
              name="containerName"
              placeholder="Enter container name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="hostPort">Host Port</label>
            <input
              onChange={(e) => handleChange(e, payload, setPayload)}
              type="number"
              className="form-control"
              value={payload.hostPort}
              id="hostPort"
              name="hostPort"
            />
            <Tooltip
              className="tooltip"
              anchorSelect="#hostPort"
              content={"1024-49151"}
            />
          </div>

          <div className="form-group">
            <label htmlFor="vmPort">VM Port</label>
            <input
              value={payload.vmPort}
              onChange={(e) => handleChange(e, payload, setPayload)}
              type="number"
              className="form-control"
              id="vmPort"
              name="vmPort"
            />
            <Tooltip
              className="tooltip"
              anchorSelect="#vmPort"
              content={"1024-49151"}
            />
          </div>

          <div className="form-group">
            <label htmlFor="imageName">Image Name</label>
            <select
              className="form-control"
              id="imageName"
              name="imageName"
              onChange={(e) => handleChange(e, payload, setPayload)}
            >
              {emptyOption()}
              {data?.images?.map((image, idx) => {
                return (
                  <option key={idx} value={image.imageName}>
                    {image.imageName}
                  </option>
                )
              })}
            </select>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault()
              createContainer()
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

export default CreateContainer
