import { expect, test } from "@playwright/test"

async function selectDemo(page: import("@playwright/test").Page, id: string) {
  await page.getByTestId("ui-cmdk-trigger").click()
  await expect(page.getByTestId("ui-cmdk")).toBeVisible()
  await page.getByTestId(`ui-cmdk-item-${id}`).click()
}

test.describe("/ui kitchen sink", () => {
  test("renders base empty canvas", async ({ page }) => {
    await page.goto("/ui")
    await expect(page.getByTestId("ui-kitchen-sink")).toBeVisible()
    await expect(page.getByText("SwipePad").first()).toBeVisible()
    await expect(page.getByTestId("ui-canvas")).toBeVisible()
  })

  test("loads full project card and toggles boost state", async ({ page }) => {
    await page.goto("/ui")
    await selectDemo(page, "project-card")

    await expect(page.getByTestId("demo-project-card")).toBeVisible()
    await expect(page.getByTestId("ui-card-canvas")).toBeVisible()
    await expect(page.getByRole("heading", { name: "Regen Water DAO" })).toBeVisible()

    await page.getByTestId("ui-card-boost-toggle").click()
    await expect(page.getByText("Boosted")).toBeVisible()

    await page.getByTestId("ui-card-project-select").selectOption("2")
    await expect(page.getByRole("heading", { name: "River Agent Network" })).toBeVisible()
  })

  test("loads swipe deck and advances top card", async ({ page }) => {
    await page.goto("/ui")
    await selectDemo(page, "swipe-deck")

    const topName = page.getByTestId("ui-deck-top-name")
    const before = await topName.textContent()

    await page.getByTestId("ui-deck-swipe-right").click()
    await page.waitForTimeout(700)

    const after = await topName.textContent()
    expect(after).not.toBe(before)
  })

  test("loads button catalog and tracks click interactions", async ({ page }) => {
    await page.goto("/ui")
    await selectDemo(page, "button-catalog")

    await expect(page.getByTestId("demo-button-catalog")).toBeVisible()
    const counter = page.getByTestId("ui-button-catalog-clicks")
    const catalog = page.getByTestId("demo-button-catalog")
    await expect(counter).toContainText("0")

    await catalog.getByRole("button", { name: "Default" }).first().click()
    await catalog.getByRole("button", { name: "Boost" }).first().click()

    await expect(counter).toContainText("2")
  })
})
