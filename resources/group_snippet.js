import execution from 'k6/execution'

// saving the original values
const request = http.request
const asyncRequest = http.asyncRequest

class Client {
  // request instruments the http module's request function with the group header
  request(method, url, ...args) {
    const group = { 'X-k6-group': trimAndRemovePrefix(execution.vu.tags.group) }
    args = instrumentArguments(group, ...args)

    return request(method, url, ...args)
  }

  // asyncRequest instruments the http module's asyncRequest function with the group header
  async asyncRequest(method, url, ...args) {
    const group = { 'X-k6-group': trimAndRemovePrefix(execution.vu.tags.group) }
    args = instrumentArguments(group, ...args)

    return asyncRequest(method, url, ...args)
  }

  del(url, ...args) {
    return this.request('DELETE', url, ...args)
  }
  get(url, ...args) {
    return this.request('GET', url, null, ...args)
  }
  head(url, ...args) {
    return this.request('HEAD', url, null, ...args)
  }
  options(url, ...args) {
    return this.request('OPTIONS', url, ...args)
  }
  patch(url, ...args) {
    return this.request('PATCH', url, ...args)
  }
  post(url, ...args) {
    return this.request('POST', url, ...args)
  }
  put(url, ...args) {
    return this.request('PUT', url, ...args)
  }
}

function trimAndRemovePrefix(input) {
  // Use the trim method to remove leading and trailing whitespace
  let trimmedInput = input.trim()

  // Check if the trimmed input starts with "::" and remove it
  if (trimmedInput.startsWith('::')) {
    trimmedInput = trimmedInput.slice(2)
  }

  return trimmedInput
}

function instrumentArguments(groupName, ...args) {
  switch (args.length) {
    case 0:
      args.push(null)
    // fallthrough to add the header
    case 1:
      // We only received a body argument
      args.push({ headers: groupName })
      break
    default: // this handles 2 and more just in case someone provided more arguments
      // We received both a body and a params argument. In the
      // event params would be nullish, we'll instantiate
      // a new object.
      if (args[1] == null) args[1] = {}

      let params = args[1]
      if (params.headers == null) {
        params.headers = {}
      }
      Object.assign(params.headers, groupName)
      break
  }

  return args
}

function instrumentHTTP(opts) {
  const client = new Client(opts)

  http.del = client.del.bind(client)
  http.get = client.get.bind(client)
  http.head = client.head.bind(client)
  http.options = client.options.bind(client)
  http.patch = client.patch.bind(client)
  http.post = client.post.bind(client)
  http.put = client.put.bind(client)
  http.request = client.request.bind(client)
  http.asyncRequest = client.asyncRequest.bind(client)
}

instrumentHTTP({})
