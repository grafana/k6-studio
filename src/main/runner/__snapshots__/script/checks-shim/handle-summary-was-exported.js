import {check} from "k6";
export function handleSummary() {
  console.log("This is the user-defined handleSummary function");
}
export default function () {
  check(true, {
    'is true': value => value === true
  });
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
