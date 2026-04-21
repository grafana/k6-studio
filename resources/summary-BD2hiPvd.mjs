import http from 'k6/http';
import execution from 'k6/execution';

function instrumentParams(params) {
  const safeParams = params ?? {};
  const group = `${execution.vu.metrics.tags.group}`.trim().replace(/^::/, "");
  const groupHeaders = {
    "X-k6-group": group
  };
  const updatedParams = Object.assign({}, safeParams, {
    headers: Object.assign({}, safeParams.headers || {}, groupHeaders)
  });
  return updatedParams;
}

const originalRequest = http.request;
const originalAsyncRequest = http.asyncRequest;
http.request = function(method, url, body, params) {
  return originalRequest(method, url, body, instrumentParams(params));
};
http.asyncRequest = function(method, url, body, params) {
  return originalAsyncRequest(method, url, body, instrumentParams(params));
};
http.get = function(url, params) {
  return http.request("GET", url, null, instrumentParams(params));
};
http.head = function(url, params) {
  return http.request("HEAD", url, null, instrumentParams(params));
};
http.post = function(url, body, params) {
  return http.request("POST", url, body, instrumentParams(params));
};
http.put = function(url, body, params) {
  return http.request("PUT", url, body, instrumentParams(params));
};
http.patch = function(url, body, params) {
  return http.request("PATCH", url, body, instrumentParams(params));
};
http.del = function(url, body, params) {
  return http.request("DELETE", url, body, instrumentParams(params));
};
http.options = function(url, body, params) {
  return http.request("OPTIONS", url, body, instrumentParams(params));
};

function handleSummary(data) {
  const checks = [];
  function traverseGroup(group) {
    if (group.checks) {
      group.checks.forEach((check) => {
        checks.push(check);
      });
    }
    if (group.groups) {
      group.groups.forEach((subGroup) => {
        traverseGroup(subGroup);
      });
    }
  }
  traverseGroup(data.root_group);
  return {
    stdout: JSON.stringify(checks)
  };
}

export { handleSummary as h };
