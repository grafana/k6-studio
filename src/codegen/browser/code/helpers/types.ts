import { Expression, Node, Property } from '../../tstree'

export type NodeOptions<
  T extends Node | Property,
  RequiredProps extends keyof T,
  OmitProps extends keyof T = never,
> = Partial<Omit<T, RequiredProps | OmitProps | 'type' | 'range' | 'loc'>> &
  Pick<T, RequiredProps>

export type LiteralOrExpression = Expression | string | number | boolean | null
