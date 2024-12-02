import { MultipartParam, RawBody } from '../model/types'

// TODO: Pending implementation
export const tryDeserialize = (raw: RawBody): RawBody => {
  return raw
}

// TODO: Pending implementation
export const serialize = (_params: MultipartParam[]): RawBody => ({
  type: 'raw',
  mimeType: 'multipart/form-data',
  text: '',
})
