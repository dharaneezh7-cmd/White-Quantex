import { chromium } from "playwright"

async function captureScreenshot() {
  const browser = await chromium.launch({ channel: "msedge", headless: true })
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const page = await context.newPage()

  await page.goto("http://localhost:7000/messages", { waitUntil: "domcontentloaded" })
  await page.waitForSelector('[data-testid="conversation-item"]', { timeout: 8000 })

  // Select conversation 1
  await page.locator('[data-testid="conversation-item"]').first().click()
  await page.waitForTimeout(600)

  await page.screenshot({ path: "C:/Users/Dharaneesh V/.gemini/antigravity/brain/9a8e6cef-3286-40ce-951a-9acb15a50014/scratch/fixed_chat_view.png" })
  console.log("Screenshot saved!")

  await browser.close()
}

captureScreenshot().catch(err => {
  console.error(err)
  process.exit(1)
})
