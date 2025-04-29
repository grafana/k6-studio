import { zodResolver } from '@hookform/resolvers/zod'
import { Text, Button, Switch, Flex, Callout, Tooltip } from '@radix-ui/themes'
import { CircleXIcon } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import {
  FormProvider,
  useForm,
  useFieldArray,
  useFormContext,
} from 'react-hook-form'

import { ExternalLink } from '@/components/ExternalLink'
import { FieldGroup } from '@/components/Form'
import { Table } from '@/components/Table'
import { LoadZoneSchema } from '@/schemas/generator/v1/loadZone'
import { useGeneratorStore } from '@/store/generator/useGeneratorStore'
import { LoadZoneData } from '@/types/testOptions'

import { LoadZoneRow } from './LoadZoneRow'
import {
  findUnusedLoadZone,
  getRemainingPercentage,
  LOAD_ZONES_REGIONS_OPTIONS,
} from './LoadZones.utils'

export function LoadZones() {
  const loadZones = useGeneratorStore((store) => store.loadZones)
  const setLoadZones = useGeneratorStore((store) => store.setLoadZones)

  const formMethods = useForm<LoadZoneData>({
    resolver: zodResolver(LoadZoneSchema),
    shouldFocusError: false,
    defaultValues: loadZones,
  })

  const {
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = formMethods

  const { append, remove, fields } = useFieldArray<LoadZoneData>({
    control,
    name: 'zones',
  })

  const { distribution, zones: usedLoadZones } = watch()

  function handleAddLoadZone(event: React.MouseEvent) {
    event.preventDefault()

    append({
      id: crypto.randomUUID(),
      loadZone: findUnusedLoadZone(usedLoadZones),
      percent: getRemainingPercentage(usedLoadZones),
    })
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

  // evenly distribute load zones if distribution is set to "even"
  useEffect(() => {
    if (distribution !== 'even') return

    const basePercent = Math.floor(100 / fields.length)
    const remainder = 100 % fields.length

    fields.forEach((_, index) => {
      // ensure only integers are used
      const percent = index < remainder ? basePercent + 1 : basePercent
      setValue(`zones.${index}.percent`, percent)
    })
  }, [distribution, fields, setValue])

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Text size="2" as="p" mb="4">
          Configure the geographical zones that the load test should be run
          from. Learn more about load zones in the{' '}
          <ExternalLink href="https://grafana.com/docs/grafana-cloud/testing/k6/author-run/use-load-zones/">
            docs
          </ExternalLink>
          . Load zones configuration only affects tests running in the cloud.
        </Text>

        <FieldGroup
          name="distribution"
          label="Distribution"
          errors={errors}
          width="130px"
        >
          <Text size="2" as="label">
            <Flex gap="2" align="center">
              Even
              <Switch
                name="distribution"
                checked={distribution === 'manual'}
                onCheckedChange={(checked) => {
                  setValue('distribution', checked ? 'manual' : 'even')
                }}
              />
              Manual
            </Flex>
          </Text>
        </FieldGroup>

        {errors.zones?.root && <LoadZonePercentageError />}

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
            {fields.map((field, index) => (
              <LoadZoneRow
                key={field.id}
                field={field}
                index={index}
                remove={remove}
              />
            ))}

            <Table.Row>
              <Table.RowHeaderCell colSpan={7} justify="center">
                <Tooltip
                  content="All available load zones are already in use"
                  hidden={fields.length !== LOAD_ZONES_REGIONS_OPTIONS.length}
                >
                  <Button
                    variant="ghost"
                    onClick={handleAddLoadZone}
                    disabled={
                      fields.length === LOAD_ZONES_REGIONS_OPTIONS.length
                    }
                  >
                    Add new load zone
                  </Button>
                </Tooltip>
              </Table.RowHeaderCell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </form>
    </FormProvider>
  )
}

function LoadZonePercentageError() {
  const {
    formState: { errors },
  } = useFormContext<LoadZoneData>()

  return (
    <Callout.Root variant="soft" color="tomato" mb="3">
      <Callout.Icon>
        <CircleXIcon />
      </Callout.Icon>

      <Callout.Text>{errors.zones?.root?.message}</Callout.Text>
    </Callout.Root>
  )
}
