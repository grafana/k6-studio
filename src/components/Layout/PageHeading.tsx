import { HomeIcon } from '@radix-ui/react-icons'
import { Flex, Heading, IconButton, Separator } from '@radix-ui/themes'
import { useNavigate } from 'react-router-dom'
import { ThemeSwitcher } from '../ThemeSwitcher'

export function PageHeading({
  text,
  children,
}: {
  text: string
  children: React.ReactNode
}) {
  const navigate = useNavigate()

  return (
    <>
      <Flex gap="2" align="center" p="2">
        <IconButton
          onClick={() => {
            navigate('/')
          }}
          aria-label="Home"
        >
          <HomeIcon width="18" height="18" />
        </IconButton>
        <Flex maxWidth="50%" flexGrow="1">
          <Heading>{text}</Heading>
        </Flex>
        <Flex maxWidth="50%" flexGrow="1" justify="end" align="center" gap="2">
          <ThemeSwitcher />
          {children}
        </Flex>
      </Flex>

      <Separator size="4" style={{ backgroundColor: 'var(--gray-4)' }} />
    </>
  )
}
