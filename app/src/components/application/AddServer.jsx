import React, { useState } from "react"
import generalStyles from "../../styles/General.module.css"
import {
  ValidatorDefaults,
  displayErrors,
  isValid,
  validateForm,
} from "../../utils/validator"
import { Tooltip } from "react-tooltip"
import { messages } from "../../utils/message"
import { useDispatch, useSelector } from "react-redux"
import { setLoading } from "../../redux/services/dataService"
import Modal from "react-modal"
import { modalStyles } from "../../styles/styles"
import { handleChange } from "../../utils/shared_funcs"
import { addServerData } from "../../utils/dev_data"

function AddServer({ notify, modalOpened, setModalOpened }) {
  const renderer = window.renderer
  const loading = useSelector((state) => state.data.loading)
  const dispatch = useDispatch()
  const [payload, setPayload] = useState(
    addServerData(process.env.NODE_ENV === "development")
  )

  const getValidatedObject = () => {
    return validateForm(payload, {
      username: ValidatorDefaults.ANY,
      password: ValidatorDefaults.ANY,
      port: ValidatorDefaults.PORT,
      host: ValidatorDefaults.HOST,
    })
  }

  const addServer = () => {
    const validatedObject = getValidatedObject()
    if (isValid(validatedObject)) {
      dispatch(setLoading(true))
      notify()
      renderer.send("addServer", payload)
    } else {
      displayErrors(validatedObject)
    }
  }

  return (
    <Modal isOpen={modalOpened} style={modalStyles}>
      <div className="modal-header">
        <h4 className="modal-title">Add Server</h4>
      </div>
      <div className="modal-body">
        <form>
          <div className="form-group">
            <label htmlFor="host">Host:</label>
            <input
              type="text"
              className="form-control"
              id="host"
              name="host"
              value="185.233.38.16"
              onChange={(e) => handleChange(e, payload, setPayload)}
            />
            <Tooltip
              className="tooltip"
              anchorSelect="#host"
              content={messages.addServer.host}
            />
          </div>
          <div className="form-group">
            <label htmlFor="port">Port:</label>
            <input
              type="text"
              className="form-control"
              id="port"
              name="port"
              value={22}
              onChange={(e) => handleChange(e, payload, setPayload)}
            />
            <Tooltip
              className="tooltip"
              anchorSelect="#port"
              content={messages.addServer.port}
            />
          </div>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              className="form-control"
              id="username"
              name="username"
              value="root"
              onChange={(e) => handleChange(e, payload, setPayload)}
            />
            <Tooltip
              anchorSelect="#username"
              content={messages.addServer.username}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value="Tribunalow.228"
              onChange={(e) => handleChange(e, payload, setPayload)}
            />
          </div>
          <button
            onClick={(e) => {
              e.preventDefault()
              addServer()
            }}
            className="btn btn-primary mt-2"
            disabled={loading}
          >
            Add
          </button>
        </form>
      </div>
      <div className="modal-footer">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            setModalOpened(false)
          }}
        >
          Close
        </button>
      </div>
    </Modal>
  )
}

export default AddServer
