export interface IApiError {
  message: string
  code: string
  status?: number
  fieldErrors?: Record<string, string>
}

export interface IPaginatedResponse<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}
