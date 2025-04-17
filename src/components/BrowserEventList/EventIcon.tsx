import {
  GlobeIcon,
  UpdateIcon,
  TargetIcon,
  InputIcon,
  CheckCircledIcon,
  CircleIcon,
  RadiobuttonIcon,
  DropdownMenuIcon,
  ReaderIcon,
  EyeOpenIcon,
} from '@radix-ui/react-icons'

import { BrowserEvent } from '@/schemas/recording'
import { exhaustive } from '@/utils/typescript'

interface EventIconProps {
  event: BrowserEvent
}

export function EventIcon({ event }: EventIconProps) {
  switch (event.type) {
    case 'navigate-to-page':
      return <GlobeIcon />

    case 'reload-page':
      return <UpdateIcon />

    case 'click':
      return <TargetIcon />

    case 'input-change':
      return <InputIcon />

    case 'check-change':
      return event.checked ? <CheckCircledIcon /> : <CircleIcon />

    case 'radio-change':
      return <RadiobuttonIcon />

    case 'select-change':
      return <DropdownMenuIcon />

    case 'submit-form':
      return <ReaderIcon />

    case 'assert':
      return <EyeOpenIcon />

    default:
      return exhaustive(event)
  }
}
