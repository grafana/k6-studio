import { css } from '@emotion/react'
import { Code } from '@radix-ui/themes'
import { useMemo } from 'react'
import { useFormContext } from 'react-hook-form'

import { ControlledSelect, FieldGroup } from '@/components/Form'
import { useGeneratorStore } from '@/store/generator'
import { ParameterizationRule } from '@/types/rules'
import { useDataFilePreview } from '@/views/DataFile/DataFile.hooks'

export function FileSelect() {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext<ParameterizationRule>()

  const fileName = watch('value.fileName')
  const propertyName = watch('value.propertyName')
  const files = useGeneratorStore((store) => store.files)
  const { data: preview, isLoading } = useDataFilePreview(fileName)

  const fileOptions = useMemo(() => {
    return files.map((file) => ({
      value: file.name,
      label: (
        <Code size="2" truncate variant="ghost">
          {file.name}
        </Code>
      ),
    }))
  }, [files])

  const propsOptions = useMemo(() => {
    if (!preview) {
      return []
    }

    return preview.props.map((prop) => ({
      value: prop,
      label: (
        <Code
          size="2"
          truncate
          variant="ghost"
          css={css`
            flex-shrink: 0;
          `}
        >
          {prop}
        </Code>
      ),
    }))
  }, [preview])

  return (
    <>
      <FieldGroup name="value.fileName" errors={errors} label="Data file">
        <ControlledSelect
          options={fileOptions}
          control={control}
          name="value.fileName"
          selectProps={{
            // Automatically open the select when switching to data file value type
            // in new parameterization rule
            defaultOpen: !fileName,
          }}
          contentProps={{
            css: { maxWidth: 'var(--radix-select-trigger-width)' },
            position: 'popper',
          }}
        />
      </FieldGroup>
      <FieldGroup
        name="value.propertyName"
        errors={errors}
        label="Property name"
      >
        <ControlledSelect
          options={propsOptions || []}
          control={control}
          name="value.propertyName"
          selectProps={{
            disabled: isLoading,
            // Automatically open the select when selecting data file
            // in new parameterization rule
            defaultOpen: !!fileName && !propertyName,
          }}
          contentProps={{
            css: { maxWidth: 'var(--radix-select-trigger-width)' },
            position: 'popper',
          }}
        />
      </FieldGroup>
    </>
  )
}
