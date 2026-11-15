import { chromium } from "playwright"

async function testScenario8() {
  const browser = await chromium.launch({ channel: "msedge", headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  const convId = "conv_bbc5fd04-2c10-430d-9a14-f29a2d60cccc_wq-test-user-0001"
  await page.goto(`http://localhost:7000/messages/${encodeURIComponent(convId)}`, { waitUntil: "domcontentloaded" })
  await page.waitForSelector('[data-testid="chat-messages-container"]', { timeout: 8000 })
  await page.waitForTimeout(600)

  const scrollMetrics = await page.locator('[data-testid="chat-messages-container"]').evaluate((el) => {
    return {
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
      scrollTop: el.scrollTop,
    }
  })
  console.log("Initial metrics:", scrollMetrics)

  // Scroll up to position 150
  await page.locator('[data-testid="chat-messages-container"]').evaluate((el) => {
    el.scrollTop = 150
  })
  await page.waitForTimeout(300)

  const scrolledTop = await page.locator('[data-testid="chat-messages-container"]').evaluate((el) => el.scrollTop)
  console.log("Scrolled top is:", scrolledTop)

  await browser.close()
}

testScenario8().catch(err => {
  console.error("Test failed:", err)
  process.exit(1)
})
