export default function () {
  console.log("No http import");
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
