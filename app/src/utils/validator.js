import generalStyles from "../styles/General.module.css"

//prettier-ignore
export const ValidatorDefaults = {
  EMAIL: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  ANY: /.+/,
  USERNAME: /^[a-zA-Z0-9]{8,16}$/,
  PASSWORD: /^.{8,35}$/,
  PORT: /^((6553[0-5])|(655[0-2][0-9])|(65[0-4][0-9]{2})|(6[0-4][0-9]{3})|([1-5][0-9]{4})|([0-5]{0,5})|([0-9]{1,4}))$/,
  HOST: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  DOMAIN: /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/,
  EMPTY_OR_ANY: /(^$|.+)/
}

export const validateForm = (payload, patterns) => {
  const validatedObject = {}
  Object.keys(payload).forEach((value) => {
    validatedObject[value] = patterns[value].test(payload[value])
  })
  return validatedObject
}

export const isValid = (validatedForm) => {
  return !Object.values(validatedForm).includes(false)
}

export const displayErrors = (validatedForm) => {
  Object.keys(validatedForm).forEach((key) => {
    if (!validatedForm[key]) {
      rejectField(key)
    }
  })
}

export const rejectField = (id) => {
  document.getElementById(id)?.classList.add(`${generalStyles.errorInput}`)
}

export const dismissField = (id) => {
  document.getElementById(id)?.classList.remove(`${generalStyles.errorInput}`)
}
