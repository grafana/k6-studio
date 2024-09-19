import { css } from '@emotion/react'
import { Text } from '@radix-ui/themes'
import { PropsWithChildren, ReactNode } from 'react'

interface NavigationCardProps {
  title: string
  description: string
  icon: ReactNode
}

export function NavigationCard({
  title,
  description,
  icon,
  children,
}: PropsWithChildren<NavigationCardProps>) {
  return (
    <div>
      <div
        role="presentation"
        css={css`
          color: var(--accent-9);
          margin-left: -6px;
        `}
      >
        {icon}
      </div>
      <Text as="div" size="3" weight="medium" mb="1">
        {title}
      </Text>
      <Text as="div" size="2" color="gray" mb="3">
        {description}
      </Text>
      {children}
    </div>
  )
}
