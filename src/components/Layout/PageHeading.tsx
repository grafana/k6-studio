import { HomeIcon } from '@radix-ui/react-icons'
import { Flex, Heading, IconButton } from '@radix-ui/themes'
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
      <Flex
        gap="2"
        align="center"
        p="2"
        style={{
          borderBottom: '1px solid var(--gray-4)',
          backgroundColor: 'var(--gray-2)',
        }}
      >
        <IconButton
          onClick={() => {
            navigate('/')
          }}
          aria-label="Home"
        >
          <HomeIcon width="18" height="18" />
        </IconButton>
        <Flex maxWidth="50%" flexGrow="1">
          <Heading size="3">{text}</Heading>
        </Flex>
        <Flex flexGrow="1" justify="end" align="center" gap="2">
          <ThemeSwitcher />
          {children}
        </Flex>
      </Flex>
    </>
  )
}
