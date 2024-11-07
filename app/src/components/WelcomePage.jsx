import React, { useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { Helmet } from "react-helmet"

function WelcomePage() {
  const location = useLocation()

  useEffect(() => {
    if (location.pathname === "/") {
      document.body.classList.add("login-body")
    }
  }, [location])

  return (
    <>
      <div className="container welcome-container">
        <div className="row">
          <div className="col-md-12">
            <h1 className="slogan">Yielding Technological Dreams</h1>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <Link
              to={"/login"}
              href="login.html"
              className="btn btn-welcome btn-login"
            >
              Login
            </Link>
          </div>
          <div className="col-md-6">
            <Link
              to={"/register"}
              href="login.html"
              className="btn btn-welcome btn-login"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default WelcomePage
