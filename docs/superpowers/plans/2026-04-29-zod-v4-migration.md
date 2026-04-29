# Zod v4 Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the remaining 50 source files from `import { z } from 'zod'` (v3 API) to `import { z } from 'zod/v4'` so the entire codebase shares one Zod version, unblocking issues #1060/#1061/#1062.

**Architecture:** Keep `zod ^3.25.x` (the package already ships both runtimes; the `zod/v4` subpath *is* Zod 4). Switch every remaining `from 'zod'` import to `from 'zod/v4'`. Bump `@hookform/resolvers` from `^3.10.0` to `^5.2.2` so its `zodResolver` accepts v4 schemas natively. Fix the few hard-incompatible call sites: `z.record` (now needs an explicit key schema) and the v3-only generic types (`ZodTypeDef`, `ZodSchema<O,D,I>`, `SafeParseReturnType<I,O>`). Repair `useForm<T>` consumers whose schemas use `.default()` by splitting input vs output via `useForm<z.input<...>, unknown, z.output<...>>`.

**Tech Stack:** Zod 3.25.76 (v4 subpath), `@hookform/resolvers` v5, react-hook-form 7.74, TypeScript, Vitest.

---

## Existing State

- 11 files already on `zod/v4`: `src/schemas/locator.ts`, `src/schemas/recording/**`, `src/schemas/browserTest/v1/index.ts`, `src/recorder/browser/messaging/**`, `src/main/runner/schema.ts`, `src/main/runner/rrweb.ts`.
- 50 files still on `from 'zod'` (v3 API). Full list in Phase 2 / 3 / 4 / 5 below.
- 10 components use `zodResolver` from `@hookform/resolvers/zod`.

## Verification Strategy (TDD note)

Migration is mechanical refactor under existing test coverage. The user's instruction "TDD where it makes sense" applies to behavior changes, not import-path swaps.

- **No new tests for import swaps.** `npm run typecheck` + `npm run lint` + `npm test` (407 tests) gate the change.
- **Add a test only if** a `.refine`, `.transform`, or `parse()` call changes shape between v3 and v4. None are expected from the audit.
- **Manual smoke** of the 10 `useForm`/`zodResolver` forms after the type changes (no automation): Settings, ExportScript, RuleEditor, VariablesEditor, LoadProfile, ThinkTime, LoadZones, Thresholds, Recorder/EmptyState, FileNameHeader.

## Known Hard-Incompatible Sites (must fix during migration)

| Site | Issue | Fix |
|------|-------|-----|
| `src/schemas/profile/v1/index.ts:17` | `z.record(StackInfoSchema)` | `z.record(z.string(), StackInfoSchema)` |
| `src/schemas/profile/v1/index.ts:22` | `z.record(z.string())` (single arg) | `z.record(z.string(), z.string())` |
| `src/utils/json.ts:13,18` | `z.ZodTypeDef`, `z.SafeParseReturnType<I,O>` | Drop `Def` generic; use `z.ZodSafeParseResult<O>` |
| `src/services/k6/utils.ts:21,23` | `z.ZodTypeDef`, `z.ZodSchema<O,D,I>` | Use `z.ZodType<O, I>` |
| `src/services/k6/schemas.ts:5,7` | `z.ZodTypeDef`, `z.ZodSchema<O,D,I>` | Use `z.ZodType<O, I>` |
| `src/views/Generator/ExportScriptDialog/ExportScriptDialog.tsx:34` | `useForm<ExportScriptDialogData>` with `.default()` schema | `useForm<z.input<typeof ExportScriptDialogSchema>, unknown, z.output<typeof ExportScriptDialogSchema>>` |
| Any other `useForm<T>` whose schema uses `.default()` | Same input/output split needed | Same fix |

## Phases

- **Phase 0:** commit already-applied `@hookform/resolvers` bump.
- **Phase 1:** util/services type generics (block downstream typecheck).
- **Phase 2:** `src/schemas/**` files (incl. `z.record` fixes).
- **Phase 3:** `src/types/**` re-export files.
- **Phase 4:** non-component consumers (`src/utils/**`, `src/handlers/**`, `src/main/**`, `src/services/**`, `src/recorder/**`, `src/codegen/**`).
- **Phase 5:** view/component consumers (`useForm` + `zodResolver` sites).
- **Phase 6:** final verification gate.

