export function isLocatorMethod(method: string) {
  switch (method) {
    case 'all':
    case 'contentFrame':
    case 'filter':
    case 'first':
    case 'getByAltText':
    case 'getByLabel':
    case 'getByPlaceholder':
    case 'getByRole':
    case 'getByTestId':
    case 'getByText':
    case 'getByTitle':
    case 'last':
    case 'locator':
    case 'nth':
      return true

    default:
      return false
  }
}
