import {
  CircleCheckIcon,
  CircleDotIcon,
  CircleIcon,
  ClipboardListIcon,
  EyeIcon,
  GlobeIcon,
  ListFilterPlusIcon,
  RefreshCwIcon,
  TargetIcon,
  TextCursorInputIcon,
} from 'lucide-react'

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
      return <RefreshCwIcon />

    case 'click':
      return <TargetIcon />

    case 'input-change':
      return <TextCursorInputIcon />

    case 'check-change':
      return event.checked ? <CircleCheckIcon /> : <CircleIcon />

    case 'radio-change':
      return <CircleDotIcon />

    case 'select-change':
      return <ListFilterPlusIcon />

    case 'submit-form':
      return <ClipboardListIcon />

    case 'assert':
      return <EyeIcon />

    default:
      return exhaustive(event)
  }
}