---

## Phase 0: Commit resolver upgrade

### Task 0.1: Verify resolver upgrade is staged

**Files:**
- Modify: `package.json:9` (already done)
- Modify: `package-lock.json` (already done)

- [ ] **Step 1:** Confirm staged change.

```bash
git diff package.json | head -20
```

Expected: `@hookform/resolvers` bumped from `^3.9.0` to `^5.2.2`.

- [ ] **Step 2:** Verify install matches.

```bash
cat node_modules/@hookform/resolvers/package.json | grep '"version"'
```

Expected: `"version": "5.2.2"` (or higher).

- [ ] **Step 3:** Run typecheck baseline (will still fail — expected).

```bash
npm run typecheck 2>&1 | grep -c "error TS" || true
```

Note the count for comparison after Phase 5.

- [ ] **Step 4:** Commit.

```bash
git add package.json package-lock.json
git commit -m "chore: Bump @hookform/resolvers to v5 for zod v4 support"
```

---

## Phase 1: Migrate type-generic util/service files

These three files define generic helpers used by ~20 consumers. Migrating them first localises the v3-only generic-type breakage to one phase.

### Task 1.1: Migrate `src/utils/json.ts`

**Files:**
- Modify: `src/utils/json.ts`

Current code:
```ts
import { z } from 'zod'

export function safeJsonParse<T extends object>(value: string) {
  try {
    return JSON.parse(value) as T
  } catch (error) {
    return undefined
  }
}

export function parseJsonAsSchema<
  Output = unknown,
  Def extends z.ZodTypeDef = z.ZodTypeDef,
  Input = Output,
>(
  value: string,
  schema: z.ZodType<Output, Def, Input>
): z.SafeParseReturnType<Input, Output> {
  try {
    return schema.safeParse(JSON.parse(value))
  } catch {
    return {
      success: false,
      error: new z.ZodError([]),
    }
  }
}
```

- [ ] **Step 1:** Replace file contents.

```ts
import { z } from 'zod/v4'

export function safeJsonParse<T extends object>(value: string) {
  try {
    return JSON.parse(value) as T
  } catch {
    return undefined
  }
}

export function parseJsonAsSchema<Output = unknown, Input = Output>(
  value: string,
  schema: z.ZodType<Output, Input>
): z.ZodSafeParseResult<Output> {
  try {
    return schema.safeParse(JSON.parse(value))
  } catch {
    return {
      success: false,
      error: new z.ZodError([]),
    }
  }
}
```

- [ ] **Step 2:** Typecheck this file.

```bash
npx tsc --noEmit 2>&1 | grep "utils/json.ts" || echo "clean"
```

Expected: `clean` (no errors in this file). If errors, fix per the actual message; common follow-up is `z.ZodSafeParseResult` not exported — fall back to inline type `{ success: true; data: Output } | { success: false; error: z.ZodError }`.

- [ ] **Step 3:** No commit yet (Phase 1 commits as one unit).

### Task 1.2: Migrate `src/services/k6/utils.ts`

**Files:**
- Modify: `src/services/k6/utils.ts`

- [ ] **Step 1:** Read existing file.

```bash
sed -n '1,40p' src/services/k6/utils.ts
```

- [ ] **Step 2:** Replace import + generic signature.

Find:
```ts
import { z } from 'zod'
```
Replace with:
```ts
import { z } from 'zod/v4'
```

Find the helper signature (around line 18-24):
```ts
  Output = unknown,
  Def extends z.ZodTypeDef = z.ZodTypeDef,
  Input = Output,
>(response: Response, schema: z.ZodSchema<Output, Def, Input>) {
```
Replace with:
```ts
  Output = unknown,
  Input = Output,
>(response: Response, schema: z.ZodType<Output, Input>) {
```

- [ ] **Step 3:** Typecheck.

