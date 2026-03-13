import { z } from 'zod/v4'

type DeepRequired<T> =
  T extends Array<infer U>
    ? Array<DeepRequired<U>>
    : T extends object
      ? { [K in keyof T]-?: DeepRequired<T[K]> }
      : T

const WorkspaceConfigFileSchema = z.object({
  files: z
    .object({
      include: z.array(z.string()).optional(),
      exclude: z.array(z.string()).optional(),
    })
    .optional(),
  cloud: z
    .object({
      project_id: z.number().nullable().optional(),
    })
    .optional(),
})

export type WorkspaceConfigFile = z.infer<typeof WorkspaceConfigFileSchema>
export type WorkspaceConfig = DeepRequired<WorkspaceConfigFile>

export { WorkspaceConfigFileSchema as WorkspaceConfigSchema }
