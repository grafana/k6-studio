import { check as check } from "k6";
export function handleSummary() {}
export default function () {
  check(true, { "is true": (value) => value === true });
}
