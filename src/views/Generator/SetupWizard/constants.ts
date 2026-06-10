import {
  DatabaseIcon,
  GaugeIcon,
  LinkIcon,
  LucideIcon,
  NetworkIcon,
} from 'lucide-react'

import { StepId } from './state/types'

interface StepConfig {
  label: string
  hint: string
  title: string
  description: string
  icon: LucideIcon
}

export const STEP_CONFIG: Record<StepId, StepConfig> = {
  hosts: {
    label: 'Select hosts',
    hint: 'Choose what to test',
    title: 'Select hosts',
    description:
      'The Assistant identified which hosts carry the load you care about. Include or exclude any before continuing.',
    icon: NetworkIcon,
  },
  autocorrelation: {
    label: 'Autocorrelation',
    hint: 'Handle dynamic values',
    title: 'Autocorrelation',
    description:
      "Dynamic values like tokens and IDs change every run. The Assistant created rules to extract and reuse them so your script won't break.",
    icon: LinkIcon,
  },
  parameterization: {
    label: 'Parameterization',
    hint: 'Vary inputs per user',
    title: 'Parameterization',
    description:
      'Hard-coded values like credentials should vary per virtual user. Edit the replacements inline - the Assistant picked sensible defaults.',
    icon: DatabaseIcon,
  },
  thresholds: {
    label: 'Thresholds',
    hint: 'Set pass/fail criteria',
    title: 'Thresholds',
    description:
      'Pass/fail criteria for your test. The Assistant tuned these to the latency it observed - edit any value inline.',
    icon: GaugeIcon,
  },
}
