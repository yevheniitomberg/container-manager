import React from "react"
import Modal from "react-modal"
import { modalStyles } from "../../styles/styles"
import { IoMdCloseCircle } from "react-icons/io"

function LogsModal({ modalOpened, content, setModalOpened }) {
  return (
    <Modal
      isOpen={modalOpened}
      style={{
        content: {
          ...modalStyles.content,
          "maxHeight": "600px",
          "overflowX": "hidden",
          "maxWidth": "800px",
        },
        overlay: { ...modalStyles.overlay },
      }}
    >
      <div className="d-flex flex-wrap">
        <div
          className="position-sticky display-6 top-0 d-flex justify-content-end"
          style={{ "width": "100%" }}
        >
          <IoMdCloseCircle
            style={{ "cursor": "pointer" }}
            color="red"
            onClick={() => setModalOpened(false)}
          />
        </div>
        <div
          style={{ "width": "100%" }}
          dangerouslySetInnerHTML={{ __html: `<pre>${content}</pre>` }}
        ></div>
      </div>
    </Modal>
  )
}

export default LogsModal
