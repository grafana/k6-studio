import { BrowserEvent } from '@/schemas/recording'
import { exhaustive } from '@/utils/typescript'
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
} from '@radix-ui/react-icons'

interface EventIconProps {
  event: BrowserEvent
}

export function EventIcon({ event }: EventIconProps) {
  switch (event.type) {
    case 'navigated-to-page':
      return <GlobeIcon />

    case 'reloaded-page':
      return <UpdateIcon />

    case 'clicked':
      return <TargetIcon />

    case 'input-changed':
      return <InputIcon />

    case 'check-changed':
      return event.checked ? <CheckCircledIcon /> : <CircleIcon />

    case 'radio-changed':
      return <RadiobuttonIcon />

    case 'select-changed':
      return <DropdownMenuIcon />

    case 'form-submitted':
      return <ReaderIcon />

    default:
      return exhaustive(event)
  }
}
