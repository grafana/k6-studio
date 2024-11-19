import { Flex, Switch, Text } from '@radix-ui/themes'
import { useEffect } from 'react'
import { k6StudioLightBackground } from './themes/k6StudioLight'
import { Label } from '../Label'
import { useTheme } from '@/hooks/useTheme'
import { useLocalStorage } from 'react-use'

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
      style={{
        backgroundColor: theme === 'dark' ? '#1e1e1e' : k6StudioLightBackground,
        borderBottom: `1px solid ${theme === 'dark' ? '#4d4b4b' : '#e5e5e5'}`,
      }}
    >
      <Label flexGrow="1">
        <Text size="2">Word-wrap</Text>
        <Switch
          size="1"
          checked={state?.wordWrap === 'on'}
          onCheckedChange={(checked) =>
            setState({ wordWrap: checked ? 'on' : 'off' })
          }
        />
      </Label>
    </Flex>
  )
}
