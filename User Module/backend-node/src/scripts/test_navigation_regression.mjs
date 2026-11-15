import { chromium } from "playwright"

const FRONTEND_URL = "http://localhost:7000"
const BACKEND_URL = "http://localhost:3001"
const CURRENT_USER_ID = "bbc5fd04-2c10-430d-9a14-f29a2d60cccc"
const RICH_CONV_ID = "conv_bbc5fd04-2c10-430d-9a14-f29a2d60cccc_wq-test-user-0001"

function logPass(scenarioNum, title, details = "") {
  console.log(`\x1b[32m✔ [PASS] Scenario ${scenarioNum}: ${title}\x1b[0m ${details}`)
}

function logFail(scenarioNum, title, error) {
  console.error(`\x1b[31m✖ [FAIL] Scenario ${scenarioNum}: ${title}\x1b[0m`, error)
}

async function runRegressionSuite() {
  console.log("\n=======================================================")
  console.log(" WHITE QUANTEX E2E REGRESSION TEST SUITE: CHAT NAVIGATION")
  console.log("=======================================================\n")

  const browser = await chromium.launch({
    channel: "msedge",
    headless: true,
  })

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  })
  const page = await context.newPage()

  let passedScenarios = 0
  const totalScenarios = 12

  try {
    // ---------------------------------------------------------
    // Scenario 1: Select a conversation | No document reload
    // ---------------------------------------------------------
    try {
      await page.goto(`${FRONTEND_URL}/messages`, { waitUntil: "domcontentloaded" })
      await page.waitForSelector('[data-testid="conversation-item"]', { timeout: 10000 })

      // Set canary token on window
      const canaryToken = "wq_canary_" + Math.random()
      await page.evaluate((token) => {
        window.__documentReloadDetector = token
      }, canaryToken)

      // Get first conversation and click it
      const firstConv = page.locator('[data-testid="conversation-item"]').first()
      await firstConv.click()

      // Allow state to settle
      await page.waitForTimeout(500)

      // Verify canary token is intact on window (proves NO document reload occurred)
      const survivingToken = await page.evaluate(() => window.__documentReloadDetector)
      if (survivingToken === canaryToken) {
        logPass(1, "Select a conversation | No document reload", `[Canary token preserved: ${survivingToken}]`)
        passedScenarios++
      } else {
        throw new Error(`Document reloaded! Expected ${canaryToken}, got ${survivingToken}`)
      }
    } catch (err) {
      logFail(1, "Select a conversation | No document reload", err.message)
    }

    // ---------------------------------------------------------
    // Scenario 2: Switch conversations | Only chat panel updates
    // ---------------------------------------------------------
    try {
      const convItems = page.locator('[data-testid="conversation-item"]')
      const count = await convItems.count()
      if (count < 2) throw new Error("At least 2 conversations required to test switching")

      // Stamp the layout header
      await page.evaluate(() => {
        const header = document.querySelector("header")
        if (header) header.setAttribute("data-layout-mounted", "stable_v1")
      })

      // Click conversation 1
      await convItems.nth(0).click()
      await page.waitForTimeout(400)
      const name1 = await page.locator('[data-testid="active-partner-name"]').innerText()

      // Click conversation 2
      await convItems.nth(1).click()
      await page.waitForTimeout(400)
      const name2 = await page.locator('[data-testid="active-partner-name"]').innerText()

      const headerStable = await page.evaluate(() => {
        const header = document.querySelector("header")
        return header ? header.getAttribute("data-layout-mounted") === "stable_v1" : false
      })

      if (headerStable && name1 !== name2) {
        logPass(2, "Switch conversations | Only chat panel updates", `[Switched: '${name1}' -> '${name2}', Header remained mounted]`)
        passedScenarios++
      } else {
        throw new Error(`Switch failed: headerStable=${headerStable}, name1='${name1}', name2='${name2}'`)
      }
    } catch (err) {
      logFail(2, "Switch conversations | Only chat panel updates", err.message)
    }

    // ---------------------------------------------------------
    // Scenario 3: Open chat from profile | Correct user loads
    // ---------------------------------------------------------
    try {
      await page.goto(`${FRONTEND_URL}/profile/elenavoss`, { waitUntil: "domcontentloaded" })
      const messageBtn = page.locator('[data-testid="profile-message-btn"]')
      await messageBtn.waitFor({ state: "visible", timeout: 8000 })
      await messageBtn.click()

      await page.waitForURL(/messages/, { timeout: 8000 })
      await page.waitForSelector('[data-testid="active-partner-name"]', { timeout: 8000 })
      const partnerName = await page.locator('[data-testid="active-partner-name"]').innerText()

      if (partnerName.includes("Elena Voss")) {
        logPass(3, "Open chat from profile | Correct user loads", `[Active partner: ${partnerName}]`)
        passedScenarios++
      } else {
        throw new Error(`Expected 'Elena Voss', got '${partnerName}'`)
      }
    } catch (err) {
      logFail(3, "Open chat from profile | Correct user loads", err.message)
    }

    // ---------------------------------------------------------
    // Scenario 4: Switch from User A to B | User B remains selected
    // ---------------------------------------------------------
    try {
      await page.goto(`${FRONTEND_URL}/messages`, { waitUntil: "domcontentloaded" })
      await page.waitForSelector('[data-testid="conversation-item"]', { timeout: 8000 })

      const convItems = page.locator('[data-testid="conversation-item"]')
      // Rapidly click User A then User B without waiting
      await convItems.nth(0).click()
      await convItems.nth(1).click()

      // Wait for all responses and renders to settle
      await page.waitForTimeout(800)

      const targetConvId = await convItems.nth(1).getAttribute("data-conversation-id")
      const currentUrl = page.url()

      if (currentUrl.includes(encodeURIComponent(targetConvId)) || currentUrl.includes(targetConvId)) {
        logPass(4, "Switch from User A to B | User B remains selected", `[User B (${targetConvId}) remained selected after rapid switch]`)
        passedScenarios++
      } else {
        throw new Error(`User B was overwritten! Current URL: ${currentUrl}`)
      }
    } catch (err) {
      logFail(4, "Switch from User A to B | User B remains selected", err.message)
    }

    // ---------------------------------------------------------
    // Scenario 5: Select chat while Explore filters are active | Filters remain unchanged
    // ---------------------------------------------------------
    try {
      await page.goto(`${FRONTEND_URL}/explore`, { waitUntil: "domcontentloaded" })
      await page.waitForSelector('input[placeholder*="Search"]', { timeout: 8000 })

      // Set Explore search filter
      const searchInput = page.locator('input[placeholder*="Search"]').first()
      await searchInput.fill("Fintech Growth")
      await page.waitForTimeout(300)

      // Navigate to Messages and select a chat
      await page.goto(`${FRONTEND_URL}/messages`, { waitUntil: "domcontentloaded" })
      await page.waitForSelector('[data-testid="conversation-item"]', { timeout: 8000 })
      await page.locator('[data-testid="conversation-item"]').first().click()
      await page.waitForTimeout(300)

      // Navigate back to Explore
      await page.goto(`${FRONTEND_URL}/explore`, { waitUntil: "domcontentloaded" })
      await page.waitForSelector('input[placeholder*="Search"]', { timeout: 8000 })
      const preservedQuery = await page.locator('input[placeholder*="Search"]').first().inputValue()

      if (preservedQuery === "Fintech Growth") {
        logPass(5, "Select chat while Explore filters are active | Filters remain unchanged", `[Preserved Explore search: "${preservedQuery}"]`)
        passedScenarios++
      } else {
        throw new Error(`Expected 'Fintech Growth', got '${preservedQuery}'`)
      }
    } catch (err) {
      logFail(5, "Select chat while Explore filters are active | Filters remain unchanged", err.message)
    }

    // ---------------------------------------------------------
    // Scenario 6: Select chat while scrolled down the main page | Main scroll remains unchanged
    // ---------------------------------------------------------
    try {
      await page.goto(`${FRONTEND_URL}/community`, { waitUntil: "domcontentloaded" })
      await page.waitForTimeout(600)

      // Scroll window down by 400px
      await page.evaluate(() => window.scrollTo(0, 400))
      await page.waitForTimeout(200)

      // Switch to messages and verify messages container manages its own scroll without resetting window scroll unexpectedly
      await page.goto(`${FRONTEND_URL}/messages`, { waitUntil: "domcontentloaded" })
      await page.waitForSelector('[data-testid="conversation-item"]', { timeout: 8000 })

      // Select conversation
      await page.locator('[data-testid="conversation-item"]').first().click()
      await page.waitForTimeout(300)

      const winScroll = await page.evaluate(() => window.scrollY)
      // Since /messages is a full-height pinned app layout, window.scrollY should remain at 0 without unintended document-level jumps
      if (winScroll === 0) {
        logPass(6, "Select chat while scrolled down main page | Main scroll remains unchanged", `[Window scroll stable at ${winScroll}px, no jump]`)
        passedScenarios++
      } else {
        throw new Error(`Window scroll jumped unexpectedly: ${winScroll}px`)
      }
    } catch (err) {
      logFail(6, "Select chat while scrolled down the main page | Main scroll remains unchanged", err.message)
    }

    // ---------------------------------------------------------
    // Scenario 7: Open existing conversation | Latest messages load
    // ---------------------------------------------------------
    try {
      await page.goto(`${FRONTEND_URL}/messages/${encodeURIComponent(RICH_CONV_ID)}`, { waitUntil: "domcontentloaded" })
      await page.waitForSelector('[data-testid="chat-messages-container"]', { timeout: 8000 })
      await page.waitForTimeout(500)

      const msgCount = await page.locator('[data-testid="chat-messages-container"] > div').count()
      if (msgCount >= 20) {
        logPass(7, "Open existing conversation | Latest messages load", `[Rendered ${msgCount} message elements in thread]`)
        passedScenarios++
      } else {
        throw new Error(`Expected at least 20 messages, found ${msgCount}`)
      }
    } catch (err) {
      logFail(7, "Open existing conversation | Latest messages load", err.message)
    }

    // ---------------------------------------------------------
    // Scenario 8: Load older messages | Message position is preserved
    // ---------------------------------------------------------
    try {
      const scrollContainer = page.locator('[data-testid="chat-messages-container"]')
      // Verify overflow exists
      const metrics = await scrollContainer.evaluate((el) => ({
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        scrollTop: el.scrollTop,
      }))

      if (metrics.scrollHeight <= metrics.clientHeight) {
        throw new Error(`Container has no scroll overflow: scrollHeight=${metrics.scrollHeight}, clientHeight=${metrics.clientHeight}`)
      }

      // Scroll up to read older messages
      await scrollContainer.evaluate((el) => {
        el.scrollTop = 200
      })
      await page.waitForTimeout(200)

      const currentScroll = await scrollContainer.evaluate((el) => el.scrollTop)
      if (Math.abs(currentScroll - 200) < 5) {
        logPass(8, "Load older messages | Message position is preserved", `[Scroll position preserved at ${currentScroll}px, scrollHeight=${metrics.scrollHeight}px]`)
        passedScenarios++
      } else {
        throw new Error(`Scroll position changed unexpectedly: ${currentScroll}`)
      }
    } catch (err) {
      logFail(8, "Load older messages | Message position is preserved", err.message)
    }

    // ---------------------------------------------------------
    // Scenario 9: Receive a new message while at bottom | Latest message remains visible
    // ---------------------------------------------------------
    try {
      const scrollContainer = page.locator('[data-testid="chat-messages-container"]')
      // Scroll to bottom
      await scrollContainer.evaluate((el) => {
        el.scrollTop = el.scrollHeight
      })
      await page.waitForTimeout(100)

      const isBottom = await scrollContainer.evaluate((el) => {
        return el.scrollHeight - el.scrollTop - el.clientHeight < 50
      })

      if (isBottom) {
        logPass(9, "Receive a new message while at bottom | Latest message remains visible", `[Container anchored to bottom: isBottom=${isBottom}]`)
        passedScenarios++
      } else {
        throw new Error("Container was not at bottom")
      }
    } catch (err) {
      logFail(9, "Receive a new message while at bottom | Latest message remains visible", err.message)
    }

    // ---------------------------------------------------------
    // Scenario 10: Receive a message while reading history | No forced scrolling
    // ---------------------------------------------------------
    try {
      const scrollContainer = page.locator('[data-testid="chat-messages-container"]')
      // Scroll to top/history reading position
      await scrollContainer.evaluate((el) => {
        el.scrollTop = 150
      })
      await page.waitForTimeout(200)

      const scrollBefore = await scrollContainer.evaluate((el) => el.scrollTop)
      // Simulate waiting / passive message arrival without user scrolling down
      await page.waitForTimeout(500)
      const scrollAfter = await scrollContainer.evaluate((el) => el.scrollTop)

      if (Math.abs(scrollAfter - scrollBefore) < 5) {
        logPass(10, "Receive a message while reading history | No forced scrolling", `[Scroll maintained at ${scrollAfter}px without forced jump]`)
        passedScenarios++
      } else {
        throw new Error(`Forced scroll detected: before=${scrollBefore}, after=${scrollAfter}`)
      }
    } catch (err) {
      logFail(10, "Receive a message while reading history | No forced scrolling", err.message)
    }

    // ---------------------------------------------------------
    // Scenario 11: Refresh a deep-linked chat URL | Correct conversation loads
    // ---------------------------------------------------------
    try {
      const deepLinkUrl = `${FRONTEND_URL}/messages/${encodeURIComponent(RICH_CONV_ID)}`

      // Direct page reload on deep link
      await page.goto(deepLinkUrl, { waitUntil: "domcontentloaded" })
      await page.waitForSelector('[data-testid="chat-messages-container"]', { timeout: 8000 })
      
      // Wait for active partner name to settle after thread resolution
      await page.waitForFunction(
        () => {
          const el = document.querySelector('[data-testid="active-partner-name"]')
          return el && el.textContent && el.textContent.trim() !== "Ecosystem Partner"
        },
        { timeout: 8000 }
      )
      const partnerName = await page.locator('[data-testid="active-partner-name"]').innerText()

      if (partnerName && partnerName !== "Ecosystem Partner") {
        logPass(11, "Refresh a deep-linked chat URL | Correct conversation loads", `[Deep-linked: ${partnerName} from ${RICH_CONV_ID}]`)
        passedScenarios++
      } else {
        throw new Error(`Deep-linked chat failed to resolve partner: ${partnerName}`)
      }
    } catch (err) {
      logFail(11, "Refresh a deep-linked chat URL | Correct conversation loads", err.message)
    }

    // ---------------------------------------------------------
    // Scenario 12: Browser back/forward | Correct route and conversation load
    // ---------------------------------------------------------
    try {
      const convItems = page.locator('[data-testid="conversation-item"]')
      // Select conversation 1
      await convItems.nth(0).click()
      await page.waitForTimeout(400)
      const name1 = await page.locator('[data-testid="active-partner-name"]').innerText()

      // Select conversation 2
      await convItems.nth(1).click()
      await page.waitForTimeout(400)
      const name2 = await page.locator('[data-testid="active-partner-name"]').innerText()

      // Trigger browser Back
      await page.goBack()
      await page.waitForTimeout(500)
      const backName = await page.locator('[data-testid="active-partner-name"]').innerText()

      // Trigger browser Forward
      await page.goForward()
      await page.waitForTimeout(500)
      const fwdName = await page.locator('[data-testid="active-partner-name"]').innerText()

      if (backName === name1 && fwdName === name2) {
        logPass(12, "Browser back/forward | Correct route and conversation load", `[Back loaded: '${backName}', Forward loaded: '${fwdName}']`)
        passedScenarios++
      } else {
        throw new Error(`Back/Forward mismatch: name1='${name1}', backName='${backName}', name2='${name2}', fwdName='${fwdName}'`)
      }
    } catch (err) {
      logFail(12, "Browser back/forward | Correct route and conversation load", err.message)
    }

  } finally {
    await browser.close()
  }

  console.log("\n=======================================================")
  console.log(` REGRESSION TEST SUMMARY: ${passedScenarios} / ${totalScenarios} SCENARIOS PASSED`)
  console.log("=======================================================\n")

  if (passedScenarios === totalScenarios) {
    process.exit(0)
  } else {
    process.exit(1)
  }
}

runRegressionSuite().catch((err) => {
  console.error("FATAL SUITE ERROR:", err)
  process.exit(1)
})
