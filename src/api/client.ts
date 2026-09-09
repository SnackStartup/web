import axios from 'axios'
import axiosRetry from 'axios-retry'

const API_URL = import.meta.env.VITE_API_URL // direct backend (prod/localhost dev)
const API_LAN_URL = import.meta.env.VITE_API_LAN_URL // LAN-reachable backend (phones)
const API_PROXY_URL = import.meta.env.VITE_API_PROXY_URL // same-origin proxy (tylko ngrok)

const getApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    return API_URL.startsWith('/') ? API_PROXY_URL : API_URL
  }
  if (import.meta.env.MODE === 'production') return API_URL
  const hostname = window.location.hostname
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'
  const isNgrok = /\.ngrok(-free)?\.(io|app|dev)$/.test(hostname)
  if (isNgrok) return API_PROXY_URL
  if (isLocalhost) return API_URL
  return API_LAN_URL || API_URL
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
