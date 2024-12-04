import { ProxyData } from '@/types'
import { Link, Tooltip } from '@radix-ui/themes'
import { useSetAtom } from 'jotai'
import { MouseEvent } from 'react'
import { selectedRequestAtom } from '../GeneratorSidebar/RequestList'

function truncateString(str: string, length: number) {
  if (str.length <= length) {
    return str
  }

  return str.slice(0, length) + '...'
}

interface RequestLinkProps {
  request: ProxyData
}

export function RequestLink({ request }: RequestLinkProps) {
  const setSelectedRequestId = useSetAtom(selectedRequestAtom)

  function handleClick(ev: MouseEvent<HTMLElement>) {
    ev.preventDefault()

    setSelectedRequestId(request.id)
  }

  const text = `${request.request.method} ${request.request.path}`

  return (
    <Tooltip content={text}>
      <Link href="#" onClick={handleClick}>
        {truncateString(text, 40)}
      </Link>
    </Tooltip>
  )
}
