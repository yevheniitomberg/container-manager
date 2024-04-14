import React, { useEffect, useState } from "react"
import ContainerRaw from "./ContainerRaw"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "react-toastify"
import {
  setContainers,
  setImages,
  setLoading,
  setNginxConfig,
} from "../../redux/services/dataService"
import { useInterval } from "../hooks/useInterval"
import ContainerLogs from "../shared/LogsModal"
import CreateContainer from "./CreateContainer"
import CreateImage from "./CreateImage"

function ContainerView({ update, toastId, notify }) {
  const renderer = window.renderer
  const containers = useSelector((state) => state.data.containers)
  const [modalOpened, setModalOpened] = useState(false)
  const [createContainerModal, setCreateContainerModal] = useState(false)
  const [imageModal, setImageModal] = useState(false)
  const [logContent, setLogContent] = useState("")
  const [containerCreateData, setContainerCreateData] = useState({})
  const dispatch = useDispatch()

  useInterval(() => {
    renderer.send("server:update", {})
  }, 10000)

  const createContainer = () => {
    dispatch(setLoading(true))
    setCreateContainerModal(true)
    renderer.send("test", {})
    renderer.send("container:create:prepare", {})
  }

  const createImage = () => {
    dispatch(setLoading(true))
    setImageModal(true)
    renderer.send("data:image:list", {})
  }

  useEffect(() => {
    renderer.on("alert:update", (event, args) => {
      update(event.message, "loading", true)
    })
    renderer.on("image:create:success", (event, args) => {
      dispatch(setLoading(false))
      dispatch(setImages(event.images))
      update("Image was successfully created!", "success")
      setImageModal(false)
    })
    renderer.on("container:start:success", (event, args) => {
      dispatch(setLoading(false))
      dispatch(setContainers(event.containers))
      update("Container was successfully started!", "success")
    })
    renderer.on("container:stop:success", (event, args) => {
      dispatch(setLoading(false))
      dispatch(setContainers(event.containers))
      update("Container was successfully stopped!", "success")
    })
    renderer.on("container:restart:success", (event, args) => {
      dispatch(setLoading(false))
      dispatch(setContainers(event.containers))
      update("Container was successfully restarted!", "success")
    })
    renderer.on("server:update:success", (event, args) => {
      dispatch(setContainers(event.containers))
      dispatch(setNginxConfig(event.nginx_config))
    })
    renderer.on("container:remove:aborted", (event, args) => {
      dispatch(setLoading(false))
      update(event.message, "error")
    })
    renderer.on("container:remove:success", (event, args) => {
      dispatch(setLoading(false))
      dispatch(setContainers(event.containers))
      update("Container was successfully removed!", "success")
    })
    renderer.on("container:logs:display", (event, args) => {
      dispatch(setLoading(false))
      setLogContent(event.content)
      setModalOpened(true)
    })
    renderer.on("general:error", (event, args) => {
      dispatch(setLoading(false))
      update("An error occured!", "error")
    })
    renderer.on("container:create:preload", (event, args) => {
      dispatch(setLoading(false))
      setContainerCreateData(event)
    })
    renderer.on("data:image:list:success", (event, args) => {
      dispatch(setLoading(false))
      dispatch(setImages(event.images))
    })
    renderer.on("container:create:success", (event, args) => {
      dispatch(setLoading(false))
      dispatch(setContainers(event.containers))
      setCreateContainerModal(false)
      update("Container was successfully created!", "success")
    })
  }, [renderer, dispatch])

  return (
    <>
      <ContainerLogs
        modalOpened={modalOpened}
        setModalOpened={setModalOpened}
        content={logContent}
      />
      <CreateContainer
        opened={createContainerModal}
        setOpened={setCreateContainerModal}
        data={containerCreateData}
        update={update}
        toastId={toastId}
        notify={notify}
      />
      <CreateImage
        opened={imageModal}
        setOpened={setImageModal}
        update={update}
        toastId={toastId}
        notify={notify}
      />
      <div className="container mt-4">
        <div className="d-flex justify-content-between">
          <h2>Container Information</h2>
          <div>
            <button className="btn btn-success m-1" onClick={createContainer}>
              Create Container
            </button>
            <button className="btn btn-success" onClick={createImage}>
              Create Image
            </button>
          </div>
        </div>
        <table className="table table-bordered table-striped">
          <thead className="thead-dark">
            <tr>
              <th></th>
              <th scope="col">Container ID</th>
              <th scope="col">Container Name</th>
              <th scope="col">Image Name</th>
              <th scope="col">Ports</th>
              <th scope="col">Status</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {containers.map((container, idx) => {
              return (
                <ContainerRaw
                  toastId={toastId}
                  key={idx}
                  container={container}
                  isRunning={container.status.startsWith("Up")}
                />
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default ContainerView
