import { Text } from '@radix-ui/themes'

export function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <Text color="red" size="1">
      {children}
    </Text>
  )
}
