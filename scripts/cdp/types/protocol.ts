import { z } from 'zod'

const StringSchema = z.object({
  type: z.literal('string'),
  enum: z.array(z.string()).optional(),
})

type StringType = z.infer<typeof StringSchema>

const NumberSchema = z.object({
  type: z.literal('number'),
  enum: z.array(z.number()).optional(),
})

type NumberType = z.infer<typeof NumberSchema>

const IntegerSchema = z.object({
  type: z.literal('integer'),
})

type IntegerType = z.infer<typeof IntegerSchema>

const BooleanSchema = z.object({
  type: z.literal('boolean'),
})

type BooleanType = z.infer<typeof BooleanSchema>

const NullSchema = z.object({
  type: z.literal('null'),
})

type NullType = z.infer<typeof NullSchema>

const UnknownSchema = z.object({
  type: z.literal('unknown'),
})

type UnknownType = z.infer<typeof UnknownSchema>

const AnySchema = z.object({
  type: z.literal('any'),
})

type AnyType = z.infer<typeof AnySchema>

const RefSchema = z.object({
  $ref: z.string(),
})

const ArraySchema = z.object({
  type: z.literal('array'),
  get items() {
    return TypeSchema
  },
})

interface ArrayType {
  type: 'array'
  items: Type
}

const PropertySchema = z.intersection(
  z.lazy(() => TypeSchema),
  z.object({
    name: z.string(),
    optional: z.boolean().optional(),
  })
)

type ObjectProperty = Type & {
  name: string
  optional?: boolean
}

const ObjectTypeSchema = z.object({
  type: z.literal('object'),
  properties: z.array(PropertySchema).optional(),
})

interface ObjectType {
  type: 'object'
  properties?: ObjectProperty[]
}

type PrimitiveType =
  | StringType
  | NumberType
  | IntegerType
  | BooleanType
  | NullType
  | UnknownType
  | AnyType
  | ArrayType
  | ObjectType

const PrimitiveSchema: z.ZodType<PrimitiveType> = z.discriminatedUnion('type', [
  StringSchema,
  NumberSchema,
  IntegerSchema,
  BooleanSchema,
  NullSchema,
  UnknownSchema,
  AnySchema,
  ArraySchema,
  ObjectTypeSchema,
])

const TypeSchema = PrimitiveSchema.or(RefSchema)

const DeclarationSchema = z.intersection(
  TypeSchema,
  z.object({
    id: z.string(),
  })
)

export type Type = z.infer<typeof TypeSchema>
export type Property = z.infer<typeof PropertySchema>
export type Declaration = z.infer<typeof DeclarationSchema>

const CommandSchema = z.object({
  name: z.string(),
  parameters: z.array(PropertySchema).optional(),
  returns: z.array(PropertySchema).optional(),
})

export type Command = z.infer<typeof CommandSchema>

const EventSchema = z.object({
  name: z.string(),
  parameters: z.array(PropertySchema).optional(),
})

export type Event = z.infer<typeof EventSchema>

export const DomainSchema = z.object({
  domain: z.string(),
  types: z.array(DeclarationSchema).optional(),
  commands: z.array(CommandSchema).optional(),
  events: z.array(EventSchema).optional(),
})

export type Domain = z.infer<typeof DomainSchema>

export const ProtocolSchema = z.object({
  domains: z.array(DomainSchema),
})

export type Protocol = z.infer<typeof ProtocolSchema>
