import { elementRoles } from 'aria-query'
import { groupBy } from 'lodash-es'

export interface ElementRole {
  type: 'intrinsic' | 'explicit'
  role: string
}

interface IntrinsicRole {
  tagName: string
  specificity: number
  roles: Array<ElementRole>
  match(element: Element): boolean
}

function bySpecificity(a: IntrinsicRole, b: IntrinsicRole) {
  return a.specificity - b.specificity
}

const intrinsicRoles: Record<string, IntrinsicRole[]> = groupBy(
  [...elementRoles.entries()]
    .map(([{ name, attributes = [] }, roles]) => {
      const selector =
        name +
        attributes
          .map((attr) => {
            return attr.value !== undefined
              ? `[${attr.name}="${attr.value}"]`
              : `[${attr.name}]`
          })
          .join('')

      return {
        tagName: name,
        specificity: attributes.length,
        roles: Array.from(roles).map<ElementRole>((role) => ({
          type: 'intrinsic',
          role,
        })),
        match(element: Element) {
          // TODO: Some roles are constrained by e.g. some ancestor element
          // having a specific role or the value of an attribute being greater
          // than 1. Checking for these constraints would make the roles more
          // accurate.
          return element.matches(selector)
        },
      }
    })
    .sort(bySpecificity),
  (value) => value.tagName
)

export function getElementRoles(element: Element): Set<ElementRole> {
  const role = element.getAttribute('role')

  if (role !== null) {
    return new Set([
      {
        type: 'explicit',
        role,
      },
    ])
  }

  const possibleRoles = intrinsicRoles[element.tagName.toLowerCase()]

  return new Set(
    possibleRoles
      ?.filter((role) => role.match(element))
      .flatMap((role) => role.roles)
  )
}
