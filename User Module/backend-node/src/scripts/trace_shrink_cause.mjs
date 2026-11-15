import { chromium } from "playwright"

async function traceShrinkCause() {
  const browser = await chromium.launch({ channel: "msedge", headless: true })
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const page = await context.newPage()

  await page.goto("http://localhost:7000/messages", { waitUntil: "domcontentloaded" })
  await page.waitForSelector('[data-testid="conversation-item"]', { timeout: 8000 })

  await page.evaluate(() => {
    window.__shrinkEvents = []
    const target = document.querySelector('.max-w-7xl')
    
    // Check every 10ms for 1.5 seconds during click
    window.__startMonitoring = () => {
      const interval = setInterval(() => {
        const targetRect = target.getBoundingClientRect()
        const parentRect = target.parentElement.getBoundingClientRect()
        const mainRect = document.querySelector('main').getBoundingClientRect()
        const bodyRect = document.body.getBoundingClientRect()
        const computed = window.getComputedStyle(target)
        const parentComputed = window.getComputedStyle(target.parentElement)
        
        window.__shrinkEvents.push({
          targetWidth: targetRect.width,
          parentWidth: parentRect.width,
          parentTagName: target.parentElement.tagName,
          parentClassName: target.parentElement.className,
          mainWidth: mainRect.width,
          bodyWidth: bodyRect.width,
          targetTransform: computed.transform,
          parentTransform: parentComputed.transform,
          targetFlex: computed.flex,
          parentDisplay: parentComputed.display,
          parentFlexDirection: parentComputed.flexDirection,
          parentAlignItems: parentComputed.alignItems,
          time: performance.now()
        })
      }, 10)
      setTimeout(() => clearInterval(interval), 1200)
    }
  })

  const convItems = page.locator('[data-testid="conversation-item"]')
  await page.evaluate(() => window.__startMonitoring())
  await convItems.nth(1).click()

  await page.waitForTimeout(1300)

  const events = await page.evaluate(() => window.__shrinkEvents)
  
  // Find events where targetWidth < 1200
  const shrunkEvents = events.filter(e => e.targetWidth < 1200)
  console.log(`Total events: ${events.length}, Shrunk events: ${shrunkEvents.length}`)
  if (shrunkEvents.length > 0) {
    console.log("Sample shrunk event:", shrunkEvents[0])
    console.log("Sample normal event:", events[0])
  }

  await browser.close()
}

traceShrinkCause().catch(err => {
  console.error(err)
  process.exit(1)
})
