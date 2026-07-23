import { z } from 'zod'

const SyntheticKeyCodec = z.codec(
  z.union([z.undefined(), z.string()]).optional(),
  z.string().brand<'SyntheticKey'>(),
  {
    encode() {
      // By returning a symbol we ensure that the property is skipped when serializing to
      // JSON, since JSON.stringify ignores symbol properties.
      return undefined
    },
    decode(value) {
      return value ?? crypto.randomUUID()
    },
  }
)

export function newSyntheticKey() {
  return SyntheticKeyCodec.decode(undefined)
}

export function syntheticKey() {
  return SyntheticKeyCodec
}

export type SyntheticKey = z.infer<typeof SyntheticKeyCodec>

export function migrationCodec<
  AnyVersionOutput,
  AnyVersionInput,
  LatestInput extends AnyVersionInput,
  LatestOutput extends AnyVersionOutput & LatestInput,
>(
  supportedVersions: z.ZodType<AnyVersionOutput, AnyVersionInput>,
  latestSchema: z.ZodType<LatestOutput, LatestInput>,
  migrate: (supported: AnyVersionOutput) => LatestOutput
) {
  return z.codec(supportedVersions, latestSchema, {
    decode: (value) => migrate(value),
    encode: (value) => latestSchema.parse(value),
  })
}

export function jsonCodec<T extends z.ZodType>(schema: T) {
  return z.codec(z.string(), schema, {
    encode: (value) => {
      return JSON.stringify(value, null, 2)
    },
    decode: (value, ctx) => {
      try {
        return JSON.parse(value) as z.input<T>
      } catch (error) {
        ctx.issues.push({
          code: 'invalid_format',
          format: 'json_string',
          input: value,
          message:
            error instanceof Error ? error.message : 'Invalid JSON string',
        })

        return z.NEVER
      }
    },
  })
}
