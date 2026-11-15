import { chromium } from "playwright"

async function testScenario3() {
  const browser = await chromium.launch({ channel: "msedge", headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  console.log("Navigating to /profile/elenavoss...")
  await page.goto("http://localhost:7000/profile/elenavoss", { waitUntil: "domcontentloaded" })

  const btn = page.locator('[data-testid="profile-message-btn"]')
  await btn.waitFor({ state: "visible", timeout: 8000 })
  console.log("Message button visible, clicking...")
  await btn.click()

  console.log("Waiting for /messages navigation...")
  await page.waitForURL(/messages/, { timeout: 8000 })
  console.log("Current URL after click:", page.url())

  await page.waitForSelector('[data-testid="active-partner-name"]', { timeout: 8000 })
  const partnerName = await page.locator('[data-testid="active-partner-name"]').innerText()
  console.log("Active partner name displayed:", partnerName)

  await browser.close()
}

testScenario3().catch(err => {
  console.error("Test failed:", err)
  process.exit(1)
})
