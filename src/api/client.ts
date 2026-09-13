import axios from 'axios'
import axiosRetry from 'axios-retry'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from '#/lib/auth-token'

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
  withCredentials: true,
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

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.set('Authorization', `Bearer ${token}`)
  return config
})

let refreshing: Promise<string | null> | null = null

const refreshSession = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null
  try {
    const { data } = await axios.post(
      `${apiClient.defaults.baseURL}/auth/refresh`,
      { refresh_token: refreshToken },
    )
    setTokens(data)
    return data.access_token
  } catch {
    clearTokens()
    return null
  }
}

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
  _refreshPromise?: Promise<string | null>
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined

    if (error.response?.status === 401 && original && !original._retry) {
      refreshing ??= refreshSession()

      original._retry = true
      original._refreshPromise = refreshing
      const token = await original._refreshPromise
      refreshing = null

      if (token) {
        original.headers.set('Authorization', `Bearer ${token}`)
        return apiClient(original)
      }
    }

    return Promise.reject(error)
  },
)
