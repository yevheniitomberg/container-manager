import { dismissField } from "./validator"
import generalStyles from "../styles/General.module.css"

export const browseFolder = (renderer, inputName) => {
  renderer.send("browseFolder", { name: inputName })
  dismissField(inputName)
}

export const browseFile = (renderer, inputName) => {
  renderer.send("browseFile", { name: inputName })
  dismissField(inputName)
}

export const clearObject = (object) => {
  for (let key of Object.keys(object)) {
    object[key] = ""
  }
  return object
}

export const handleBrowseFolder = (renderer, payload, setPayload) => {
  renderer.on("browseFolder:success", (event, args) => {
    setPayload({ ...payload, [event.name]: event.path.replaceAll("\\", "/") })
  })
}

export const handleBrowseFile = (renderer, payload, setPayload) => {
  renderer.on("browseFile:success", (event, args) => {
    setPayload({ ...payload, [event.name]: event.path.replaceAll("\\", "/") })
  })
}

export const handleChange = (event, payload, setPayload) => {
  event.target.classList.remove(`${generalStyles.errorInput}`)
  if (event.target.type === "checkbox") {
    setPayload({ ...payload, [event.target.name]: event.target.checked })
    return
  }
  setPayload({ ...payload, [event.target.name]: event.target.value })
}
