import { Box, Button, Flex, Table } from '@radix-ui/themes'

import { Stage } from './Stage'
import { useGeneratorStore } from '@/store/generator'
import { RampingStage } from '@/types/testOptions'

interface VUStagesProps {
  stages: RampingStage[]
}

export function VUStages({ stages = [] }: VUStagesProps) {
  const { addStage } = useGeneratorStore()

  return (
    <Flex direction="column" gap="2">
      <Table.Root size="1" variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Target VUs</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Duration</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {stages.map((stage, index) => (
            <Table.Row key={index}>
              <Stage
                key={index}
                index={index}
                target={stage.target}
                duration={stage.duration}
              />
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      <Box p="2">
        <Button variant="ghost" onClick={() => addStage()}>
          Add new stage
        </Button>
      </Box>
    </Flex>
  )
}
