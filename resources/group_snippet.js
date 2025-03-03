;(function () {
  // saving the original values
  const httpRequest = http.request
  const httpAsyncRequest = http.asyncRequest

  class Client {
    // request instruments the http module's request function with the group header
    request(method, url, ...args) {
      return httpRequest(method, url, ...instrumentArguments(args))
    }

    // asyncRequest instruments the http module's asyncRequest function with the group header
    async asyncRequest(method, url, ...args) {
      return httpAsyncRequest(method, url, ...instrumentArguments(args))
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
    return input.trim().replace(/^::/, '')
  }

  function instrumentArguments(args) {
    const [body = null, params = {}] = args
    const groupHeaders = {
      'X-k6-group': trimAndRemovePrefix(execution.vu.tags.group),
    }

    const updatedParams = Object.assign({}, params, {
      headers: Object.assign({}, params.headers || {}, groupHeaders),
    })

    return [body, updatedParams]
  }

  function instrumentHTTP() {
    const client = new Client()

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

  instrumentHTTP()
})()
