import { it } from 'vitest'
import { buildGraph } from './buildGraph'
import { SerializedGraph } from '@/utils/graph/types'

function swap<T>(array: T[], i: number, j: number) {
  const a = array[i]
  const b = array[j]

  if (a === undefined || b === undefined) {
    return
  }

  array[i] = b
  array[j] = a
}

const swaps = [2, 7, 9, 8, 0, 8, 4, 1, 5, 9]

// Deterministic shuffle based
function shuffle<T>(array: T[]) {
  const shuffled = [...array]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = swaps[i % swaps.length] ?? i

    swap(shuffled, i, j)
  }

  return array ?? shuffled
}

type Graph = SerializedGraph<{ id: string; start: number; end: number }, null>

it('should return an empty graph if there are no requests', ({ expect }) => {
  const graph = buildGraph([])

  expect(graph.order).toBe(0)
})

it('should return a graph with a single node and no edges if there is one request', ({
  expect,
}) => {
  const graph = buildGraph([{ id: 'a', start: 0, end: 1 }])

  expect(graph.order).toBe(1)
  expect(graph.size).toBe(0)
})

it("should add an edge when nodes don't have overlapping ranges", ({
  expect,
}) => {
  const graph = buildGraph([
    { id: 'a', start: 0, end: 1 },
    { id: 'b', start: 2, end: 3 },
  ]).serialize()

  expect(graph.edges).toEqual<Graph['edges']>({
    a: {
      b: [null],
    },
  })
})

it('should prepend an edge when second node starts and ends before first node', ({
  expect,
}) => {
  const graph = buildGraph([
    { id: 'a', start: 10, end: 12 },
    { id: 'b', start: 2, end: 3 },
  ]).serialize()

  expect(graph.edges).toEqual<Graph['edges']>({
    b: {
      a: [null],
    },
  })
})

it('should not add an edge when nodes have overlapping ranges', ({
  expect,
}) => {
  const graph = buildGraph(
    shuffle([
      { id: 'a', start: 0, end: 1 },
      { id: 'b', start: 1, end: 2 },
    ])
  ).serialize()

  expect(graph.edges).toEqual<Graph['edges']>({})
})

it('should add parallel edges when nodes have overlapping ranges', ({
  expect,
}) => {
  // GraphViz: https://dreampuf.github.io/GraphvizOnline/?engine=dot#digraph%20G%20%7B%0A%20%20%20%20a%20%5Blabel%3D%22a%3A%200-1%22%5D%0A%20%20%20%20b%20%5Blabel%3D%22b%3A%202-4%22%5D%0A%20%20%20%20c%20%5Blabel%3D%22c%3A%203-5%22%5D%0A%20%20%20%20%0A%20%20%20%20a%20-%3E%20b%0A%20%20%20%20a%20-%3E%20c%0A%7D
  const graph = buildGraph(
    shuffle([
      { id: 'a', start: 0, end: 1 },
      { id: 'b', start: 2, end: 4 },
      { id: 'c', start: 3, end: 5 },
    ])
  ).serialize()

  expect(graph.edges).toEqual<Graph['edges']>({
    a: {
      b: [null],
      c: [null],
    },
  })
})

it('should insert the node where it can find a non-overlapping range', ({
  expect,
}) => {
  // GraphViz: https://dreampuf.github.io/GraphvizOnline/?engine=dot#digraph%20G%20%7B%0A%20%20%20%20a%20%5Blabel%3D%22a%3A%200-1%22%5D%0A%20%20%20%20b%20%5Blabel%3D%22b%3A%204-5%22%5D%0A%20%20%20%20c%20%5Blabel%3D%22c%3A%202-3%22%5D%0A%20%20%20%20%0A%20%20%20%20a%20-%3E%20c%0A%20%20%20%20c%20-%3E%20b%0A%7D
  const graph = buildGraph(
    shuffle([
      { id: 'a', start: 0, end: 1 }, // Should be first
      { id: 'b', start: 4, end: 5 }, // Should be third
      { id: 'c', start: 2, end: 3 }, // Should be second
    ])
  ).serialize()

  expect(graph.edges).toEqual<Graph['edges']>({
    a: {
      c: [null],
    },
    c: {
      b: [null],
    },
  })
})

