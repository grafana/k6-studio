import { HomeIcon } from '@radix-ui/react-icons'
import {
  Card,
  Flex,
  Heading,
  IconButton,
  Inset,
  Separator,
} from '@radix-ui/themes'
import { useNavigate } from 'react-router-dom'

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
      <Flex gap="2" pb="2" align="center">
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
        <Flex maxWidth="50%" flexGrow="1" justify="end">
          {children}
        </Flex>
      </Flex>
      <Card variant="ghost" size="2" mb="3">
        <Inset side="x">
          <Separator size="4" style={{ backgroundColor: 'var(--gray-4)' }} />
        </Inset>
      </Card>
    </>
  )
}
