import { check as check } from "k6";
export default function () {
  check(true, { "is true": (value) => value === true });
}
export function handleSummary() {
  console.log("This is the handleSummary shim");
}
