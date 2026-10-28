import axios from "axios";
import Cookies from "js-cookie";

const token = Cookies.get('token');

// axios.defaults.baseURL = 'http://127.0.0.1:8005/api'
// axios.defaults.baseURL = 'https://103.255.240.205:8001/api'
axios.defaults.baseURL = 'https://api.jansenindonesia.com/api'
// axios.defaults.baseURL = 'http://localhost:8080/api'
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
axios.defaults.headers.common['Content-Type'] = 'multipart/form-data'
axios.defaults.headers.common['Accept'] = 'application/json'
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

axios.interceptors.request.use(
  config => {
    const token = Cookies.get('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor untuk handle token expired
axios.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired atau invalid
      const authStore = useAuthStore()
      authStore.clearAuthData()
      router.push({ name: 'Login' })
    }
    return Promise.reject(error)
  }
)

export const axiosInstance = axios