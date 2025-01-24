import { check as check } from "k6";
export default function () {
  check(true, { "is true": (value) => value === true });
}
