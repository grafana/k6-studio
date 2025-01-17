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

  const locator = page.locator("button");

  await locator.click();

  await locator.click();
}
