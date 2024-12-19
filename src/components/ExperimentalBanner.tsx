import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { Flex, Text, Link } from '@radix-ui/themes'

const handleLinkClick = () =>
  window.studio.browser.openExternalLink(
    'https://github.com/grafana/k6-studio/issues'
  )

export function ExperimentalBanner() {
  return (
    <Flex
      align="center"
      justify="center"
      p="3"
      css={{
        backgroundColor: 'var(--orange-3)',
      }}
    >
      <Flex asChild gap="2" align="center">
        <Text weight="medium" color="orange" size="2">
          <ExclamationTriangleIcon width="18" height="18" />
          <Text>
            This is a public preview version of k6 Studio, please report any
            issues found on{' '}
            <Link href="" onClick={handleLinkClick}>
              GitHub
            </Link>
            .
          </Text>
        </Text>
      </Flex>
    </Flex>
  )
}
