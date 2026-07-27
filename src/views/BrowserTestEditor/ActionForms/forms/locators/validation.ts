import { ElementLocator, LocatorOptions } from '@/schemas/locator'
import { flattenLocators } from '@/utils/locator'

import { TouchStates } from '../LocatorForm.hooks'

export type FieldErrors = {
  css?: {
    selector?: string | false
  }
  testid?: {
    testId?: string | false
  }
  label?: {
    label?: string | false
  }
  placeholder?: {
    placeholder?: string | false
  }
  title?: {
    title?: string | false
  }
  alt?: {
    text?: string | false
  }
  text?: {
    text?: string | false
  }
  role?: {
    role?: string | false
  }
}

function required(value: string, message: string): string | false {
  return value.trim() === '' ? message : false
}

export function validateLocator(
  locator: ElementLocator | undefined
): FieldErrors {
  if (locator === undefined) {
    return {}
  }

  switch (locator.type) {
    case 'css':
      return {
        css: {
          selector: required(locator.selector, 'CSS selector cannot be empty'),
        },
      }

    case 'testid':
      return {
        testid: {
          testId: required(locator.testId, 'Test ID cannot be empty'),
        },
      }

    case 'label':
      return {
        label: {
          label: required(locator.label, 'Label cannot be empty'),
        },
      }

    case 'placeholder':
      return {
        placeholder: {
          placeholder: required(
            locator.placeholder,
            'Placeholder cannot be empty'
          ),
        },
      }

    case 'title':
      return {
        title: {
          title: required(locator.title, 'Title cannot be empty'),
        },
      }

    case 'alt':
      return {
        alt: {
          text: required(locator.text, 'Alt text cannot be empty'),
        },
      }

    case 'text':
      return {
        text: {
          text: required(locator.text, 'Text cannot be empty'),
        },
      }

    case 'role':
      return {
        role: {
          role: required(locator.role, 'Role cannot be empty'),
        },
      }

    default:
      return locator satisfies never
  }
}

export function getErrors(
  locator: LocatorOptions,
  touchStates: TouchStates
): string[] {
  const frames = flattenLocators(locator).toArray()

  return frames.flatMap((frame, index) => {
    // Only surface errors for frames the user has actually touched — closing
    // the popover or leaving a row touches it, but untouched frames stay
    // hidden until then.
    if (!touchStates.get(frame).touched) {
      return []
    }

    const validation = validateLocator(frame.values[frame.current])

    // Frames are stored from the innermost to the outermost, but the UI will
    // display them with the outermost at the top so we need to reverse the count.
    const frameIndex = frames.length - index

    return Object.values(validation[frame.current] ?? {})
      .filter((value) => value !== false)
      .map((error) => (index === 0 ? error : `Frame ${frameIndex}: ${error}`))
  })
}
