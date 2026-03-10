import { expect, test } from "@playwright/test"

type FeedResponse = {
  project: {
    routeId: string
  } | null
}

async function getSharedSlug(
  request: import("@playwright/test").APIRequestContext,
  baseURL: string,
): Promise<string | null> {
  const response = await request.get(`${baseURL}/api/feed?seed=playwright-farcaster`)
  const body = (await response.json()) as FeedResponse
  return body.project?.routeId ?? null
}

test.describe("Farcaster Mini App host", () => {
  test("shares a shared-entry project through the simulated Warpcast composer", async ({
    page,
    request,
    baseURL,
  }) => {
    if (!baseURL) {
      test.skip(true, "Playwright baseURL is required")
    }

    const slug = await getSharedSlug(request, baseURL!)
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

    await page.getByTestId("share-modal-farcaster").click()

    await expect.poll(async () => {
      return await page.evaluate(() => window.__SWIPEPAD_LAST_COMPOSE_CAST__?.embeds?.[0] ?? null)
    }).toBe(`https://app.swipepad.xyz/p/${encodeURIComponent(slug!)}`)
  })
})
