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

interface ExecutorProps {
  executors: ReadonlyArray<LoadProfileExecutorOptions['executor']>
}

export function Executor({ executors }: ExecutorProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext()

  const options = executors.map((value) => ({
    label: EXECUTOR_LABEL_MAP[value],
    value,
  }))

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
