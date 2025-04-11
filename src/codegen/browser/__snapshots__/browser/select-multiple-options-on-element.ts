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

  await page.locator("select").selectOption(["option1", "option2"]);
}
