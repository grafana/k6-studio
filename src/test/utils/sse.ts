/** Encode SSE events as the A2A server would send them (all in one chunk). */
export function encodeSSE(
  events: Array<Record<string, unknown>>
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  return new ReadableStream({
    start(controller) {
      for (const event of events) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
      }
      controller.close()
    },
  })
}

/** Read a stream to completion, discarding all values. */
export async function drainStream(stream: ReadableStream): Promise<void> {
  const reader = stream.getReader()
  while (!(await reader.read()).done) {
    /* consume */
  }
}

/** Read a stream to completion, collecting all values. */
export async function collectStreamParts<T>(
  stream: ReadableStream<T>
): Promise<T[]> {
  const parts: T[] = []
  const reader = stream.getReader()
  let result = await reader.read()
  while (!result.done) {
    parts.push(result.value)
    result = await reader.read()
  }
  return parts
}

/** Encode SSE events where each event is a separate chunk (one per pull). */
export function encodeSSEChunked(
  events: Array<Record<string, unknown>>
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  const chunks = events.map((e) =>
    encoder.encode(`data: ${JSON.stringify(e)}\n\n`)
  )
  let index = 0
  return new ReadableStream({
    pull(controller) {
      if (index < chunks.length) {
        const chunk = chunks[index]
        if (chunk) controller.enqueue(chunk)
        index++
      } else {
        controller.close()
      }
    },
  })
}
