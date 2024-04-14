import React, { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import generalStyles from "../../styles/General.module.css"
import {
  ValidatorDefaults,
  displayErrors,
  isValid,
  validateForm,
} from "../../utils/validator"
import { Tooltip } from "react-tooltip"
import { messages } from "../../utils/message"
import ValidationErrorList from "../messaging/ErrorList"
import { handleChange } from "../../utils/shared_funcs"

function RegisterPage() {
  const renderer = window.renderer
  const [payload, setPayload] = useState({
    username: "",
    password: "",
    email: "",
  })
  const [errors, setErrors] = useState([])
  const navigate = useNavigate()

  const getValidatedObject = () => {
    return validateForm(payload, {
      username: ValidatorDefaults.USERNAME,
      password: ValidatorDefaults.PASSWORD,
      email: ValidatorDefaults.EMAIL,
    })
  }

  useEffect(() => {
    renderer.on("register:success", (event, args) => {
      navigate("/login", { state: { message: event.message } })
    })
    renderer.on("register:fail", (event, args) => {
      setErrors(event.messages)
    })
  }, [renderer, navigate])

  const register = (e) => {
    e.preventDefault()
    const validatedObject = getValidatedObject()
    isValid(validatedObject)
      ? renderer.send("register", payload)
      : displayErrors(validatedObject)
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h2 className="text-center">Registration</h2>
            </div>
            <div className="card-body">
              <form>
                <div className="form-group">
                  <ValidationErrorList errors={errors} />
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    name="username"
                    onChange={(e) => handleChange(e, payload, setPayload)}
                    required
                  />
                  <Tooltip
                    anchorSelect="#username"
                    content={messages.register.username}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    onChange={(e) => handleChange(e, payload, setPayload)}
                    required
                  />
                  <Tooltip
                    anchorSelect="#password"
                    content={messages.register.password}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    onChange={(e) => handleChange(e, payload, setPayload)}
                    required
                  />
                </div>
                <button
                  className="btn btn-primary btn-block mt-2"
                  onClick={(e) => register(e)}
                >
                  Register
                </button>
                <Link
                  className="btn btn-primary btn-block mt-2 ms-2"
                  to={"/login"}
                >
                  Login
                </Link>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
