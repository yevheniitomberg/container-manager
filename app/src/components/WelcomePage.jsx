import React from "react"
import { Link } from "react-router-dom"

function WelcomePage() {
  return (
    <div className="container">
      <div className="welcome-container">
        <div className="welcome-content">
          <h2>Welcome to YTD!</h2>
          <div className="welcome-buttons">
            <Link
              to={"/login"}
              href="login.html"
              className="btn btn-welcome btn-login"
            >
              Login
            </Link>
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
    </div>
  )
}

export default WelcomePage
