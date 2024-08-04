export const matchBeginEnd = (value: string, begin: string, end: string) => {
  // matches only the first occurrence
  const regex = new RegExp(`${begin}(.*?)${end}`)

  const match = value.match(regex)

  if (match) {
    return match[1]
  }
}

// @ts-expect-error we have commonjs set as module option
if (import.meta.vitest) {
  // @ts-expect-error we have commonjs set as module option
  const { it, expect } = import.meta.vitest

  it('match begin end', () => {
    expect(matchBeginEnd('<div>cat</div>', '<div>', '</div>')).toBe('cat')
    expect(matchBeginEnd('jumpinginthelake', 'ing', 'the')).toBe('in')
    expect(matchBeginEnd('hello', '<a>', '</a>')).toBeUndefined()
  })
}
