import type { TestRun } from '@/utils/k6/testRun'

let currentTestRun: TestRun | null = null

export function getScriptTestRun() {
  return currentTestRun
}

export function setScriptTestRun(run: TestRun | null) {
  currentTestRun = run
}
