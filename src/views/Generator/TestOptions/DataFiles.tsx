import { FieldGroup } from '@/components/Form'
import { TestDataSchema } from '@/schemas/generator'
import { useGeneratorStore } from '@/store/generator'
import { useStudioUIStore } from '@/store/ui'
import { TestData } from '@/types/testData'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckboxGroup, Text, Tooltip } from '@radix-ui/themes'
import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'

export function DataFiles() {
  const availableFiles = useStudioUIStore((store) => store.dataFiles)
  const files = useGeneratorStore((store) => store.files)
  const setFiles = useGeneratorStore((store) => store.setFiles)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Pick<TestData, 'files'>>({
    resolver: zodResolver(TestDataSchema.pick({ files: true })),
    shouldFocusError: false,
    defaultValues: {
      files,
    },
  })

  const options = [...availableFiles.values()].map((file) => ({
    label: file.displayName,
    value: file.fileName,
    inUse: files.some(({ name }) => name === file.fileName),
  }))
  const value = watch('files').map(({ name }) => name)

  const onSubmit = useCallback(
    (data: Pick<TestData, 'files'>) => {
      setFiles(data.files)
    },
    [setFiles]
  )

  // Submit onChange
  useEffect(() => {
    const subscription = watch(() => handleSubmit(onSubmit)())
    return () => subscription.unsubscribe()
  }, [watch, handleSubmit, onSubmit])

  const handleChange = (value: string[]) => {
    setValue(
      'files',
      value.map((fileName) => ({
        name: fileName,
      }))
    )
  }

  const filesField = register('files')

  return (
    <div>
      <Text size="2" as="p" mb="2">
        Make your test more realistic and prevent server-side caching from
        affecting your results by using data files.
      </Text>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup name="files" label="Files" errors={errors}>
          <CheckboxGroup.Root
            value={value}
            onValueChange={handleChange}
            onBlur={filesField.onBlur}
            ref={filesField.ref}
          >
            {options.map((option) => (
              <Tooltip
                content="File is referenced in a rule"
                key={option.value}
                hidden={!option.inUse}
              >
                <CheckboxGroup.Item
                  value={option.value}
                  disabled={option.inUse}
                >
                  {option.label}
                </CheckboxGroup.Item>
              </Tooltip>
            ))}
          </CheckboxGroup.Root>
        </FieldGroup>
      </form>
    </div>
  )
}
