import React from "react"
import { FaDotCircle } from "react-icons/fa"
import ActionBar from "./ActionBar"

function ContainerRaw({ container, isRunning, toastId }) {
  const { containerId, containerName, imageName, ports, status } = container

  return (
    <tr>
      <td>
        <FaDotCircle style={{ "color": `${isRunning ? "green" : "red"}` }} />
      </td>
      <td>{containerId}</td>
      <td>{containerName}</td>
      <td>{imageName}</td>
      <td>{ports}</td>
      <td>{status}</td>
      <td>
        <ActionBar
          isRunning={isRunning}
          container={container}
          toastId={toastId}
        />
      </td>
    </tr>
  )
}

export default ContainerRaw