it('', ({ expect }) => {
  // GraphViz: https://dreampuf.github.io/GraphvizOnline/?engine=dot#digraph%20G%20%7B%0A%20%20%20%20a%20%5Blabel%3D%22a%3A%200-1%22%5D%0A%20%20%20%20b%20%5Blabel%3D%22b%3A%202-4%22%5D%0A%20%20%20%20c%20%5Blabel%3D%22c%3A%203-4%22%5D%0A%20%20%20%20d%20%5Blabel%3D%22d%3A%205-6%22%5D%0A%20%20%20%20e%20%5Blabel%3D%22e%3A%207-8%22%5D%0A%20%20%20%20%0A%20%20%20%20a%20-%3E%20b%0A%20%20%20%20a%20-%3E%20c%0A%20%20%20%20b%20-%3E%20d%0A%20%20%20%20c%20-%3E%20d%0A%20%20%20%20d%20-%3E%20e%0A%7D
  const graph = buildGraph(
    shuffle([
      { id: 'a', start: 0, end: 1 },
      { id: 'c', start: 3, end: 4 },
      { id: 'b', start: 2, end: 4 },
      { id: 'e', start: 7, end: 8 },
      { id: 'd', start: 5, end: 6 },
    ])
  ).serialize()

  expect(graph.edges).toEqual<Graph['edges']>({
    a: {
      b: [null],
      c: [null],
    },
    b: {
      d: [null],
    },
    c: {
      d: [null],
    },
    d: {
      e: [null],
    },
  })
})

it('should walk down descendants to find the first place to insert the end of the edge #1', ({
  expect,
}) => {
  // GraphViz: https://dreampuf.github.io/GraphvizOnline/?engine=dot#digraph%20G%20%7B%0A%20%20%20%20a%20%5Blabel%3D%22a%3A%200-1%22%5D%0A%20%20%20%20b%20%5Blabel%3D%22b%3A%202-4%22%5D%0A%20%20%20%20c%20%5Blabel%3D%22c%3A%203-4%22%5D%0A%20%20%20%20d%20%5Blabel%3D%22d%3A%205-6%22%5D%0A%20%20%20%20e%20%5Blabel%3D%22e%3A%207-8%22%5D%0A%20%20%20%20f%20%5Blabel%3D%22f%3A%202-6%22%5D%0A%20%20%20%20%0A%20%20%20%20a%20-%3E%20b%0A%20%20%20%20a%20-%3E%20c%0A%20%20%20%20a%20-%3E%20f%0A%20%20%20%20b%20-%3E%20d%0A%20%20%20%20c%20-%3E%20d%0A%20%20%20%20d%20-%3E%20e%0A%20%20%20%20f%20-%3E%20e%0A%7D
  const graph = buildGraph(
    shuffle([
      { id: 'a', start: 0, end: 1 },
      { id: 'b', start: 2, end: 4 },
      { id: 'c', start: 3, end: 4 },
      { id: 'd', start: 5, end: 6 },
      { id: 'e', start: 7, end: 8 },
      { id: 'f', start: 2, end: 6 },
    ])
  ).serialize()

  expect(graph.edges).toEqual<Graph['edges']>({
    a: {
      b: [null],
      c: [null],
      f: [null],
    },
    b: {
      d: [null],
    },
    c: {
      d: [null],
    },
    d: {
      e: [null],
    },
    f: {
      e: [null],
    },
  })
})

it('should walk down descendants to find the first place to insert the end of the edge #2', ({
  expect,
}) => {
  //https://dreampuf.github.io/GraphvizOnline/?engine=dot#digraph%20G%20%7B%0A%20%20%20%20a%20%5Blabel%3D%22a%3A%200-1%22%5D%0A%20%20%20%20b%20%5Blabel%3D%22b%3A%202-4%22%5D%0A%20%20%20%20c%20%5Blabel%3D%22c%3A%203-4%22%5D%0A%20%20%20%20d%20%5Blabel%3D%22d%3A%206-7%22%5D%0A%20%20%20%20e%20%5Blabel%3D%22e%3A%208-9%22%5D%0A%20%20%20%20f%20%5Blabel%3D%22f%3A%203-5%22%5D%0A%20%20%20%20%0A%20%20%20%20a%20-%3E%20b%0A%20%20%20%20a%20-%3E%20c%0A%20%20%20%20a%20-%3E%20f%0A%20%20%20%20b%20-%3E%20d%0A%20%20%20%20c%20-%3E%20d%0A%20%20%20%20d%20-%3E%20e%0A%20%20%20%20f%20-%3E%20d%0A%7D
  const graph = buildGraph(
    shuffle([
      { id: 'a', start: 0, end: 1 },
      { id: 'b', start: 2, end: 4 },
      { id: 'c', start: 3, end: 4 },
      { id: 'd', start: 6, end: 7 },
      { id: 'e', start: 8, end: 9 },
      { id: 'f', start: 3, end: 5 },
    ])
  ).serialize()

  expect(graph.edges).toEqual<Graph['edges']>({
    a: {
      b: [null],
      c: [null],
      f: [null],
    },
    b: {
      d: [null],
    },
    c: {
      d: [null],
    },
    d: {
      e: [null],
    },
    f: {
      d: [null],
    },
  })
})

