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
        margin: 0;
        line-height: 1;
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-1) var(--space-3);

        &:not(:last-child) {
          margin-bottom: var(--space-3);
        }
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
            css={css`
              position: relative;
              max-width: 100%;
              overflow: hidden;
            `}
          >
            <Reset>
              <button
                type="button"
                disabled={disabled}
                css={css`
                  flex: 1;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                  font-weight: 500;
                  color: var(--gray-11);

                  &:hover {
                    color: var(--orange-9);
                  }

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
                    opacity: 0.6;

                    margin: calc(var(--space-1) * -0.5);
                    margin-right: calc(var(--space-1) * -1.5);
                    padding: var(--space-1);

                    font-size: var(--font-size-1);
                    & > .lucide {
                      min-width: var(--font-size-1);
                      min-height: var(--font-size-1);
                    }

                    &:hover,
                    &:focus {
                      color: var(--red-11);
                      opacity: 1;
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
