import { Link, Reset } from '@radix-ui/themes'
import { ComponentProps } from 'react'

export function LinkButton(props: ComponentProps<'button'>) {
  return (
    <Link asChild>
      <Reset>
        <button {...props} />
      </Reset>
    </Link>
  )
}
