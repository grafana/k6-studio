import { useFormContext } from 'react-hook-form'

import { FieldGroup } from '@/components/Form'
import { ControlledRadioGroup } from '@/components/Form/ControllerRadioGroup'
import { LoadProfileExecutorOptions } from '@/types/testOptions'

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
      <ControlledRadioGroup
        name="executor"
        control={control}
        options={options}
      />
    </FieldGroup>
  )
}