it('should insert node between all incoming edges', ({ expect }) => {
  //https://dreampuf.github.io/GraphvizOnline/?engine=dot#digraph%20G%20%7B%0A%20%20%20%20a%20%5Blabel%3D%22a%3A%200-1%22%5D%0A%20%20%20%20b%20%5Blabel%3D%22b%3A%202-4%22%5D%0A%20%20%20%20c%20%5Blabel%3D%22c%3A%203-4%22%5D%0A%20%20%20%20d%20%5Blabel%3D%22d%3A%206-7%22%5D%0A%20%20%20%20e%20%5Blabel%3D%22e%3A%208-9%22%5D%0A%20%20%20%20f%20%5Blabel%3D%22f%3A%203-5%22%5D%0A%20%20%20%20%0A%20%20%20%20a%20-%3E%20b%0A%20%20%20%20a%20-%3E%20c%0A%20%20%20%20a%20-%3E%20f%0A%20%20%20%20b%20-%3E%20d%0A%20%20%20%20c%20-%3E%20d%0A%20%20%20%20d%20-%3E%20e%0A%20%20%20%20f%20-%3E%20d%0A%7D
  const graph = buildGraph(
    shuffle([
      { id: 'a', start: 0, end: 1 },
      { id: 'b', start: 0, end: 1 },
      { id: 'c', start: 0, end: 1 },
      { id: 'd', start: 10, end: 11 },
      { id: 'f', start: 5, end: 6 },
    ])
  ).serialize()

  expect(graph.edges).toEqual<Graph['edges']>({
    a: {
      f: [null],
    },
    b: {
      f: [null],
    },
    c: {
      f: [null],
    },
    f: {
      d: [null],
    },
  })
})

it('should insert new source node when it overlaps with all other source nodes', ({
  expect,
}) => {
  // https://dreampuf.github.io/GraphvizOnline/?engine=dot#digraph%20G%20%7B%0A%20%20%20%20a%20%5Blabel%3D%22a%3A%200-2%22%5D%0A%20%20%20%20b%20%5Blabel%3D%22b%3A%201-2%22%5D%0A%20%20%20%20c%20%5Blabel%3D%22c%3A%203-4%22%5D%0A%20%20%20%20d%20%5Blabel%3D%22d%3A%203-4%22%5D%0A%20%20%20%20e%20%5Blabel%3D%22e%3A%203-4%22%5D%0A%20%20%20%20f%20%5Blabel%3D%22f%3A%201-2%22%5D%0A%20%20%20%20%0A%20%20%20%20a%20-%3E%20c%0A%20%20%20%20a%20-%3E%20d%0A%20%20%20%20a%20-%3E%20e%0A%20%20%20%20%0A%20%20%20%20b%20-%3E%20c%0A%20%20%20%20b%20-%3E%20d%0A%20%20%20%20b%20-%3E%20e%0A%20%20%20%20%0A%20%20%20%20f%20-%3E%20c%0A%20%20%20%20f%20-%3E%20d%0A%20%20%20%20f%20-%3E%20e%0A%7D
  const graph = buildGraph(
    shuffle([
      { id: 'a', start: 0, end: 2 },
      { id: 'b', start: 1, end: 2 },
      { id: 'c', start: 3, end: 4 },
      { id: 'd', start: 3, end: 4 },
      { id: 'e', start: 3, end: 4 },
      { id: 'f', start: 1, end: 2 },
    ])
  ).serialize()

  expect(graph.edges).toEqual<Graph['edges']>({
    a: {
      c: [null],
      d: [null],
      e: [null],
    },
    b: {
      c: [null],
      d: [null],
      e: [null],
    },
    f: {
      c: [null],
      d: [null],
      e: [null],
    },
  })
})
