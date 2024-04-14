import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import NavBar from "./NavBar"
import AddServer from "./AddServer"
import { toast } from "react-toastify"
import { useDispatch, useSelector } from "react-redux"
import {
  setConnectedServer,
  setContainers,
  setLoading,
  setNginxConfig,
  setUserData,
} from "../../redux/services/dataService"

function Profile() {
  const renderer = window.renderer
  const navigate = useNavigate()
  const userData = useSelector((state) => state.data.userData)
  const [modalOpened, setModalOpened] = useState(false)
  const dispatch = useDispatch()
  const toastId = React.useRef(null)

  const notify = () =>
    (toastId.current = toast.loading("Processing...", { autoClose: false }))

  const update = (message, toastType) =>
    toast.update(toastId.current, {
      render: message,
      type: toastType,
      autoClose: true,
      isLoading: false,
    })

  const logout = () => {
    renderer.send("logout", null)
  }

  const launchServer = (e, serverId) => {
    e.preventDefault()
    notify()
    renderer.send("server:launch", { id: serverId })
  }

  const removeServer = (e, serverId) => {
    e.preventDefault()
    notify()
    renderer.send("server:remove", { id: serverId })
  }

  useEffect(() => {
    dispatch(setConnectedServer({}))
    renderer.on("addServer:success", (event, args) => {
      update(event.message, "success")
      setModalOpened(false)
      dispatch(setLoading(false))
      dispatch(setUserData(event.userData))
    })
    renderer.on("server:removed", (event, args) => {
      update(event.message, "success")
      dispatch(setUserData(event.userData))
    })
    renderer.on("addServer:fail", (event, args) => {
      dispatch(setLoading(false))
      update(event.messages.join(" "), "error")
    })
    renderer.on("server:launch:success", (event, args) => {
      update("Connected to remote server!", "success")
      dispatch(setConnectedServer(event.server))
      dispatch(setContainers(event.containers))
      dispatch(setNginxConfig(event.nginx_config))
      navigate("/server", {
        state: {
          userData: userData,
        },
      })
    })
    renderer.on("server:launch:fail", (event, args) => {
      update(event.message, "error")
    })
    renderer.on("logout:success", async (event, args) => {
      await navigate("/login")
      window.location.reload(true)
    })
    renderer.on("auth:unauthorized", async (event, args) => {
      await navigate("/login")
      window.location.reload(true)
    })
  }, [renderer, dispatch, navigate, userData])

  return (
    <>
      <NavBar userData={userData} logout={logout} />
      <div className="container mt-5">
        <div>
          <button
            className="btn btn-success"
            onClick={() => {
              setModalOpened(true)
            }}
          >
            Add Server
          </button>
        </div>
        <AddServer
          notify={notify}
          modalOpened={modalOpened}
          setModalOpened={setModalOpened}
        />
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Host</th>
              <th scope="col">Port</th>
              <th scope="col">Username</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {userData.servers.map((server, idx) => {
              return (
                <tr key={idx}>
                  <td>{server.host}</td>
                  <td>{server.port}</td>
                  <td>{server.username}</td>
                  <td>
                    <button
                      type="button"
                      onClick={(e) => launchServer(e, server.id)}
                      className="btn btn-success"
                    >
                      Launch
                    </button>
                    <button
                      type="button"
                      onClick={(e) => removeServer(e, server.id)}
                      className="btn btn-danger mx-2"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default Profile
