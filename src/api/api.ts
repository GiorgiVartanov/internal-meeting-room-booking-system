import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios"

import { DEFAULT_EMPLOYEE_ID } from "@/constants"
import type { IApiError } from "@/types"

export const api = axios.create({
  baseURL: "/api", // MSW will intercept it
})

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (isApiError(error)) return error.message
  if (!axios.isAxiosError<IApiError>(error))
    return error instanceof Error ? error.message : fallback

  return error.response?.data?.message || error.message || fallback
}

export const isApiError = (error: unknown): error is IApiError =>
  Boolean(
    error &&
    typeof error === "object" &&
    typeof Reflect.get(error, "message") === "string" &&
    typeof Reflect.get(error, "code") === "string"
  )

const normalizeApiError = (error: unknown): IApiError => {
  if (isApiError(error)) return error
  if (axios.isAxiosError<IApiError>(error)) {
    const response = error.response

    return {
      message: response?.data?.message || error.message || "The request failed.",
      code: response?.data?.code || (response ? "HTTP_ERROR" : "NETWORK_ERROR"),
      status: response?.status,
      fieldErrors: response?.data?.fieldErrors,
    }
  }

  return {
    message: error instanceof Error ? error.message : "An unexpected error occurred.",
    code: "UNEXPECTED_ERROR",
  }
}

api.interceptors.request.use((config) => {
  config.headers.set(
    "Accept-Language",
    localStorage.getItem("meeting-room-booking-website") ?? navigator.language
  )
  config.headers.set("X-Employee-Id", DEFAULT_EMPLOYEE_ID)

  return config
})

api.interceptors.response.use(
  <T>(response: AxiosResponse<T>) => response,
  (error) => Promise.reject(normalizeApiError(error))
)

const request = async <T, R = unknown>(
  method: "get" | "post" | "put" | "patch" | "delete",
  url: string,
  data?: R,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await api.request<T>({
    method,
    url,
    data,
    ...config,
  })

  return response.data
}

export const get = <T>(url: string, config?: AxiosRequestConfig) =>
  request<T>("get", url, undefined, config)

export const post = <T, R = unknown>(url: string, data?: R, config?: AxiosRequestConfig) =>
  request<T>("post", url, data, config)

export const put = <T, R = unknown>(url: string, data?: R, config?: AxiosRequestConfig) =>
  request<T>("put", url, data, config)

export const patch = <T, R = unknown>(url: string, data?: R, config?: AxiosRequestConfig) =>
  request<T>("patch", url, data, config)

export const del = <T>(url: string, config?: AxiosRequestConfig) =>
  request<T>("delete", url, undefined, config)
