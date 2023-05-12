import axios from 'axios'

axios.defaults.baseURL =
  process.env.REACT_APP_BACKEND_BASE_URL ||
  'https://f18c-2001-1c02-198d-b600-36aa-fecb-243b-41c5.ngrok-free.app'

const instance = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_BASE_URL
})

axios.interceptors.request.use(
  (request) => {
    console.log(request)
    // Edit request config
    return request
  },
  (error) => {
    console.log(error)
    return Promise.reject(error)
  }
)

axios.interceptors.response.use(
  (response) => {
    console.log(response)
    // Edit response config
    return response
  },
  (error) => {
    console.log(error)
    return Promise.reject(error)
  }
)

export default instance
