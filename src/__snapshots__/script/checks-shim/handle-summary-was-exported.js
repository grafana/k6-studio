import { check as check } from "k6";
export function handleSummary() {
  console.log("This is the user-defined handleSummary function");
}
export default function () {
  check(true, { "is true": (value) => value === true });
}
