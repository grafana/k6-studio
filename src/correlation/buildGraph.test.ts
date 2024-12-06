import { it, expect } from 'vitest'
import { buildGraph } from './buildGraph'
import { SerializedGraph } from '@/utils/graph/types'
import { test, fc } from '@fast-check/vitest'

type Graph = SerializedGraph<
  { id: string; started: number; ended: number },
  null
>

it('should return an empty graph if there are no requests', ({ expect }) => {
  const graph = buildGraph([])

  expect(graph.order).toBe(0)
})

it('should return a graph with a single node and no edges if there is one request', ({
  expect,
}) => {
  const graph = buildGraph([{ id: 'a', started: 0, ended: 1 }])

  expect(graph.order).toBe(1)
  expect(graph.size).toBe(0)
})

it("should add an edge when nodes don't have overlapping ranges", ({
  expect,
}) => {
  const graph = buildGraph([
    { id: 'a', started: 0, ended: 1 },
    { id: 'b', started: 2, ended: 3 },
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
    { id: 'a', started: 10, ended: 12 },
    { id: 'b', started: 2, ended: 3 },
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
  const graph = buildGraph([
    { id: 'a', started: 0, ended: 1 },
    { id: 'b', started: 1, ended: 2 },
  ]).serialize()

  expect(graph.edges).toEqual<Graph['edges']>({})
})

it('should add parallel edges when nodes have overlapping ranges', ({
  expect,
}) => {
  // GraphViz: https://dreampuf.github.io/GraphvizOnline/?engine=dot#digraph%20G%20%7B%0A%20%20%20%20a%20%5Blabel%3D%22a%3A%200-1%22%5D%0A%20%20%20%20b%20%5Blabel%3D%22b%3A%202-4%22%5D%0A%20%20%20%20c%20%5Blabel%3D%22c%3A%203-5%22%5D%0A%20%20%20%20%0A%20%20%20%20a%20-%3E%20b%0A%20%20%20%20a%20-%3E%20c%0A%7D
  const graph = buildGraph([
    { id: 'a', started: 0, ended: 1 },
    { id: 'b', started: 2, ended: 4 },
    { id: 'c', started: 3, ended: 5 },
  ]).serialize()

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
  const graph = buildGraph([
    { id: 'a', started: 0, ended: 1 }, // Should be first
    { id: 'b', started: 4, ended: 5 }, // Should be third
    { id: 'c', started: 2, ended: 3 }, // Should be second
  ]).serialize()

  expect(graph.edges).toEqual<Graph['edges']>({
    a: {
      c: [null],
    },
    c: {
      b: [null],
    },
  })
})

it('should insert node at all incoming edges', ({ expect }) => {
  // GraphViz: https://dreampuf.github.io/GraphvizOnline/?engine=dot#digraph%20G%20%7B%0A%20%20%20%20a%20%5Blabel%3D%22a%3A%200-1%22%5D%0A%20%20%20%20b%20%5Blabel%3D%22b%3A%202-4%22%5D%0A%20%20%20%20c%20%5Blabel%3D%22c%3A%203-4%22%5D%0A%20%20%20%20d%20%5Blabel%3D%22d%3A%205-6%22%5D%0A%20%20%20%20e%20%5Blabel%3D%22e%3A%207-8%22%5D%0A%20%20%20%20%0A%20%20%20%20a%20-%3E%20b%0A%20%20%20%20a%20-%3E%20c%0A%20%20%20%20b%20-%3E%20d%0A%20%20%20%20c%20-%3E%20d%0A%20%20%20%20d%20-%3E%20e%0A%7D
  const graph = buildGraph([
    { id: 'a', started: 0, ended: 1 },
    { id: 'c', started: 3, ended: 4 },
    { id: 'b', started: 2, ended: 4 },
    { id: 'e', started: 7, ended: 8 },
    { id: 'd', started: 5, ended: 6 },
  ]).serialize()

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
  const graph = buildGraph([
    { id: 'a', started: 0, ended: 1 },
    { id: 'b', started: 2, ended: 4 },
    { id: 'c', started: 3, ended: 4 },
    { id: 'd', started: 5, ended: 6 },
    { id: 'e', started: 7, ended: 8 },
    { id: 'f', started: 2, ended: 6 },
  ]).serialize()

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
  const graph = buildGraph([
    { id: 'a', started: 0, ended: 1 },
    { id: 'b', started: 2, ended: 4 },
    { id: 'c', started: 3, ended: 4 },
    { id: 'd', started: 6, ended: 7 },
    { id: 'e', started: 8, ended: 9 },
    { id: 'f', started: 3, ended: 5 },
  ]).serialize()

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
  const graph = buildGraph([
    { id: 'a', started: 0, ended: 1 },
    { id: 'b', started: 0, ended: 1 },
    { id: 'c', started: 0, ended: 1 },
    { id: 'd', started: 10, ended: 11 },
    { id: 'f', started: 5, ended: 6 },
  ]).serialize()

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
  const graph = buildGraph([
    { id: 'a', started: 0, ended: 2 },
    { id: 'b', started: 1, ended: 2 },
    { id: 'c', started: 3, ended: 4 },
    { id: 'd', started: 3, ended: 4 },
    { id: 'e', started: 3, ended: 4 },
    { id: 'f', started: 1, ended: 2 },
  ]).serialize()

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

const arbitraryNode = fc
  .record({
    started: fc.nat(),
    ended: fc.nat(),
  })
  .filter(({ started, ended }) => started < ended)

test.prop([fc.array(arbitraryNode)])(
  'should keep nodes ordered based on start time',
  (nodes) => {
    const graph = buildGraph(
      nodes.map((node, index) => ({ ...node, id: index.toString() }))
    )

    for (const edge of graph.edges()) {
      const resolved = graph.resolveEdge(edge)

      expect(resolved.to.value.started).toBeGreaterThan(
        resolved.from.value.ended
      )
    }
  }
)

test.prop([fc.array(arbitraryNode)])(
  'should keep nodes ordered based on end time',
  (nodes) => {
    const graph = buildGraph(
      nodes.map((node, index) => ({ ...node, id: index.toString() }))
    )

    for (const edge of graph.edges()) {
      const resolved = graph.resolveEdge(edge)

      expect(resolved.from.value.ended).toBeLessThan(resolved.to.value.started)
    }
  }
)
