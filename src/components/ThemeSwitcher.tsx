import { useTheme } from '@/hooks/useTheme'
import { MoonIcon, SunIcon } from '@radix-ui/react-icons'
import { IconButton, Tooltip } from '@radix-ui/themes'

export function ThemeSwitcher() {
  const theme = useTheme()
  const isDev = process.env.NODE_ENV === 'development'

  if (!isDev) {
    return null
  }

  const handleClick = () => {
    window.studio.ui.toggleTheme()
  }

  return (
    <Tooltip content="Change theme" side="right">
      <IconButton
        onClick={handleClick}
        variant="ghost"
        color="gray"
        aria-label="Change theme"
      >
        {theme === 'light' ? <SunIcon /> : <MoonIcon />}
      </IconButton>
    </Tooltip>
  )
}
