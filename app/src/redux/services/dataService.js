import { createSlice } from "@reduxjs/toolkit"

const dataSlice = createSlice({
  name: "data",
  initialState: {
    loading: false,
    userData: {},
    connectedServer: {},
    containers: [],
    images: [],
    nginx_config: [],
    folderExist: false,
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setConnectedServer: (state, action) => {
      state.connectedServer = action.payload
    },
    setContainers: (state, action) => {
      state.containers = action.payload
    },
    setImages: (state, action) => {
      state.images = action.payload
    },
    setFolderExist: (state, action) => {
      state.folderExist = action.payload
    },
    setNginxConfig: (state, action) => {
      state.nginx_config = action.payload
    },
  },
})
export const {
  setUserData,
  setLoading,
  setConnectedServer,
  setContainers,
  setImages,
  setFolderExist,
  setNginxConfig,
} = dataSlice.actions
export default dataSlice.reducer
