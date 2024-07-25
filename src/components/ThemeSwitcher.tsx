import { useTheme } from '@/hooks/useTheme'
import { MoonIcon, SunIcon } from '@radix-ui/react-icons'
import { IconButton } from '@radix-ui/themes'

export function ThemeSwitcher() {
  const theme = useTheme()

  const handleClick = () => {
    window.studio.ui.toggleTheme()
  }

  return (
    <IconButton onClick={handleClick} variant="ghost" aria-label="Change theme">
      {theme === 'light' ? <SunIcon /> : <MoonIcon />}
    </IconButton>
  )
}
