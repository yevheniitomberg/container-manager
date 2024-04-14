import React from "react"
import { Link } from "react-router-dom"

function NavBar({ userData, logout }) {
  return (
    <nav
      className="navbar bg-dark border-bottom navbar-expand-lg border-body sticky-top"
      data-bs-theme="dark"
    >
      <div className="container-fluid">
        <a className="navbar-brand">
          <img
            src="logo.png"
            alt="Logo"
            width="50"
            height="50"
            className="d-inline-block mx-2"
          />
          Server Managing
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavDropdown"
          aria-controls="navbarNavDropdown"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div
          className="collapse navbar-collapse"
          id="navbarNavDropdown"
          style={{ "justifyContent": "space-between" }}
        >
          <ul className="navbar-nav"></ul>
          <ul className="navbar-nav me-5">
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {userData.username}
              </a>
              <ul className="dropdown-menu">
                <li>
                  <Link to={"/profile"} className="dropdown-item">
                    Profile
                  </Link>
                </li>
                <li>
                  <Link onClick={logout} className="dropdown-item">
                    Logout
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
