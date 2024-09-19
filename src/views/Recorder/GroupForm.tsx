import { FieldGroup } from '@/components/Form'
import { ProxyData } from '@/types'
import { Button, Flex, TextField } from '@radix-ui/themes'
import { useCallback } from 'react'
import { useForm, UseFormHandleSubmit } from 'react-hook-form'

type FormValues<T> = T extends UseFormHandleSubmit<infer V> ? V : never

interface GroupFormProps {
  currentGroup: string
  proxyData: ProxyData[]
  onChange: (value: string) => void
}

export function GroupForm({
  currentGroup = '',
  proxyData,
  onChange,
}: GroupFormProps) {
  const {
    formState: { errors, isValid },
    setValue,
    register,
    handleSubmit,
  } = useForm({
    defaultValues: {
      name: '',
    },
    mode: 'onChange',
  })

  const submit = useCallback(
    (e: FormValues<typeof handleSubmit>) => {
      onChange(e.name)
      setValue('name', '')
    },
    [setValue, onChange]
  )

  const isValidGroupName = (name: string) => {
    if (name.trim().length === 0) {
      return false
    }

    const exists =
      name === currentGroup || proxyData.some((data) => data.group === name)

    if (exists) {
      return 'Group already exists.'
    }

    return undefined
  }

  return (
    <Flex direction="column" width="200px" asChild>
      <form onSubmit={handleSubmit(submit)}>
        <FieldGroup name="name" errors={errors}>
          <TextField.Root
            id="name"
            placeholder="Group name"
            {...register('name', {
              validate(values) {
                return isValidGroupName(values)
              },
            })}
          />
        </FieldGroup>

        <Button type="submit" disabled={!isValid}>
          Set group
        </Button>
      </form>
    </Flex>
  )
}
