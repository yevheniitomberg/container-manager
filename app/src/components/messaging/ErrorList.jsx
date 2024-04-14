import React from "react"

function ValidationErrorList({ errors }) {
  return (
    <div
      className="alert alert-danger mt-2"
      id="error-bar"
      style={{ "display": `${errors.length > 0 ? "block" : "none"}` }}
    >
      {errors.map((error, idx) => {
        return <div key={idx}>{error}</div>
      })}
    </div>
  )
}

export default ValidationErrorList
