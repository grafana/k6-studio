import { uuid } from './uuid'
import { base64 } from './base64'
import { jwt } from './jwt'
import { hex } from './hex'
import { Correlation } from '../correlation'
import { html } from './html'

const analyzers = [uuid, base64, jwt, hex, html]

export const analyze = (correlation: Correlation): boolean => {
  return true
  return analyzers.some((a) => a(correlation))
}
