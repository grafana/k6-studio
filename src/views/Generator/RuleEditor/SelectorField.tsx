import { Box, Code, Flex, Inset, Text, TextField } from '@radix-ui/themes'
import * as monaco from 'monaco-editor'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'

import { ControlledSelect, FieldGroup } from '@/components/Form'
import { ReadOnlyEditor } from '@/components/Monaco/ReadOnlyEditor'
import type { Selector, TestRule } from '@/types/rules'
import { exhaustive } from '@/utils/typescript'

import { HeaderSelect } from './HeaderSelect'
import { allowedSelectorMap, fromOptions } from './SelectorField.constants'

export function SelectorField({
  field,
}: {
  field: 'extractor.selector' | 'replacer.selector' | 'selector'
}) {
  const {
    watch,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<TestRule>()
  const selector = watch(field)

  if (!selector) {
    return null
  }

  const allowedSelectors =
    field === 'extractor.selector'
      ? allowedSelectorMap.extractor
      : allowedSelectorMap.replacer

  const handleFromChange = (value: Selector['from']) => {
    // When "from" changes reset type to the first allowed type if the current type is not allowed
    if (!allowedSelectors[value].find(({ value }) => value === selector.type)) {
      handleTypeChange('begin-end')
    }

    setValue(`${field}.from`, value)
  }

  const handleTypeChange = (value: Selector['type']) => {
    switch (value) {
      case 'begin-end':
        setValue(field, {
          type: value,
          begin: '',
          end: '',
          from: selector.from,
        })
        break
      case 'regex':
        setValue(field, {
          type: value,
          regex: '',
          from: selector.from,
        })
        break
      case 'json':
        setValue(field, {
          type: value,
          from: 'body',
          path: '',
        })
        break
      case 'header-name':
        setValue(field, {
          type: value,
          name: '',
          from: 'headers',
        })
        break

      case 'text':
        setValue(field, {
          type: value,
          from: selector.from,
          value: '',
        })
        break
      default:
        return exhaustive(value)
    }
  }

  return (
    <>
      <Flex gap="2" wrap="wrap">
        <Box flexGrow="1">
          <FieldGroup label="Target" name={`${field}.from`} errors={errors}>
            <ControlledSelect
              control={control}
              name={`${field}.from`}
              options={fromOptions}
              onChange={handleFromChange}
            />
          </FieldGroup>
        </Box>

        <Box flexGrow="1">
          <FieldGroup label="Type" name={`${field}.type`} errors={errors}>
            <ControlledSelect
              control={control}
              name={`${field}.type`}
              options={allowedSelectors[selector.from]}
              onChange={handleTypeChange}
            />
          </FieldGroup>
        </Box>
      </Flex>
      <SelectorContent selector={selector} field={field} />
    </>
  )
}

const snippet = `{
  "user": {
    "name": "John",
    "hobbies": ["hiking", "fishing", "jogging"]
  }
}`

function JSONHint() {
  const [editor, setEditor] =
    useState<monaco.editor.IStandaloneCodeEditor | null>(null)

  // TODO: think is this is usable, create layout shift when opening popover
  // editor?.onDidChangeModelDecorations(() => {
  // updateEditorHeight() // typing
  // requestAnimationFrame(updateEditorHeight) // folding
  // })

  let prevHeight = 0

  const _updateEditorHeight = () => {
    const editorElement = editor?.getDomNode()

    if (!editor || !editorElement) {
      return
    }

    const lineHeight = editor.getOption(monaco.editor.EditorOption.lineHeight)
    const lineCount = editor.getModel()?.getLineCount() || 1
    const height = editor.getTopForLineNumber(lineCount + 1) + lineHeight

    if (prevHeight !== height) {
      prevHeight = height
      editorElement.style.height = `${height + 10}px`
      editor.layout()
    }
  }
  return (
    <Box>
      <Text size="1">
        Use dot and bracket notation to navigate JSON objects and extract
        values.
      </Text>
      <Text size="1">
        <Box>
          <Inset>
            <Box
              css={{
                margin: 'var(--space-4) 0',
                borderTop: '1px solid var(--gray-3)',
                borderBottom: '1px solid var(--gray-3)',
              }}
            >
              <Box height="120px">
                <ReadOnlyEditor
                  value={snippet}
                  language="json"
                  showToolbar={false}
                  onMount={setEditor}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    lineNumbers: 'off',
                    folding: false,
                    contextmenu: false,
                    scrollbar: {
                      vertical: 'hidden',
                      horizontal: 'hidden',
                    },
                    renderLineHighlight: 'none',
                    overviewRulerLanes: 0,
                    // renderIndentGuides: false, // TODO: check if this is needed
                    wordWrap: 'on',
                    padding: {
                      top: 5,
                      bottom: 5,
                    },
                  }}
                />
              </Box>
            </Box>
          </Inset>
        </Box>
        <Box>
          <Text as="p" size="1" mb="1">
            Use dot path to access nested values: <Code>user.name</Code> {'->'}{' '}
            <Code>John</Code>
          </Text>
          <Text as="p" size="1">
            Use brackets to access array elements: <Code>user.hobbies[1]</Code>{' '}
            {'->'} <Code>fishing</Code>
          </Text>
        </Box>
      </Text>
    </Box>
  )
}

function SelectorContent({
  selector,
  field,
}: {
  selector: Selector
  field: 'extractor.selector' | 'replacer.selector' | 'selector'
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext<TestRule>()

  const hint = JSONHint()
  switch (selector.type) {
    case 'json':
      return (
        <FieldGroup
          name={`${field}.path`}
          errors={errors}
          label="JSON path"
          hint={hint}
        >
          <TextField.Root {...register(`${field}.path`)} id={`${field}.path`} />
        </FieldGroup>
      )
    case 'begin-end':
      return (
        <>
          <FieldGroup
            name={`${field}.begin`}
            errors={errors}
            label="Begin"
            hint="The string immediately before the value to be extracted"
          >
            <TextField.Root {...register(`${field}.begin`)} />
          </FieldGroup>
          <FieldGroup
            name={`${field}.end`}
            errors={errors}
            label="End"
            hint="The string immediately after the value to be extracted"
          >
            <TextField.Root {...register(`${field}.end`)} />
          </FieldGroup>
        </>
      )
    case 'regex':
      return (
        <FieldGroup name={`${field}.regex`} errors={errors} label="Regex">
          <TextField.Root {...register(`${field}.regex`)} />
        </FieldGroup>
      )
    case 'header-name':
      return <HeaderSelect field={field} />

    case 'text':
      if (field !== 'extractor.selector') {
        return (
          <FieldGroup
            name={`${field}.value`}
            errors={errors}
            label="Text"
            hint="Exact text match to be replaced"
          >
            <TextField.Root {...register(`${field}.value`)} />
          </FieldGroup>
        )
      }
      return null

    default:
      return exhaustive(selector)
  }
}
