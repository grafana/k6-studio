import { Graph } from '@/utils/graph/graph'
import { insertNode } from './buildGraph'
import { ExtractedValue } from './types'
import { ResolvedEdge } from '@/utils/graph/types'

interface ProxyRequest {
  id: string
  started: number
  ended: number
}

interface IndexedRequest {
  id: string
  started: number
  ended: number
  values: {
    response: Map<string, ExtractedValue>
    request: Map<string, ExtractedValue>
  }
  request: ProxyRequest
}

export type Definition = {
  type: 'definition'
  request: ProxyRequest
  value: ExtractedValue
}

export type Usage = {
  type: 'usage'
  request: ProxyRequest
  value: ExtractedValue
}

export class RecordingIndex {
  private graph = new Graph<IndexedRequest, null>()

  load(requests: ProxyRequest[]) {
    for (const request of requests) {
      this.index(request)
    }
  }

  index(request: ProxyRequest) {
    const indexedRequest: IndexedRequest = {
      ...request,
      values: {
        response: new Map(),
        request: new Map(),
      },
      request,
    }

    insertNode(this.graph, indexedRequest)
  }

  *findUsages(request: ProxyRequest, value: ExtractedValue): Generator<Usage> {
    const indexedRequest = this.graph.getNode(request.id)

    if (!indexedRequest) {
      return []
    }

    const hasNotRedefinedValue = (edge: ResolvedEdge<IndexedRequest, null>) => {
      return !edge.to.value.values.response.has(value.hash)
    }

    for (const edge of this.graph.descendants(
      indexedRequest,
      hasNotRedefinedValue
    )) {
      const usage = edge.to.value.values.request.get(value.hash)

      if (usage !== undefined) {
        yield {
          type: 'usage',
          request: edge.to.value.request,
          value: usage,
        }
      }
    }
  }

  *findDefinitions(
    request: ProxyRequest,
    value: ExtractedValue
  ): Generator<Definition> {
    const indexedRequest = this.graph.getNode(request.id)

    if (!indexedRequest) {
      return undefined
    }

    for (const edge of this.graph.ancestors(indexedRequest)) {
      const definition = edge.from.value.values.response.get(value.hash)

      if (definition !== undefined) {
        yield {
          type: 'definition',
          request: edge.from.value.request,
          value: definition,
        }
      }
    }
  }
}
