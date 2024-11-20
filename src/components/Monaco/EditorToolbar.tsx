import { Flex, IconButton, Tooltip } from '@radix-ui/themes'
import { useEffect } from 'react'
import { k6StudioLightBackground } from './themes/k6StudioLight'
import { useTheme } from '@/hooks/useTheme'
import { useLocalStorage } from 'react-use'
import { WordWrapIcon } from '../icons'

export type ToolbarState = {
  wordWrap: 'on' | 'off'
}

type EditorToolbarProps = {
  getState: (values: ToolbarState) => void
}

export const EditorToolbar = ({ getState }: EditorToolbarProps) => {
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
        backgroundColor: theme === 'dark' ? '#1e1e1e' : k6StudioLightBackground,
        borderBottom: `1px solid ${theme === 'dark' ? 'var(--gray-6)' : 'var(--gray-4)'}`,
      }}
    >
      <Tooltip content="Word wrap">
        <IconButton
          size="1"
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
