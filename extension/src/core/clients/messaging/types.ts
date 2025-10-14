import { z } from 'zod'

export interface Method<
  Params extends z.ZodTuple<
    [z.ZodTypeAny, ...z.ZodTypeAny[]] | []
  > = z.ZodTuple<[z.ZodTypeAny, ...z.ZodTypeAny[]] | []>,
  Return extends z.ZodTypeAny = z.ZodTypeAny,
> {
  params: Params
  returns: Return
}

export type Service<T extends Record<string, Method>> = {
  [K in keyof T]: (
    ...args: z.infer<T[K]['params']>
  ) => Promise<z.infer<T[K]['returns']>>
}

export type EventMap<T extends AnyEventSchema> = {
  [K in z.infer<T>['name']]: z.infer<T>['data']
}

export type AnyEventSchema = z.ZodSchema<{ name: string; data: unknown }>
