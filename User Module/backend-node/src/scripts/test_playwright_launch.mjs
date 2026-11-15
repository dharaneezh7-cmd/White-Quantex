import { chromium } from "playwright"

async function testLaunch() {
  console.log("Launching browser...")
  const browser = await chromium.launch({
    channel: "msedge",
    headless: true,
  })
  const context = await browser.newContext()
  const page = await context.newPage()
  
  await page.goto("http://localhost:7000/messages", { waitUntil: "networkidle" })
  const title = await page.title()
  console.log("Loaded page title:", title)
  
  const conversations = await page.locator("button[data-conversation-id], div[data-conversation-id], div:has-text('Messages')").count()
  console.log("Elements found count:", conversations)
  
  await browser.close()
  console.log("Browser launch test successful!")
}

testLaunch().catch(err => {
  console.error("Browser launch test failed:", err)
  process.exit(1)
})
