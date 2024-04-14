import React, { useEffect } from "react"
import { FaRocket, FaStop, FaQuestion, FaTrashAlt } from "react-icons/fa"
import { IoRefreshCircle } from "react-icons/io5"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "react-toastify"
import { setLoading } from "../../redux/services/dataService"

function ActionBar({ isRunning, container, toastId }) {
  const renderer = window.renderer
  const server = useSelector((state) => state.data.connectedServer)
  const loading = useSelector((state) => state.data.loading)

  const notify = () =>
    (toastId.current = toast.loading("Processing...", { autoClose: false }))

  const dispatch = useDispatch()

  const onStopOrStart = () => {
    if (isRunning) {
      renderer.send("container:stop", { container: container })
      notify()
      dispatch(setLoading(true))
    } else {
      notify()
      dispatch(setLoading(true))
      renderer.send("container:start", { container: container })
    }
  }

  const restartContainer = () => {
    notify()
    dispatch(setLoading(true))
    renderer.send("container:restart", { container: container })
  }

  const removeContainer = () => {
    notify()
    dispatch(setLoading(true))
    renderer.send("container:remove", { container: container })
  }

  const displayLogs = () => {
    dispatch(setLoading(true))
    renderer.send("container:logs", { container: container })
  }

  return (
    <div className="action-bar">
      <button
        disabled={loading}
        className={`action-button hoverable`}
        onClick={onStopOrStart}
      >
        {isRunning ? (
          <FaStop color="red" />
        ) : (
          <FaRocket className="FaRocker" color="green" />
        )}
      </button>
      <button
        disabled={loading || !isRunning}
        onClick={restartContainer}
        className={`action-button ${isRunning ? "hoverable" : ""}`}
      >
        {
          <IoRefreshCircle
            color={`${isRunning ? "orange" : "grey"}`}
            fontSize="16pt"
          />
        }
      </button>
      <button
        disabled={loading}
        onClick={displayLogs}
        className={`action-button hoverable`}
      >
        {<FaQuestion color="blue" />}
      </button>
      <button
        disabled={loading}
        onClick={removeContainer}
        className={`action-button hoverable`}
      >
        {<FaTrashAlt />}
      </button>
    </div>
  )
}

export default ActionBar
