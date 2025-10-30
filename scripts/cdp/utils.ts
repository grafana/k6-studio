import * as cdp from './types/protocol'

export function camelCase(input: string) {
  if (input === 'IO' || input === 'PWA' || input === 'CSS') {
    return input.toLocaleLowerCase()
  }

  if (input.startsWith('DOM')) {
    return 'dom' + input.slice(3)
  }

  const first = input.slice(0, 1).toLowerCase()
  const rest = input.slice(1)

  return first + rest
}

export function pascalCase(input: string) {
  const first = input.slice(0, 1).toUpperCase()
  const rest = input.slice(1)

  return first + rest
}

export function toEventTypeName(event: cdp.Event): string {
  return pascalCase(event.name) + 'Event'
}

export function toArgInterfaceName(command: cdp.Command) {
  return pascalCase(command.name) + 'Args'
}

export function toResultTypeName(command: cdp.Command) {
  return pascalCase(command.name) + 'Result'
}
