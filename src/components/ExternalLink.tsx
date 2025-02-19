import { Link, LinkProps } from '@radix-ui/themes'

export function ExternalLink({ onClick, ...props }: LinkProps) {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)

    if (event.defaultPrevented) {
      return
    }

    event.preventDefault()

    window.studio.browser
      .openExternalLink(event.currentTarget.href)
      .catch((error) => {
        console.error('Failed to open external link:', error)
      })
  }

  return <Link {...props} onClick={handleClick} />
}
