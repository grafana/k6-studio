import { css } from '@emotion/react'
import { Button, Flex, IconButton, Tooltip } from '@radix-ui/themes'
import { ChevronRightIcon, PlusIcon, XIcon } from 'lucide-react'
import { Fragment, ReactElement, useRef, useState } from 'react'

import { cssLocatorOptions, LocatorOptions } from '@/schemas/locator'
import { emptyToUndefined } from '@/utils/list'

import { FrameChainProvider } from '../../FrameChainContext'

import { LocatorForm } from './LocatorForm'

interface FrameChainFormProps {
  frames: LocatorOptions[] | undefined
  onChange: (frames: LocatorOptions[] | undefined) => void
}

/**
 * Edits the chain of iframes (outermost first) an element lives in, rendered as
 * a single wrapping line inside the element's locator popover. Each frame reuses
 * the standard LocatorForm, scoped so highlighting resolves the iframe within
 * the frames before it.
 */
export function FrameChainForm({
  frames,
  onChange,
}: FrameChainFormProps): ReactElement {
  const chain = frames ?? []

  // Stable key per frame row. Index keys would shift when a non-last frame is
  // removed, reassigning a LocatorForm's local UI state (open popover, touched
  // fields) to a different frame. The keys are maintained alongside add/remove,
  // which are the only ways the chain length changes while this form is open.
  const nextKey = useRef(chain.length)
  const [keys, setKeys] = useState<number[]>(() =>
    chain.map((_, index) => index)
  )

  const handleAdd = () => {
    setKeys((current) => [...current, nextKey.current++])
    onChange([...chain, cssLocatorOptions('')])
  }

  const handleRemove = (index: number) => {
    setKeys((current) => current.filter((_, position) => position !== index))

    const next = chain.filter((_, position) => position !== index)

    onChange(emptyToUndefined(next))
  }

  const handleChange = (index: number, value: LocatorOptions) => {
    onChange(
      chain.map((frame, position) => (position === index ? value : frame))
    )
  }

  // A single wrapping line of frame locators. The empty-state ghost button
  // collapses to 16px (negative margins) while a locator badge is 24px, so
  // reserve the badge height to stop the row growing when the first frame is
  // added.
  return (
    <Flex
      align="center"
      gap="2"
      wrap="wrap"
      css={css`
        min-height: var(--space-5);
      `}
    >
      {chain.map((frame, index) => (
        <Fragment key={keys[index] ?? index}>
          {index > 0 && (
            <ChevronRightIcon
              css={css`
                color: var(--gray-8);
              `}
            />
          )}
          <Flex align="center" gap="1">
            <FrameChainProvider value={{ frames: chain.slice(0, index) }}>
              <LocatorForm
                state={frame}
                onChange={(value) => handleChange(index, value)}
              />
            </FrameChainProvider>
            <Tooltip content="Remove iframe">
              <IconButton
                size="1"
                variant="ghost"
                color="gray"
                onClick={() => handleRemove(index)}
                aria-label="Remove iframe"
              >
                <XIcon />
              </IconButton>
            </Tooltip>
          </Flex>
        </Fragment>
      ))}

      <Button size="1" variant="ghost" color="gray" onClick={handleAdd}>
        <PlusIcon />
        {chain.length === 0 ? 'Add iframe' : 'Add nested iframe'}
      </Button>
    </Flex>
  )
}
