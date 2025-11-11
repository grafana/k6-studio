import type { Content, Entry, Header, Page, Response } from 'har-format'

export type HarEntry = Omit<Entry, 'response'> & {
  response?: Response
}

export type HarPage = Page

export type HarContent = Content

export type HarHeader = Header

export type HarResponse = Response
