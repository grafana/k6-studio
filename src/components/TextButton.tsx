import { Link, Reset } from '@radix-ui/themes'
import { ComponentProps } from 'react'

export function TextButton(props: ComponentProps<'button'>) {
  return (
    <Link asChild>
      <Reset>
        <button type="button" {...props} />
      </Reset>
    </Link>
  )
}
