import { browser } from "k6/browser";

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

  await page.locator("input").type("Hello, World!");
}
