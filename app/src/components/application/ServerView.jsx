import React, { useState } from "react"
import { useLocation } from "react-router-dom"
import ContainerView from "../containers/ContainerView"
import NavBar from "./NavBar"
import NginxView from "../nginx/NginxView"
import { toast } from "react-toastify"

function ServerView() {
  const renderer = window.renderer
  const location = useLocation()
  const [userData, setUserData] = useState(location.state?.userData)
  const toastId = React.useRef(null)

  const logout = () => {
    renderer.send("logout", null)
  }
  const update = (message, toastType, isLoading = false) =>
    toast.update(toastId.current, {
      render: message,
      type: toastType,
      autoClose: true,
      isLoading: isLoading,
    })
  const notify = () =>
    (toastId.current = toast.loading("Processing...", { autoClose: false }))

  return (
    <>
      <NavBar userData={userData} logout={logout} />
      <ul className="nav nav-tabs m-2" id="myTab" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className="nav-link active"
            id="containers-tab"
            data-bs-toggle="tab"
            data-bs-target="#containers"
            type="button"
            role="tab"
            aria-controls="containers"
            aria-selected="true"
          >
            Containers
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className="nav-link"
            id="nginx-tab"
            data-bs-toggle="tab"
            data-bs-target="#nginx"
            type="button"
            role="tab"
            aria-controls="nginx"
            aria-selected="false"
          >
            Nginx
          </button>
        </li>
      </ul>
      <div className="tab-content" id="myTabContent">
        <div
          className="tab-pane fade show active"
          id="containers"
          role="tabpanel"
          aria-labelledby="containers-tab"
        >
          <ContainerView update={update} toastId={toastId} notify={notify} />
        </div>
        <div
          className="tab-pane fade"
          id="nginx"
          role="tabpanel"
          aria-labelledby="nginx-tab"
        >
          <NginxView update={update} toastId={toastId} notify={notify} />
        </div>
      </div>
    </>
  )
}

export default ServerView
