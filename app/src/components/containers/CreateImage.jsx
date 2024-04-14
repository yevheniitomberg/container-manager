import React, { useEffect, useState } from "react"
import Modal from "react-modal"
import { modalStyles } from "../../styles/styles"
import { useDispatch, useSelector } from "react-redux"
import { messages } from "../../utils/message"
import {
  ValidatorDefaults,
  displayErrors,
  isValid,
  rejectField,
  validateForm,
} from "../../utils/validator"
import { Tooltip } from "react-tooltip"
import { PROJECT_TYPES, SUPPORTED_BUILD_TYPES } from "../../utils/form_data"
import {
  browseFile,
  browseFolder,
  clearObject,
  handleBrowseFile,
  handleBrowseFolder,
  handleChange,
} from "../../utils/shared_funcs"
import { setFolderExist } from "../../redux/services/dataService"

function CreateImage({ opened, setOpened, update, notify }) {
  const renderer = window.renderer
  const containers = useSelector((state) => state.data.containers)
  const images = useSelector((state) => state.data.images)
  const server = useSelector((state) => state.data.connectedServer)
  const folderExist = useSelector((state) => state.data.folderExist)
  const dispatch = useDispatch()
  const [payload, setPayload] = useState({
    projectType: "",
    buildType: "",
    buildPath: "",
    dockerfile: "",
    imageName: "",
    linuxHome: "",
  })

  const getValidatedObject = () => {
    return validateForm(payload, {
      projectType: ValidatorDefaults.ANY,
      buildType:
        payload.projectType == "java"
          ? ValidatorDefaults.ANY
          : ValidatorDefaults.EMPTY_OR_ANY,
      buildPath: ValidatorDefaults.ANY,
      dockerfile: ValidatorDefaults.ANY,
      imageName: ValidatorDefaults.ANY,
      linuxHome: ValidatorDefaults.ANY,
    })
  }

  const emptyOption = () => {
    return <option value="">--Select--</option>
  }

  const handleChangeWithPath = (event) => {
    renderer.send("check:folder:exist", {
      path: event.target.value.replaceAll("\\", ""),
    })
    handleChange(event, payload, setPayload)
  }

  const createImage = () => {
    notify()
    const validatedObject = getValidatedObject()
    if (images.includes(payload.imageName)) {
      update(messages.image.exist, "error")
      rejectField("imageName")
    } else if (!isValid(validatedObject)) {
      displayErrors(validatedObject)
      update("Check your input values!", "error")
    } else if (!folderExist) {
      update(messages.folder.not_exists, "error")
      rejectField("linuxHome")
    } else {
      renderer.send("image:create:procced", {
        imageData: payload,
        server: server,
      })
    }
  }

  useEffect(() => {
    handleBrowseFolder(renderer, payload, setPayload)
    handleBrowseFile(renderer, payload, setPayload)
    renderer.on("check:folder:exist:result", (event, args) => {
      dispatch(setFolderExist(event.exist))
    })
    if (!opened) {
      setPayload(clearObject(payload))
    }
  }, [opened, payload, renderer])
  return (
    <>
      <Tooltip
        className="tooltip"
        anchorSelect="#buildPath"
        content={payload.buildPath}
      />
      <Tooltip
        className="tooltip"
        anchorSelect="#dockerfile"
        content={payload.dockerfile}
      />
      <Modal isOpen={opened} style={modalStyles}>
        <div className="container">
          <h3>Build Configuration</h3>
          <form>
            <div className="mb-3">
              <label htmlFor="imageName" className="form-label">
                Image Name
              </label>
              <input
                type="text"
                className="form-control"
                id="imageName"
                value={payload.imageName}
                onChange={(e) => handleChange(e, payload, setPayload)}
                name="imageName"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="projectType" className="form-label">
                Project Type
              </label>
              <select
                className="form-select"
                value={payload.projectType}
                onChange={(e) => handleChange(e, payload, setPayload)}
                id="projectType"
                name="projectType"
              >
                {emptyOption()}
                {PROJECT_TYPES.map((type, idx) => {
                  return (
                    <option key={idx} value={type.value}>
                      {type.name}
                    </option>
                  )
                })}
              </select>
            </div>
            <hr />
            {payload?.projectType === "java" && (
              <>
                <div className="mb-3">
                  <label htmlFor="buildType" className="form-label">
                    Build Type
                  </label>
                  <select
                    className="form-select"
                    value={payload.buildType}
                    onChange={(e) => handleChange(e, payload, setPayload)}
                    id="buildType"
                    name="buildType"
                  >
                    {emptyOption()}
                    {SUPPORTED_BUILD_TYPES.map((type, idx) => {
                      return (
                        <option key={idx} value={type.value}>
                          {type.name}
                        </option>
                      )
                    })}
                  </select>
                </div>
                {!!payload.buildType && (
                  <>
                    <div className="input-group mb-3">
                      <div className="input-group-prepend">
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={(e) => browseFolder(renderer, "buildPath")}
                        >
                          Browse
                        </button>
                      </div>
                      <input
                        type="text"
                        className="form-control"
                        id="buildPath"
                        value={payload.buildPath}
                        readOnly
                        name="buildPath"
                        onChange={(e) => handleChange(e, payload, setPayload)}
                        //prettier-ignore
                        placeholder={`Path to ${payload.buildType === "gradle" ? "Build" : "Target"} Folder`}
                        aria-label=""
                        aria-describedby="basic-addon1"
                      />
                    </div>
                    <div className="input-group mb-3">
                      <div className="input-group-prepend">
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={(e) => browseFile(renderer, "dockerfile")}
                        >
                          Browse
                        </button>
                      </div>
                      <input
                        type="text"
                        className="form-control"
                        id="dockerfile"
                        onChange={(e) => handleChange(e, payload, setPayload)}
                        value={payload.dockerfile}
                        readOnly
                        name="dockerfile"
                        placeholder="Dockerfile Path"
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="linuxHome" className="form-label">
                        Target Linux Machine Folder
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="linuxHome"
                        onChange={handleChangeWithPath}
                        value={payload.linuxHome}
                        name="linuxHome"
                        placeholder="/path/to/appHome"
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {payload?.projectType === "react" && (
              <>
                <>
                  <div className="input-group mb-3">
                    <div className="input-group-prepend">
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={(e) => browseFolder(renderer, "buildPath")}
                      >
                        Browse
                      </button>
                    </div>
                    <input
                      type="text"
                      className="form-control"
                      id="buildPath"
                      value={payload.buildPath}
                      readOnly
                      name="buildPath"
                      onChange={(e) => handleChange(e, payload, setPayload)}
                      //prettier-ignore
                      placeholder={`Path to Build Folder`}
                      aria-label=""
                      aria-describedby="basic-addon1"
                    />
                  </div>
                  <div className="input-group mb-3">
                    <div className="input-group-prepend">
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={(e) => browseFile(renderer, "dockerfile")}
                      >
                        Browse
                      </button>
                    </div>
                    <input
                      type="text"
                      className="form-control"
                      id="dockerfile"
                      onChange={(e) => handleChange(e, payload, setPayload)}
                      value={payload.dockerfile}
                      readOnly
                      name="dockerfile"
                      placeholder="Dockerfile Path"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="linuxHome" className="form-label">
                      Target Linux Machine Folder
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="linuxHome"
                      onChange={handleChangeWithPath}
                      value={payload.linuxHome}
                      name="linuxHome"
                      placeholder="/path/to/appHome"
                    />
                  </div>
                </>
              </>
            )}

            <button
              type="submit"
              onClick={(e) => {
                e.preventDefault()
                createImage()
              }}
              className="btn btn-primary"
            >
              Submit
            </button>
            <button
              className="btn btn-primary mx-2"
              onClick={(e) => {
                e.preventDefault()
                setOpened(false)
              }}
            >
              Close
            </button>
          </form>
        </div>
      </Modal>
    </>
  )
}

export default CreateImage
