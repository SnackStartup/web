import axios from 'axios'

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL
  if (import.meta.env.PROD) {
    return envUrl
  }
  const hostname = window.location.hostname
  // running on a device over LAN
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return envUrl.replace(/(?<=\/\/)[^:]+/, hostname)
  }
  return envUrl
}

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
})
