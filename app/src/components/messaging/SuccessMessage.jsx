import React from "react"

function SuccessMessage({ message }) {
  return (
    <div
      className="alert alert-success mt-2"
      style={{ "display": `${!!message ? "block" : "none"}` }}
    >
      {message}
    </div>
  )
}

export default SuccessMessage
