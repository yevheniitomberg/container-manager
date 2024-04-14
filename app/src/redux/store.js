import { configureStore } from "@reduxjs/toolkit"
import dataReducer from "./services/dataService"

export default configureStore({
  reducer: {
    data: dataReducer,
  },
})
