import React from "react"
import ReactDOM from "react-dom/client"
import "bootstrap/dist/css/bootstrap.css"
import "bootstrap/dist/js/bootstrap.js"
import "react-tooltip/dist/react-tooltip.css"
import "react-toastify/dist/ReactToastify.css"
import "./index.css"
import reportWebVitals from "./reportWebVitals"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import LoginPage from "./components/authentication/LoginPage"
import WelcomePage from "./components/WelcomePage"
import Profile from "./components/application/Profile"
import RegisterPage from "./components/authentication/RegisterPage"
import { Provider } from "react-redux"
import store from "./redux/store"
import ContainerView from "./components/containers/ContainerView"
import { ToastContainer } from "react-toastify"
import Modal from "react-modal"
import ServerView from "./components/application/ServerView"

const router = createBrowserRouter([
  {
    path: "/",
    element: <WelcomePage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/server",
    element: <ServerView />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
])

Modal.setAppElement(document.getElementById("root"))

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
  <React.StrictMode>
    <ToastContainer />
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
