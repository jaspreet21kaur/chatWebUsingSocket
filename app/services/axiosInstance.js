import axios from 'axios'
import auth from '../configs/auth'

// console.log(process.env.BASE_URL)
const axiosInstance = axios.create({
  baseURL: `http://192.168.1.165:8080/`,
  headers: {
    'Content-Type': 'application/json'
  }
})

axiosInstance.interceptors.request.use(
  request => {
    const storedToken = window.localStorage.getItem(auth.storageTokenKeyName)
    if (storedToken) {
      request.headers.Authorization = `Bearer ${storedToken}`
    }

    return request
  },
  error => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response?.status === 401) {
      localStorage.clear()
      if (typeof window !== 'undefined') {
        window.location.replace('/')
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
