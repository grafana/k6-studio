import { ThresholdDataSchema } from '@/schemas/generator'
import { useGeneratorStore } from '@/store/generator'
import { Threshold, ThresholdData } from '@/types/thresholds'
import { css } from '@emotion/react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  Table,
  Button,
  Text,
  Link as RadixLink,
} from '@radix-ui/themes'
import { useCallback, useEffect } from 'react'
import { useForm, useFieldArray, FormProvider } from 'react-hook-form'
import { ThresholdRow } from './ThresholdRow'
import { uniqueId } from 'lodash-es'

type ThresholdsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ThresholdsDialog({
  open,
  onOpenChange,
}: ThresholdsDialogProps) {
  const thresholds = useGeneratorStore((store) => store.thresholds)

  const formMethods = useForm<{ thresholds: Threshold[] }>({
    resolver: zodResolver(ThresholdDataSchema),
    shouldFocusError: false,
    defaultValues: {
      thresholds,
    },
  })

  const { handleSubmit, control, watch } = formMethods

  const handleOpenDocs = () =>
    window.studio.browser.openExternalLink(
      'https://grafana.com/docs/k6/latest/using-k6/thresholds/'
    )

  const { append, remove, fields } = useFieldArray<ThresholdData>({
    control,
    name: 'thresholds',
  })

  function handleAddThreshold(event: React.MouseEvent) {
    event.preventDefault()

    append({
      id: uniqueId(),
      url: '*',
      metric: 'http_req_duration',
      statistic: 'avg',
      condition: '>',
      value: 0,
      stopTest: false,
    })
  }

  const onSubmit = useCallback((data: ThresholdData) => {
    console.log('onSubmit', data)
  }, [])

  // Submit onChange
  useEffect(() => {
    const subscription = watch(() => handleSubmit(onSubmit)())
    return () => subscription.unsubscribe()
  }, [watch, handleSubmit, onSubmit])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        maxWidth="950px"
        maxHeight="640px"
        width="calc(100vw - 100px)"
        height="calc(100vh - 100px)"
        css={css`
          overflow: hidden;
          display: flex;
          flex-direction: column;
        `}
      >
        <Dialog.Title>Thresholds</Dialog.Title>
        <FormProvider {...formMethods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Text size="2" as="p" mb="4">
              Thresholds are global pass/fail criteria that you can configure k6
              to use, that can act on any result metrics. Read more about
              thresholds in the{' '}
              <RadixLink href="" onClick={handleOpenDocs}>
                docs
              </RadixLink>
              .
            </Text>
            <Table.Root size="1" variant="surface">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell width="25%">
                    Metric
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell width="20%">
                    URL
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Statistic</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Condition</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Value</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Stop test</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell width="0"></Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {fields.map((field, index) => (
                  <ThresholdRow
                    key={field.id}
                    field={field}
                    index={index}
                    remove={remove}
                  />
                ))}

                <Table.Row>
                  <Table.RowHeaderCell colSpan={7} justify="center">
                    <Button variant="ghost" onClick={handleAddThreshold}>
                      Add threshold
                    </Button>
                  </Table.RowHeaderCell>
                </Table.Row>
              </Table.Body>
            </Table.Root>
          </form>
        </FormProvider>
      </Dialog.Content>
    </Dialog.Root>
  )
}
