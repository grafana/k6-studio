import { PersonIcon } from '@radix-ui/react-icons'
import { NavIconButton } from './NavIconButton'
import { routeMap } from '@/routeMap'

export function Profile() {
  return (
    <NavIconButton
      icon={<PersonIcon width="32px" height="32px" />}
      tooltip="Profile"
      to={routeMap.profile}
    />
  )
}
