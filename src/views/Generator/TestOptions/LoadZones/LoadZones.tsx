import { LoadZoneSchema } from '@/schemas/generator/v1/loadZone'
import { useGeneratorStore } from '@/store/generator/useGeneratorStore'
import { LoadZoneData } from '@/types/testOptions'
import { zodResolver } from '@hookform/resolvers/zod'
import { Table, Text, Link as RadixLink, Button } from '@radix-ui/themes'
import { useCallback, useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

export function LoadZones() {
  const { distribution, loadZones } = useGeneratorStore(
    (store) => store.loadZones
  )
  const setLoadZones = useGeneratorStore((store) => store.setLoadZones)

  const formMethods = useForm<LoadZoneData>({
    resolver: zodResolver(LoadZoneSchema),
    shouldFocusError: false,
    defaultValues: {
      distribution,
      loadZones,
    },
  })

  const { handleSubmit, watch } = formMethods

  const handleOpenDocs = (event: React.MouseEvent) => {
    event.preventDefault()
    return window.studio.browser.openExternalLink(
      'https://grafana.com/docs/grafana-cloud/testing/k6/author-run/use-load-zones/'
    )
  }

  function handleAddLoadZone() {
    // TODO: Implement
  }

  const onSubmit = useCallback(
    (data: LoadZoneData) => {
      setLoadZones(data)
    },
    [setLoadZones]
  )

  // Submit onChange
  useEffect(() => {
    const subscription = watch(() => handleSubmit(onSubmit)())
    return () => subscription.unsubscribe()
  }, [watch, handleSubmit, onSubmit])

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Text size="2" as="p" mb="4">
          Configure the geographical zones that the load test should be run
          from. Learn more about load zones in the{' '}
          <RadixLink href="" onClick={handleOpenDocs}>
            docs
          </RadixLink>
          .
        </Text>
        <Table.Root size="1" variant="surface" layout="fixed">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell width="60%">
                Load Zone
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width="30%">
                Distribution
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width="10%"></Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            <Table.Row>
              <Table.RowHeaderCell colSpan={7} justify="center">
                <Button variant="ghost" onClick={handleAddLoadZone}>
                  Add new load zone
                </Button>
              </Table.RowHeaderCell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </form>
    </FormProvider>
  )
}
