import { DropdownMenu, Flex, IconButton, Tooltip } from '@radix-ui/themes'
import {
  CircleCheckBigIcon,
  DownloadIcon,
  EllipsisVerticalIcon,
  SaveIcon,
  WandSparklesIcon,
} from 'lucide-react'
import { useRef, useState } from 'react'

import { ButtonWithTooltip } from '@/components/ButtonWithTooltip'
import { GrafanaIcon } from '@/components/icons/GrafanaIcon'
import { TITLE_GROUP_MIN_WIDTH } from '@/components/Layout/ViewHeading'
import { RunInCloudDialog } from '@/components/RunInCloudDialog/RunInCloudDialog'
import { useDeleteFile } from '@/hooks/useDeleteFile'
import { useElementWidth } from '@/hooks/useElementWidth'
import { useProxyStatus } from '@/hooks/useProxyStatus'
import { ScriptPreview } from '@/hooks/useScriptPreview'
import { useGeneratorStore } from '@/store/generator'
import { StudioFile } from '@/types'

import { useScriptExport } from '../Generator.hooks'
import { ValidatorDialog } from '../ValidatorDialog'

import {
  getConfigureTooltip,
  getValidateTooltip,
} from './GeneratorControls.utils'

// The header row (ViewHeading) is the container. Labels collapse in two
// stages as it tightens; between stages the toolbar holds its min-width so
// the file name truncates down to its floor first.
//
// The widths are measured from rendered content, not the window: a breakpoint
// is the labels' width plus the title floor and row chrome. Changing the
// minimum window size needs no retuning here; the only invariant is that the
// narrowest possible row (min window minus activity bar and max sidebar)
// stays at or above the fully collapsed floor
// (COLLAPSED_ROW_WIDTH + TITLE_GROUP_MIN_WIDTH).
const ACTION_LABELS_WIDTH = 620
const RUN_LABEL_WIDTH = 330
const COLLAPSED_ROW_WIDTH = 240
// The header row's padding and the gaps around the two groups.
const ROW_CHROME_WIDTH = 40

const whenActionsCollapse = `@container (max-width: ${ACTION_LABELS_WIDTH + TITLE_GROUP_MIN_WIDTH + ROW_CHROME_WIDTH - 1}px)`
const whenRunCollapses = `@container (max-width: ${RUN_LABEL_WIDTH + TITLE_GROUP_MIN_WIDTH + ROW_CHROME_WIDTH - 1}px)`

const toolbarStageStyles = {
  flex: '1 1 0',
  minWidth: ACTION_LABELS_WIDTH,
  [whenActionsCollapse]: { minWidth: RUN_LABEL_WIDTH },
  [whenRunCollapses]: { minWidth: COLLAPSED_ROW_WIDTH },
}

const actionLabelStyles = {
  [whenActionsCollapse]: { display: 'none' },
}

interface GeneratorControlsProps {
  file: StudioFile
  onSave: () => void
  onConfigureWithAssistant: () => void
  isDirty: boolean
  script: ScriptPreview
}

export function GeneratorControls({
  file,
  onSave,
  onConfigureWithAssistant,
  isDirty,
  script,
}: GeneratorControlsProps) {
  const [isValidatorDialogOpen, setIsValidatorDialogOpen] = useState(false)
  const [isRunInCloudDialogOpen, setIsRunInCloudDialogOpen] = useState(false)
  const proxyStatus = useProxyStatus()
  const isScriptExportable = script.valid && !!script.preview
  // The wizard configures the test from the recording's requests, so it needs
  // a selected recording that actually contains some. Raw requests, not the
  // allowlist-filtered set: before the wizard's hosts step runs, the allowlist
  // is typically empty.
  const hasRecording = useGeneratorStore((store) => store.recordingPath !== '')
  const hasRequests = useGeneratorStore((store) => store.requests.length > 0)

  // Tooltips should only appear once a button is icon-only. Whether that
  // happened is read back from the CSS outcome (the label span's width), so
  // there is no second copy of the breakpoints to drift.
  const actionsLabelRef = useRef<HTMLSpanElement>(null)
  const runLabelRef = useRef<HTMLSpanElement>(null)
  const actionsCollapsed = useElementWidth(actionsLabelRef) === 0
  const runCollapsed = useElementWidth(runLabelRef) === 0

  const handleExportScript = useScriptExport(file.path)

  const handleDelete = useDeleteFile({
    file,
    navigateHomeOnDelete: true,
  })

  return (
    <Flex align="center" justify="end" gap="2" ml="2" css={toolbarStageStyles}>
      <Flex gap="4" align="center">
        <Tooltip content={!isDirty ? 'Changes saved' : 'Save changes'}>
          <IconButton
            onClick={onSave}
            disabled={!isDirty}
            variant="ghost"
            color="gray"
          >
            <SaveIcon />
          </IconButton>
        </Tooltip>
        <Tooltip content="Export script">
          <IconButton
            onClick={handleExportScript}
            disabled={!isScriptExportable}
            variant="ghost"
            color="gray"
          >
            <DownloadIcon />
          </IconButton>
        </Tooltip>
      </Flex>
      <Flex gap="4" align="center" pl="2">
        <ButtonWithTooltip
          variant="ghost"
          aria-label="Validate"
          tooltip={getValidateTooltip(
            isScriptExportable,
            proxyStatus === 'online',
            actionsCollapsed
          )}
          onClick={() => setIsValidatorDialogOpen(true)}
          disabled={!isScriptExportable || proxyStatus !== 'online'}
        >
          <CircleCheckBigIcon />
          <span ref={actionsLabelRef} css={actionLabelStyles}>
            Validate
          </span>
        </ButtonWithTooltip>
        <ButtonWithTooltip
          variant="ghost"
          aria-label="Configure with Assistant"
          tooltip={getConfigureTooltip(
            hasRecording,
            hasRequests,
            actionsCollapsed
          )}
          disabled={!hasRecording || !hasRequests}
          onClick={onConfigureWithAssistant}
        >
          <WandSparklesIcon />
          <span css={actionLabelStyles}>Configure with Assistant</span>
        </ButtonWithTooltip>
        <ButtonWithTooltip
          variant="solid"
          aria-label="Run in Grafana Cloud"
          tooltip={runCollapsed ? 'Run in Grafana Cloud' : ''}
          disabled={!isScriptExportable}
          onClick={() => {
            setIsRunInCloudDialogOpen(true)
          }}
        >
          <GrafanaIcon />
          <span
            ref={runLabelRef}
            css={{ [whenRunCollapses]: { display: 'none' } }}
          >
            Run in Grafana Cloud
          </span>
        </ButtonWithTooltip>
      </Flex>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton variant="ghost" color="gray">
            <EllipsisVerticalIcon />
          </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item color="red" onClick={handleDelete}>
            Move to Trash
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      {isScriptExportable && (
        <>
          <RunInCloudDialog
            open={isRunInCloudDialogOpen}
            script={{
              type: 'raw',
              name: file.fileName,
              content: script.preview,
            }}
            onOpenChange={setIsRunInCloudDialogOpen}
          />
          <ValidatorDialog
            script={script.preview}
            open={isValidatorDialogOpen}
            onOpenChange={setIsValidatorDialogOpen}
          />
        </>
      )}
    </Flex>
  )
}
