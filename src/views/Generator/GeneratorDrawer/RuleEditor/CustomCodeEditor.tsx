import { Container, Flex, Select, Text } from '@radix-ui/themes'
import * as Label from '@radix-ui/react-label'

import { CustomCodeRule } from '@/schemas/rules'
import { FilterField } from './FilterField'
import { CodeEditor } from '@/components/CodeEditor'

interface CustomCodeEditorProps {
  rule: CustomCodeRule
  onChangeRule: (rule: CustomCodeRule) => void
}
export function CustomCodeEditor({
  rule,
  onChangeRule,
}: CustomCodeEditorProps) {
  return (
    <Container align="left" size="1" p="2" height="100%" maxHeight="100%">
      <Flex gap="2">
        <FilterField
          filter={rule.filter}
          onChange={(filter) => onChangeRule({ ...rule, filter })}
        />
        <Flex direction="column">
          <Label.Root>Placement</Label.Root>
          <Select.Root
            value={rule.placement}
            onValueChange={(value) =>
              onChangeRule({
                ...rule,
                placement: value as CustomCodeRule['placement'],
              })
            }
          >
            <Select.Trigger />
            <Select.Content>
              <Select.Item value="before">Before request</Select.Item>
              <Select.Item value="after">After request</Select.Item>
            </Select.Content>
          </Select.Root>
        </Flex>
      </Flex>

      <div
        style={{
          height: 200,
        }}
      >
        <Text>Snippet</Text>
        <CodeEditor
          value={rule.snippet}
          onChange={(value = '') => {
            onChangeRule({ ...rule, snippet: value })
          }}
        />
      </div>
    </Container>
  )
}
