import { Flex } from '@radix-ui/themes'
import { uniqueId } from 'lodash-es'
import { CSSProperties, useEffect, useState } from 'react'

export function Font({ url }: { url: string }) {
  const [isReady, setIsReady] = useState(false)
  const [name, setName] = useState('')

  useEffect(() => {
    ;(async function addFontFace(url: string) {
      setIsReady(false)
      const name = uniqueId('font-')
      const font = new FontFace(name, `url(${url})`)

      await font.load()
      document.fonts.add(font)
      setIsReady(true)
      setName(name)
    })(url)
  }, [url])

  if (!isReady) {
    return null
  }

  return (
    <Flex align="center" direction="column" width="100%">
      <div style={{ maxWidth: '400px' }}>
        <h1 style={getFontStyles(name)}>ABCDEFGHIJKLMNOPQRSTUVWXYZ</h1>
        <h1 style={getFontStyles(name)}>abcdefghijklmnopqrstuvwxyz</h1>
        <h1 style={getFontStyles(name)}>1234567890</h1>
      </div>
    </Flex>
  )
}

const getFontStyles = (name: string): CSSProperties => ({
  fontFamily: name,
  textAlign: 'center',
})
