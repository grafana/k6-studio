import { BrowserEvent } from '@/schemas/recording'
import { exhaustive } from '@/utils/typescript'
import { FaceIcon } from '@radix-ui/react-icons'
import { Flex, Table } from '@radix-ui/themes'

interface EventIconProps {
  event: BrowserEvent
}

function EventIcon({ event }: EventIconProps) {
  switch (event.type) {
    case 'dummy':
      return <FaceIcon />

    default:
      return exhaustive(event.type)
  }
}

interface EventDescriptionProps {
  event: BrowserEvent
}

function EventDescription({ event }: EventDescriptionProps) {
  switch (event.type) {
    case 'dummy':
      return (
        <span>
          This is a <strong>dummy</strong> event fired at an interval.
        </span>
      )

    default:
      return exhaustive(event.type)
  }
}

interface BrowserEventLogProps {
  events: BrowserEvent[]
}

export function BrowserEventLog({ events }: BrowserEventLogProps) {
  return (
    <div>
      <Table.Root>
        <Table.Body>
          {events.map((event) => {
            return (
              <Table.Row key={event.eventId}>
                <Table.Cell>
                  <Flex as="span" align="center" gap="2">
                    <EventIcon event={event} />{' '}
                    <EventDescription event={event} />
                  </Flex>
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table.Root>
    </div>
  )
}
