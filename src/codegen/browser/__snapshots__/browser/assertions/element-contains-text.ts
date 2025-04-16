import { browser } from "k6/browser";
import { expect } from "https://jslib.k6.io/k6-testing/0.4.0/index.js";

export const options = {
  scenarios: {
    default: {
      executor: "shared-iterations",
      options: { browser: { type: "chromium" } },
    },
  },
};

export default async function () {
  const page = await browser.newPage();

  await expect(page.locator("button")).toContainText("Hello, World!");
}
