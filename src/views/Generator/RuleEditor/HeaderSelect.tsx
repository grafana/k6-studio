import { useMemo } from 'react'
import { useFormContext } from 'react-hook-form'

import { FieldGroup } from '@/components/Form'
import { ControlledReactSelect } from '@/components/Form/ControlledReactSelect'
import { selectFilteredRequests, useGeneratorStore } from '@/store/generator'
import { TestRule } from '@/types/rules'

import { useHeaderOptions } from './HeaderSelect.hooks'

export function HeaderSelect({
  field,
}: {
  field: 'extractor.selector' | 'replacer.selector' | 'selector'
}) {
  const {
    watch,
    control,
    formState: { errors },
  } = useFormContext<TestRule>()
  const requests = useGeneratorStore(selectFilteredRequests)

  const filterField = useMemo(() => {
    if (field === 'extractor.selector') {
      return 'extractor.filter'
    }
    if (field === 'replacer.selector') {
      return 'replacer.filter'
    }
    return 'filter'
  }, [field])

  const filter = watch(filterField)
  const extractFrom = field === 'extractor.selector' ? 'response' : 'request'
  const options = useHeaderOptions(requests, extractFrom, filter)

  return (
    <FieldGroup name={`${field}.name`} errors={errors} label="Name">
      <ControlledReactSelect
        name={`${field}.name`}
        control={control}
        options={options}
      />
    </FieldGroup>
  )
}
