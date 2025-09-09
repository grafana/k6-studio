import http from "k6/http";
(function () {
  console.log("This is the groups shim");
})();
export default function () {
  http.get("http://test.k6.io");
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
