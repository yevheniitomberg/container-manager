import React, { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  ValidatorDefaults,
  displayErrors,
  isValid,
  validateForm,
} from "../../utils/validator"
import ValidationErrorList from "../messaging/ErrorList"
import SuccessMessage from "../messaging/SuccessMessage"
import { useDispatch } from "react-redux"
import { setUserData } from "../../redux/services/dataService"
import { handleChange } from "../../utils/shared_funcs"
import { loginData } from "../../utils/dev_data"

function LoginPage() {
  const renderer = window.renderer

  const [payload, setPayload] = useState(
    loginData(process.env.NODE_ENV === "development")
  )
  const [errors, setErrors] = useState([])
  const location = useLocation()
  const successMessage = location.state?.message
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const getValidatedObject = () => {
    return validateForm(payload, {
      username: ValidatorDefaults.ANY,
      password: ValidatorDefaults.ANY,
    })
  }

  useEffect(() => {
    renderer.on("login:success", (event, args) => {
      dispatch(setUserData(event.userData))
      navigate("/profile")
    })
    renderer.on("login:fail", (event, args) => {
      setErrors(event.messages)
    })
  }, [renderer, navigate, dispatch])

  const login = (e) => {
    e.preventDefault()
    const validatedObject = getValidatedObject()
    isValid(validatedObject)
      ? renderer.send("login", payload)
      : displayErrors(validatedObject)
  }

  return (
    <div className="container">
      <div className="login-container">
        <div className="login-form">
          <h2>Login</h2>
          <form>
            <div className="form-group">
              <ValidationErrorList errors={errors} />
              <SuccessMessage message={successMessage} />
              <label htmlFor="username">Username</label>
              <input
                type="text"
                className="form-control"
                name="username"
                id="username"
                onChange={(e) => handleChange(e, payload, setPayload)}
                placeholder="Enter your username"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                className="form-control"
                name="password"
                id="password"
                onChange={(e) => handleChange(e, payload, setPayload)}
                placeholder="Enter your password"
              />
            </div>
            <div className="form-group mt-2">
              <button
                onClick={(e) => login(e)}
                className="btn btn-primary btn-block"
              >
                Login
              </button>
              <Link to={"/register"} className="btn btn-primary btn-block ms-2">
                Register
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
