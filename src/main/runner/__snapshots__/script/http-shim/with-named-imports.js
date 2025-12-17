import {get, post} from "/mock/resources/shims/http.js";
export default function () {
  get("http://test.k6.io");
  post("http://test.k6.io", JSON.stringify({
    data: 'test'
  }));
}
export function handleSummary() {
  console.log("This is the handleSummary shim");
}
export const options = {
  scenarios: {
    default: {
      executor: "shared-iterations",
      vus: 1,
      iterations: 1
    }
  }
};
