function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchPersonalToken(
  _stackId: string,
  _token: string,
  signal: AbortSignal
) {
  await timeout(5_000)

  signal.throwIfAborted()

  return {
    api_token: MOCK_PERSONAL_API_TOKEN,
  }
}
