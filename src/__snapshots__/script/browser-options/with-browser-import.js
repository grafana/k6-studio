import browser from "k6/browser";

export default function () {}
export function handleSummary() {
  console.log("This is the handleSummary shim");
}
export const options = {
  scenarios: {
    default: {
      executor: "shared-iterations",
      vus: 1,
      iterations: 1,
      options: { browser: { type: "chromium" } },
    },
  },
};
