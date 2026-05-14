import { expect, test } from "@playwright/test"

async function selectDemo(page: import("@playwright/test").Page, id: string) {
  await page.getByTestId("ui-cmdk-trigger").click()
  await expect(page.getByTestId("ui-cmdk")).toBeVisible()
  await page.getByTestId(`ui-cmdk-item-${id}`).click()
}

test.describe("MVP happy path", () => {
  test("user can swipe a card in the swipe deck", async ({ page }) => {
    await page.goto("/ui")
    await selectDemo(page, "swipe-deck")

    const topNameBefore = page.getByTestId("ui-deck-top-name")
    await expect(topNameBefore).toBeVisible()
    const beforeText = await topNameBefore.textContent()

    await page.getByTestId("ui-deck-swipe-right").click()
    await page.waitForTimeout(700)

    const topNameAfter = page.getByTestId("ui-deck-top-name")
    await expect(topNameAfter).toBeVisible()
    const afterText = await topNameAfter.textContent()

    expect(afterText).not.toBe(beforeText)
  })

  test("shared-entry project opens share modal in Farcaster mode", async ({ page, request, baseURL }) => {
    if (!baseURL) {
      test.skip(true, "Playwright baseURL is required")
    }

    const response = await request.get(`${baseURL!}/api/feed?seed=playwright-farcaster`)
    const body = (await response.json()) as { project?: { routeId?: string | null } | null }
    const slug = body.project?.routeId

    if (!slug) {
      test.skip(true, "No feed project available for shared-entry test")
    }

    await page.addInitScript(() => {
      window.localStorage.setItem("swipepad:onboarding-complete", "1")
    })

    await page.goto(`/p/${encodeURIComponent(slug!)}?__test_farcaster=1`)

    await expect(page.getByTestId("shared-entry-share-trigger")).toBeVisible()
    await page.getByTestId("shared-entry-share-trigger").click()
    await expect(page.getByTestId("share-modal")).toBeVisible()
    await expect(page.getByTestId("share-modal-farcaster")).toBeVisible()
  })
})
