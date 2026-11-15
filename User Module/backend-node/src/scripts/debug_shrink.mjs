import { chromium } from "playwright"

async function debugShrink() {
  const browser = await chromium.launch({ channel: "msedge", headless: true })
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const page = await context.newPage()

  await page.goto("http://localhost:7000/messages", { waitUntil: "domcontentloaded" })
  await page.waitForSelector('[data-testid="conversation-item"]', { timeout: 8000 })

  const initialDocMetrics = await page.evaluate(() => ({
    docScrollHeight: document.documentElement.scrollHeight,
    docClientHeight: document.documentElement.clientHeight,
    bodyScrollHeight: document.body.scrollHeight,
    windowInnerHeight: window.innerHeight,
    hasVerticalScrollbar: document.documentElement.scrollHeight > window.innerHeight,
    containerWidth: document.querySelector('.max-w-7xl')?.getBoundingClientRect().width,
    mainPadding: window.getComputedStyle(document.querySelector('main')).padding,
  }))
  console.log("Initial doc metrics:", initialDocMetrics)

  // Track changes during click
  let widthChanges = []
  await page.exposeFunction("logWidthChange", (data) => {
    widthChanges.push(data)
  })

  await page.evaluate(() => {
    let lastWidth = document.querySelector('.max-w-7xl')?.getBoundingClientRect().width
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width
        const scrollH = document.documentElement.scrollHeight
        const innerH = window.innerHeight
        window.logWidthChange({
          width: w,
          hasDocScrollbar: scrollH > innerH,
          docScrollHeight: scrollH,
          innerH: innerH,
          time: performance.now()
        })
      }
    })
    const el = document.querySelector('.max-w-7xl')
    if (el) observer.observe(el)
  })

  const convItems = page.locator('[data-testid="conversation-item"]')
  console.log("Clicking conversation 2...")
  await convItems.nth(1).click()
  await page.waitForTimeout(600)

  console.log("Clicking conversation 1...")
  await convItems.nth(0).click()
  await page.waitForTimeout(600)

  console.log("Recorded width changes:", widthChanges)

  await browser.close()
}

debugShrink().catch(err => {
  console.error(err)
  process.exit(1)
})
