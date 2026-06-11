export interface PaginatedMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ApiListResult<T> {
  items: T[]
  meta?: PaginatedMeta
}

export interface ApiResponse<T> {
  success?: boolean
  message?: string
  data?: T
}
