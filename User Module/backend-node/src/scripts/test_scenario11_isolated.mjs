import { chromium } from "playwright"

async function testScenario11() {
  const browser = await chromium.launch({ channel: "msedge", headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  const convId = "conv_bbc5fd04-2c10-430d-9a14-f29a2d60cccc_wq-test-user-0001"
  const url = `http://localhost:7000/messages/${encodeURIComponent(convId)}`
  console.log("Navigating directly to deep-link:", url)
  await page.goto(url, { waitUntil: "domcontentloaded" })

  console.log("Waiting for active-partner-name to settle...")
  await page.waitForFunction(
    () => {
      const el = document.querySelector('[data-testid="active-partner-name"]')
      return el && el.textContent && el.textContent.trim() !== "Ecosystem Partner"
    },
    { timeout: 8000 }
  )

  const partnerName = await page.locator('[data-testid="active-partner-name"]').innerText()
  console.log("Resolved partner name on deep-link:", partnerName)

  await browser.close()
}

testScenario11().catch(err => {
  console.error("Test failed:", err)
  process.exit(1)
})
