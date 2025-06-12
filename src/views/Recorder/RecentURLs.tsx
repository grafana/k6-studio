import { css } from '@emotion/react'
import { Badge, Reset, Tooltip } from '@radix-ui/themes'
import { XIcon } from 'lucide-react'

interface RecentURLsProps {
  urls: string[]
  disabled: boolean
  onSelectURL: (url: string) => void
  onRemoveURL: (url: string) => void
}

export function RecentURLs({
  urls,
  disabled,
  onSelectURL,
  onRemoveURL,
}: RecentURLsProps) {
  if (urls.length === 0) {
    return null
  }

  return (
    <ul
      aria-label="Recent URLs"
      css={css`
        list-style: none;
        padding: 0;
        margin: 0 0 var(--space-3);
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-1) var(--space-3);
      `}
    >
      {urls.map((url) => (
        <li
          key={url}
          css={css`
            max-width: 100%;
          `}
        >
          <Badge
            size="1"
            variant="soft"
            color="gray"
            highContrast
            css={css`
              position: relative;
              max-width: 100%;

              &:hover {
                background-color: var(--gray-4);
              }

              &:focus-within > button:last-of-type,
              &:hover > button:last-of-type {
                opacity: 1;
              }
            `}
          >
            <Reset>
              <button
                type="button"
                aria-label="Select URL"
                disabled={disabled}
                css={css`
                  flex: 1;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;

                  &::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                  }
                `}
                onClick={() => onSelectURL(url)}
              >
                {url}
              </button>
            </Reset>
            <Tooltip content="Remove URL">
              <Reset>
                <button
                  css={css`
                    display: flex;
                    position: relative;
                    z-index: 1;
                    opacity: 0;
                    margin: 0 calc(var(--space-1) * -1);

                    &:hover,
                    &:focus {
                      opacity: 1;
                      background: var(--gray-6);
                    }
                  `}
                  type="button"
                  disabled={disabled}
                  aria-label="Remove URL"
                  onClick={() => onRemoveURL(url)}
                >
                  <XIcon />
                </button>
              </Reset>
            </Tooltip>
          </Badge>
        </li>
      ))}
    </ul>
  )
}
