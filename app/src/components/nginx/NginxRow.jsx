import React from "react"
import NginxActions from "./NginxActions"

function NginxRow({ config }) {
  const { domain, proxy, path } = config
  return (
    <tr>
      <td>{domain}</td>
      <td style={{ "textAlign": "center" }}>{proxy}</td>
      <td>
        <NginxActions path={path} />
      </td>
    </tr>
  )
}

export default NginxRow
