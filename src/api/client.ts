import axios from 'axios'
import axiosRetry from 'axios-retry'

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
  timeout: 30000,
})

axiosRetry(apiClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      error.code === 'ECONNABORTED'
    )
  },
})
