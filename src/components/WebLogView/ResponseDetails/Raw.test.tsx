import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Raw } from './Raw'

const jsonData = {
  id: 1,
  name: 'Harry Potter',
  house: 'Gryffindor',
}
const stringifiedJsonData = JSON.stringify(jsonData)
const unformattedJsonData = stringifiedJsonData.replace(/\//g, '')

describe('Raw', () => {
  it('should return a non-formatted version of the json data', () => {
    render(<Raw content={stringifiedJsonData} />)

    expect(screen.getByRole('code').innerHTML).toEqual(unformattedJsonData)
  })
})