```bash
npx tsc --noEmit 2>&1 | grep "services/k6/utils.ts" || echo "clean"
```

Expected: `clean`.

### Task 1.3: Migrate `src/services/k6/schemas.ts`

**Files:**
- Modify: `src/services/k6/schemas.ts`

- [ ] **Step 1:** Read existing file.

```bash
sed -n '1,30p' src/services/k6/schemas.ts
```

- [ ] **Step 2:** Same shape of edit as Task 1.2: switch import to `zod/v4`, drop `Def extends z.ZodTypeDef = z.ZodTypeDef,` from the generic, change `z.ZodSchema<Output, Def, Input>` to `z.ZodType<Output, Input>`.

- [ ] **Step 3:** Typecheck.

```bash
npx tsc --noEmit 2>&1 | grep "services/k6/schemas.ts" || echo "clean"
```

Expected: `clean`.

### Task 1.4: Commit Phase 1

- [ ] **Step 1:**

```bash
git add src/utils/json.ts src/services/k6/utils.ts src/services/k6/schemas.ts
git commit -m "refactor: Migrate generic zod helpers to v4 type signatures"
```

---

## Phase 2: Migrate `src/schemas/**`

All 28 files under `src/schemas/` excluding the 6 already on `zod/v4` (locator, recording/**, browserTest/v1).

### Task 2.1: Bulk-switch imports

**Files (28 total):**
- `src/schemas/exportScript.ts`
- `src/schemas/imports.ts`
- `src/schemas/k6.ts`
- `src/schemas/settings/index.ts`
- `src/schemas/settings/v1/index.ts`
- `src/schemas/settings/v2/index.ts`
- `src/schemas/settings/v3/index.ts`
- `src/schemas/settings/v4/index.ts`
- `src/schemas/settings/v5/index.ts`
- `src/schemas/generator/index.ts`
- `src/schemas/generator/v0/index.ts`
- `src/schemas/generator/v0/rules.ts`
- `src/schemas/generator/v0/testData.ts`
- `src/schemas/generator/v0/testOptions.ts`
- `src/schemas/generator/v1/index.ts`
- `src/schemas/generator/v1/loadZone.ts`
- `src/schemas/generator/v1/rules.ts`
- `src/schemas/generator/v1/testData.ts`
- `src/schemas/generator/v1/testOptions.ts`
- `src/schemas/generator/v1/thresholds.ts`
- `src/schemas/generator/v2/index.ts`
- `src/schemas/generator/v2/loadZone.ts`
- `src/schemas/generator/v2/rules.ts`
- `src/schemas/generator/v2/testData.ts`
- `src/schemas/generator/v2/testOptions.ts`
- `src/schemas/generator/v2/thresholds.ts`
- `src/schemas/profile/index.ts`
- `src/schemas/profile/v1/index.ts`

- [ ] **Step 1:** Run sed across the directory (BSD sed on macOS).

```bash
find src/schemas -name '*.ts' -type f -print0 | xargs -0 sed -i '' "s|from 'zod'|from 'zod/v4'|g"
```

- [ ] **Step 2:** Verify zero remaining `from 'zod'` imports under `src/schemas`.

```bash
grep -rE "from 'zod'" src/schemas | wc -l
```

Expected: `0`.

### Task 2.2: Fix `z.record` keySchema in `src/schemas/profile/v1/index.ts`

**Files:**
- Modify: `src/schemas/profile/v1/index.ts:17`
- Modify: `src/schemas/profile/v1/index.ts:22`

- [ ] **Step 1:** Apply edit.

Find:
```ts
  stacks: z.record(StackInfoSchema),
```
Replace with:
```ts
  stacks: z.record(z.string(), StackInfoSchema),
```

Find:
```ts
  tokens: z.record(z.string()),
```
Replace with:
```ts
  tokens: z.record(z.string(), z.string()),
```

- [ ] **Step 2:** Typecheck the file.

```bash
npx tsc --noEmit 2>&1 | grep "schemas/profile/v1/index.ts" || echo "clean"
```

Expected: `clean`.

### Task 2.3: Resolve any remaining schema-side typecheck errors

- [ ] **Step 1:** Run full typecheck and filter to `src/schemas/`.

```bash
npx tsc --noEmit 2>&1 | grep "src/schemas" | sort -u | head -50
```

- [ ] **Step 2:** For each error, fix in place using these patterns:

| Error | Fix |
|-------|-----|
| `Argument of type ... is not assignable to ... ZodType` | Confirm import is `zod/v4`. |
| `'message' does not exist in type ...` on `.refine`, `z.number({})`, `.url({})` | Replace key `message:` with `error:` in that options object. |
| `Property 'passthrough' does not exist` | Replace `.passthrough()` with `.loose()`. |
| `Argument of type ... is missing the following properties from type 'ZodType'` from `z.union([...])` with single member | Wrap second arg or restructure (rare). |
| `z.string().url()` complains | Replace `z.string().url(...)` with `z.url(...)`. |
| `z.string().email()` complains | Replace with `z.email(...)`. |

- [ ] **Step 3:** Re-run until grep is empty.

```bash
npx tsc --noEmit 2>&1 | grep "src/schemas" | wc -l
```

Expected: `0`.

### Task 2.4: Run schema-related tests

- [ ] **Step 1:**

```bash
npm test -- src/schemas
```

Expected: all pass. If a recording/browser/v2 test fails because the migration crossed a boundary, fix the failure root cause; do not delete the test.

### Task 2.5: Commit Phase 2

- [ ] **Step 1:**

```bash
git add src/schemas
git commit -m "refactor: Migrate src/schemas to zod/v4 imports"
```

---

## Phase 3: Migrate `src/types/**`

All 7 files re-export schema-derived types and need the import switch only.

**Files:**
- `src/types/autoCorrelation.ts`
- `src/types/generator.ts`
- `src/types/imports.ts`
- `src/types/rules.ts`
- `src/types/settings.ts`
- `src/types/testData.ts`
- `src/types/testOptions.ts`

### Task 3.1: Bulk switch

- [ ] **Step 1:**

```bash
find src/types -name '*.ts' -type f -print0 | xargs -0 sed -i '' "s|from 'zod'|from 'zod/v4'|g"
```

- [ ] **Step 2:** Verify.

```bash
grep -rE "from 'zod'" src/types | wc -l
```

Expected: `0`.

### Task 3.2: Resolve errors

- [ ] **Step 1:** Typecheck filter.

```bash
npx tsc --noEmit 2>&1 | grep "src/types" | head -30
```

If `src/types/autoCorrelation.ts:81` re-defines a `discriminatedUnion`, validate it still typechecks. If not, fall back to importing the schema instead.

- [ ] **Step 2:** Fix until clean.

```bash
npx tsc --noEmit 2>&1 | grep "src/types" | wc -l
```

Expected: `0`.

### Task 3.3: Commit

- [ ] **Step 1:**

```bash
git add src/types
git commit -m "refactor: Migrate src/types to zod/v4 imports"
```

---

## Phase 4: Migrate non-component consumers

**Files (15 total):**
- `src/utils/cdp/transports/schema.ts`
- `src/utils/cdp/transports/webSocket.ts`
- `src/utils/k6/schema.ts`
- `src/handlers/ai/tools.ts`
- `src/handlers/ai/a2a/stackHealth.ts`
- `src/handlers/ai/a2a/tokenStore.ts`
- `src/handlers/ai/a2a/tokenRefresh.ts`
- `src/services/grafana/assistantAuth.ts`
- `src/services/grafana/authenticate.ts`
- `src/services/grafana/api.ts`
- `src/services/k6/index.ts`
- (plus any straggler under `src/utils/`, `src/main/`, `src/recorder/`, `src/codegen/` — confirm via grep below)

### Task 4.1: Bulk switch across remaining areas

- [ ] **Step 1:**

```bash
find src/utils src/handlers src/services src/main src/recorder src/codegen \
  -name '*.ts' -type f -print0 \
  | xargs -0 sed -i '' "s|from 'zod'|from 'zod/v4'|g"
```

- [ ] **Step 2:** Confirm no `from 'zod'` survives anywhere outside the views/components covered by Phase 5.

```bash
grep -rE "from 'zod'" src \
  | grep -v "from 'zod/v4'" \
  | grep -v "src/views/" \
  | grep -v "src/components/"
```

Expected: empty.

### Task 4.2: Resolve errors

- [ ] **Step 1:** Typecheck the migrated paths.

```bash
npx tsc --noEmit 2>&1 \
  | grep -E "src/(utils|handlers|services|main|recorder|codegen)" \
  | sort -u | head -50
```

- [ ] **Step 2:** Fix per the patterns table in Task 2.3. Likely site: `src/utils/k6/schema.ts:26` uses `.passthrough()` — replace with `.loose()`. `src/utils/k6/tracking.ts` uses `parsed.error.format()` — keep as-is, `.format()` still exists in v4; only adjust if typecheck flags it (then use `z.treeifyError(parsed.error)`).

- [ ] **Step 3:** Loop until clean.

```bash
npx tsc --noEmit 2>&1 | grep -E "src/(utils|handlers|services|main|recorder|codegen)" | wc -l
```

Expected: `0`.

### Task 4.3: Run associated tests

- [ ] **Step 1:**

```bash
npm test -- src/utils src/handlers src/services src/main
```

Expected: all pass.

### Task 4.4: Commit

- [ ] **Step 1:**

```bash
git add src/utils src/handlers src/services src/main src/recorder src/codegen
git commit -m "refactor: Migrate utils/handlers/services/main/recorder/codegen to zod/v4"
```

---

## Phase 5: Migrate view/component consumers

This phase is sensitive: changing the schema input type changes the `useForm` generic shape. Each form needs verification.

**Files (10 total):**
- `src/components/FileNameHeader.tsx`
- `src/components/Settings/SettingsDialog.tsx`
- `src/views/Generator/ExportScriptDialog/ExportScriptDialog.tsx`
- `src/views/Generator/RuleEditor/RuleEditor.tsx`
- `src/views/Generator/TestData/VariablesEditor.tsx`
- `src/views/Generator/TestOptions/LoadProfile/LoadProfile.tsx`
- `src/views/Generator/TestOptions/LoadZones/LoadZones.tsx`
- `src/views/Generator/TestOptions/Thresholds/Thresholds.tsx`
- `src/views/Generator/TestOptions/ThinkTime.tsx`
- `src/views/Recorder/EmptyState.tsx`

(Note: only views that themselves `import { z } from 'zod'` need the swap. Many of these only import the resolver + a schema from `src/schemas/`. Run a grep to identify which need the import edit vs only a `useForm` generic edit.)

### Task 5.1: Identify which view files import `zod` directly

- [ ] **Step 1:**

```bash
grep -rEl "^import.*from 'zod'" src/views src/components
```

Track this list.

### Task 5.2: Switch imports in those files

- [ ] **Step 1:**

```bash
find src/views src/components -name '*.tsx' -o -name '*.ts' -type f \
  -print0 | xargs -0 sed -i '' "s|from 'zod'|from 'zod/v4'|g"
```

- [ ] **Step 2:** Verify.

```bash
grep -rE "from 'zod'" src/views src/components | grep -v "from 'zod/v4'"
```

Expected: empty.

### Task 5.3: Fix `useForm<T>` mismatches caused by `.default()` in schemas

For each consumer where typecheck reports `Type 'Resolver<{ ...optional... }, any, { ...required... }>' is not assignable to type 'Resolver<{ ...required... }, ...`:

- [ ] **Step 1:** Run typecheck and collect errors.

```bash
npx tsc --noEmit 2>&1 | grep -E "src/views|src/components" | head -40
```

- [ ] **Step 2:** For each affected consumer, change:

```tsx
const formMethods = useForm<ExportScriptDialogData>({
  resolver: zodResolver(ExportScriptDialogSchema),
  ...
})
```

to:

```tsx
const formMethods = useForm<
  z.input<typeof ExportScriptDialogSchema>,
  unknown,
  z.output<typeof ExportScriptDialogSchema>
>({
  resolver: zodResolver(ExportScriptDialogSchema),
  ...
})
```

Add the `z` import if missing: `import { z } from 'zod/v4'`.

For the `onSubmit` handler that previously took `ExportScriptDialogData` (now `z.output<...>`), keep the parameter type as the existing exported `Data` alias (it still equals `z.infer<...> = z.output<...>`). The `SubmitHandler` signature now expects `z.output<...>` which equals the existing alias, so handler typing stays the same.

- [ ] **Step 3:** Loop until clean.

```bash
npx tsc --noEmit 2>&1 | grep -cE "src/views|src/components"
```

Expected: `0`.

### Task 5.4: Component test pass

- [ ] **Step 1:**

```bash
npm test
```

Expected: full suite green (407 baseline + any new). If a test fails because a Zod error message string changed under v4, update the test assertion to match the new message — do not delete the test.

### Task 5.5: Manual smoke (10 forms)

- [ ] **Step 1:** Start the app.

```bash
npm start
```

- [ ] **Step 2:** For each form below, open the dialog, type an invalid value, confirm the validation message appears; type a valid value, confirm submit works:

  1. Settings dialog (`SettingsDialog`) — proxy port out of range, then valid.
  2. Export script (`ExportScriptDialog`) — empty name, then valid name.
  3. Rule editor (`RuleEditor`) — invalid regex, then valid.
  4. Variables editor (`VariablesEditor`) — duplicate variable name, then unique.
  5. Load profile (`LoadProfile`) — `max < min`, then valid.
  6. Think time (`ThinkTime`) — invalid duration format, then valid.
  7. Load zones (`LoadZones`) — total != 100, then 100.
  8. Thresholds (`Thresholds`) — empty value, then valid number.
  9. Recorder empty state (`Recorder/EmptyState`) — empty URL, then valid.
  10. File rename (`FileNameHeader`) — invalid filename chars, then valid.

- [ ] **Step 3:** Stop the app.

### Task 5.6: Commit

- [ ] **Step 1:**

```bash
git add src/views src/components
git commit -m "refactor: Migrate views and components to zod/v4 imports"
```

---

## Phase 6: Final gate

### Task 6.1: Full typecheck + lint + test sweep

- [ ] **Step 1:**

```bash
npm run typecheck
```

Expected: zero errors.

- [ ] **Step 2:**

```bash
npm run lint
```

Expected: zero errors.

- [ ] **Step 3:**

```bash
npm test
```

Expected: 407+ tests pass, zero failures.

### Task 6.2: Confirm zero `from 'zod'` imports remain

- [ ] **Step 1:**

```bash
grep -rE "^import .* from 'zod'" src
```

Expected: empty.

```bash
grep -rE "^import .* from 'zod/v4'" src | wc -l
```

Expected: 61.

### Task 6.3: Run /simplify

- [ ] **Step 1:** Invoke the `simplify` skill against the diff. Apply any safe code-quality fixes (e.g., dead `unknown` casts, redundant `as` after now-stronger types) returned by the review.

- [ ] **Step 2:** If `/simplify` produces edits, commit:

```bash
git add -u
git commit -m "refactor: Apply simplify pass on zod v4 migration"
```

### Task 6.4: Branch summary

- [ ] **Step 1:** Print the final commit list.

```bash
git log --oneline main..HEAD
```

Expected: 5–7 commits matching the phase headings.

---

## Self-review checklist (planner)

- Spec coverage: every file in the audit (50 v3-importers + 11 already-v4 + 10 form consumers + 3 generic helpers + profile/v1 record fix) has a task that touches it. ✅
- Placeholder scan: no `TBD`, no "implement later", no "add error handling"; every step has the actual command or code. ✅
- Type consistency: `z.ZodType<Output, Input>` used consistently in Phase 1; `z.input<typeof X>` / `z.output<typeof X>` used consistently in Phase 5. ✅
- TDD calibration: explicitly noted that mechanical refactor under existing tests does not need new tests; only behavior-shifting cases would. ✅
