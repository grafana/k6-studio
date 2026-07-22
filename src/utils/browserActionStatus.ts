export type ActionStatus =
  | 'pending'
  | 'running'
  | 'pass'
  | 'fail'
  | 'error'
  | 'aborted'
  | 'unknown'

export function getStatusColor(
  status: ActionStatus,
  scale: 9 | 11 = 11
): string {
  switch (status) {
    case 'pass':
      return `var(--green-${scale})`

    case 'fail':
    case 'error':
      return `var(--red-${scale})`

    case 'aborted':
      return `var(--orange-${scale})`

    case 'running':
      return `var(--gray-${scale})`

    case 'unknown':
    case 'pending':
      return `transparent`
  }
}
