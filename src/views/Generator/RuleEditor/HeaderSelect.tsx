import { ControlledSelect, FieldGroup } from '@/components/Form'
import { useFormContext } from 'react-hook-form'
import { Filter, TestRule } from '@/types/rules'
import { selectFilteredRequests, useGeneratorStore } from '@/store/generator'
import { matchFilter } from '@/rules/utils'
import { ControlledReactSelect } from '@/components/Form/ControlledReactSelect'
import { ProxyData, Request, Response } from '@/types'
import { useMemo } from 'react'
import { sortBy } from 'lodash-es'

function useUniqueHeaderNames(
  requests: ProxyData[],
  extractFrom: 'request' | 'response'
) {
  const responseHeaders = requests.flatMap(
    (request) => request?.[extractFrom]?.headers ?? []
  )
  return Array.from(new Set(responseHeaders.map((header) => header[0])))
}

function useHeaderOptions(
  recording: ProxyData[],
  extractFrom: 'request' | 'response',
  filter: Filter
) {
  return useMemo(() => {
    const filteredRequests = recording.filter((entry) =>
      matchFilter(entry.request, filter)
    )

    const responseHeaders = filteredRequests.flatMap(
      (request) => request?.[extractFrom]?.headers ?? []
    )
    const uniqueHeaderNames = Array.from(
      new Set(responseHeaders.map((header) => header[0]))
    )

    return uniqueHeaderNames.sort().map((headerName) => ({
      value: headerName,
      label: headerName,
    }))
  }, [recording, extractFrom, filter])
}

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
