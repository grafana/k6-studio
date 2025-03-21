import { Flex, IconButton, Tooltip } from '@radix-ui/themes'
import { useEffect } from 'react'
import { useLocalStorage } from 'react-use'

import { useTheme } from '@/hooks/useTheme'

import { WordWrapIcon } from '../icons'

import { k6StudioDarkBackground } from './themes/k6StudioDark'
import { k6StudioLightBackground } from './themes/k6StudioLight'

export type ToolbarState = {
  wordWrap: 'on' | 'off'
}

type EditorToolbarProps = {
  getState: (values: ToolbarState) => void
  actions: { wordWrap: boolean }
}

export const EditorToolbar = ({ getState, actions }: EditorToolbarProps) => {
  const [state, setState] = useLocalStorage<ToolbarState>(
    'editorToolbarState',
    {
      wordWrap: 'off',
    }
  )
  const theme = useTheme()

  useEffect(() => {
    if (state) {
      getState(state)
    }
  }, [state, getState])

  return (
    <Flex
      p="2"
      justify="end"
      style={{
        backgroundColor:
          theme === 'dark' ? k6StudioDarkBackground : k6StudioLightBackground,
        borderBottom: `1px solid ${theme === 'dark' ? 'var(--gray-6)' : 'var(--gray-4)'}`,
      }}
    >
      <Tooltip content="Word wrap">
        <IconButton
          size="1"
          disabled={!actions.wordWrap}
          onClick={() =>
            setState({ wordWrap: state?.wordWrap === 'on' ? 'off' : 'on' })
          }
          variant={state?.wordWrap === 'on' ? 'solid' : 'surface'}
          aria-label="Word wrap"
        >
          <WordWrapIcon width="14px" />
        </IconButton>
      </Tooltip>
    </Flex>
  )
}
