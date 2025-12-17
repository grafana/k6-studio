import { vi } from 'vitest'

const http = {
  request: vi.fn(),
  asyncRequest: vi.fn(),
  get: vi.fn(),
  head: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  del: vi.fn(),
  options: vi.fn(),
}

export default http
