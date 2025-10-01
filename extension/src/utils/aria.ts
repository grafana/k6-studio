import {
  ARIARoleRelationConceptAttribute,
  AttributeConstraint,
  elementRoles,
} from 'aria-query'
import { groupBy } from 'lodash-es'

import { exhaustive } from '@/utils/typescript'

export interface ElementRole {
  type: 'intrinsic' | 'explicit'
  role: string
}

interface IntrinsicRole {
  tagName: string
  specificity: number
  attributes: Array<ARIARoleRelationConceptAttribute>
  roles: Array<ElementRole>
  match(element: Element): boolean
}

function bySpecificity(a: IntrinsicRole, b: IntrinsicRole) {
  return a.specificity - b.specificity
}

type AttributePredicate = (element: Element) => boolean

function getConstraintPredicate(
  attribute: string,
  constraint: AttributeConstraint
): AttributePredicate {
  switch (constraint) {
    case 'undefined':
      return (element: Element) => !element.hasAttribute(attribute)

    case 'set':
      return (element: Element) => element.hasAttribute(attribute)

    case '>1':
      return (element: Element) => {
        const value = element.getAttribute(attribute)

        if (value === null) {
          return false
        }

        const numberValue = Number(value)

        return !isNaN(numberValue) && numberValue > 1
      }

    default:
      return exhaustive(constraint)
  }
}

function getAttributePredicate({
  name,
  value,
  constraints,
}: ARIARoleRelationConceptAttribute) {
  if (value === undefined && constraints === undefined) {
    // Handle boolean attribute like `<select multiple />`
    return (element: Element) => {
      return element.hasAttribute(name)
    }
  }

  if (value !== undefined) {
    // Handle attribute with a specific value like `<input type="checkbox" />`
    return (element: Element) => {
      return element.getAttribute(name) === String(value)
    }
  }

  // The `constraints` and `value` predicates appear to be mutually exclusive, so
  // constraints should be defined here.
  const constraintPredicates =
    constraints?.map((constraint) =>
      getConstraintPredicate(name, constraint)
    ) ?? []

  return (element: Element) => {
    return constraintPredicates.every((predicate) => predicate(element))
  }
}

const intrinsicRoles: Record<string, IntrinsicRole[]> = groupBy(
  [...elementRoles.entries()]
    .map(([{ name, attributes = [] }, roles]) => {
      const attributeConstraints: AttributePredicate[] = attributes.map(
        getAttributePredicate
      )

      return {
        tagName: name,
        specificity: attributes.length,
        attributes,
        roles: Array.from(roles).map<ElementRole>((role) => ({
          type: 'intrinsic',
          role,
        })),
        match(element: Element) {
          const temp =
            element.tagName.toLowerCase() === name &&
            attributeConstraints.every((predicate) => predicate(element))
          // TODO: Some element roles are constrained by e.g. some ancestor element
          // having a specific role or the value of an attribute being greater
          // than 1. Checking for these constraints would make the roles more
          // accurate.
          return temp
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
  const matchedRoles = possibleRoles?.filter((role) => role.match(element))

  return new Set(matchedRoles?.flatMap((role) => role.roles))
}
