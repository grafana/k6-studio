import http from "k6/http";
(function () {
  console.log("This is the groups shim");
})();
import myExec from "k6/execution";
export default function () {}
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
