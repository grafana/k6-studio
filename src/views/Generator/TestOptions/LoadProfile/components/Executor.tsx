import { ControlledSelect, FieldGroup } from '@/components/Form'
import { LoadProfileExecutorOptions } from '@/types/testOptions'
import { useFormContext } from 'react-hook-form'

const EXECUTOR_LABEL_MAP: Record<
  LoadProfileExecutorOptions['executor'],
  string
> = {
  'ramping-vus': 'Ramping VUs',
  'shared-iterations': 'Shared iterations',
}

const options = Object.entries(EXECUTOR_LABEL_MAP).map(([value, label]) => ({
  label,
  value,
}))

export function Executor() {
  const {
    control,
    formState: { errors },
  } = useFormContext()

  return (
    <FieldGroup label="Executor" errors={errors} name="executor">
      <ControlledSelect
        name="executor"
        control={control}
        options={options}
        selectProps={{ size: '2' }}
      />
    </FieldGroup>
  )
}