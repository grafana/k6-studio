export async function fetchPersonalToken(_stackId: string, _token: string) {
  return new Promise<{ api_token: string }>((resolve) => {
    setTimeout(() => {
      resolve({
        api_token: MOCK_PERSONAL_API_TOKEN,
      })
    }, 20_000)
  })
}
