import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import NginxRow from "./NginxRow"
import LogsModal from "../shared/LogsModal"
import CreateConfig from "./CreateConfig"
import { setNginxConfig } from "../../redux/services/dataService"

const NginxView = ({ notify, update }) => {
  const renderer = window.renderer
  const nginx_config = useSelector((state) => state.data.nginx_config)
  const [readConfigModal, setReadConfigModal] = useState(false)
  const [createConfigModal, setCreateConfigModal] = useState(false)
  const [logContent, setLogContent] = useState("")
  const dispatch = useDispatch()

  useEffect(() => {
    renderer.on("nginx:config:read_config:success", (event, args) => {
      setReadConfigModal(true)
      setLogContent(event.content)
    })
    renderer.on("nginx:create_config:success", (event, args) => {
      update(event.message, "success")
      dispatch(setNginxConfig(event.nginx_config))
      setCreateConfigModal(false)
    })
  }, [])

  return (
    <div className="container mt-4">
      <LogsModal
        modalOpened={readConfigModal}
        setModalOpened={setReadConfigModal}
        content={logContent}
      />
      <CreateConfig
        opened={createConfigModal}
        setOpened={setCreateConfigModal}
        notify={notify}
        update={update}
      />
      <div className="d-flex justify-content-between">
        <h2>Nginx Configs</h2>
        <div>
          <button
            className="btn btn-success m-1"
            onClick={() => setCreateConfigModal(true)}
          >
            Create Config
          </button>
        </div>
      </div>
      <table className="table table-bordered table-striped">
        <thead className="thead-dark">
          <tr>
            <th scope="col">Domain</th>
            <th scope="col">Proxy</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {nginx_config.map((config, idx) => {
            return <NginxRow key={idx} config={config} />
          })}
        </tbody>
      </table>
    </div>
  )
}

export default NginxView
