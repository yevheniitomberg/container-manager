import React from "react"
import { FaQuestion } from "react-icons/fa"

function NginxActions({ path }) {
  const renderer = window.renderer
  const displayConfig = () => {
    renderer.send("nginx:config:read_config", { path: path })
  }
  return (
    <button onClick={displayConfig} className={`action-button hoverable`}>
      {<FaQuestion color="blue" />}
    </button>
  )
}

export default NginxActions
