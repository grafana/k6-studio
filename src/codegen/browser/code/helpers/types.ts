import { Expression, Node, Property } from '../../tstree'

/**
 * This type makes it easier to create helper functions for creating nodes. It makes
 * every property in the node optional except for the specified required properties.
 * This lets us define sane defaults for rarely used properties.
 */
export type NodeOptions<
  T extends Node | Property,
  RequiredProps extends keyof T,
  OmitProps extends keyof T = never,
> = Partial<Omit<T, RequiredProps | OmitProps | 'type' | 'range' | 'loc'>> &
  Pick<T, RequiredProps>

export type LiteralOrExpression = Expression | string | number | boolean | null