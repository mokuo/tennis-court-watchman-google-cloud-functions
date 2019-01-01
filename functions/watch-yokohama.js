const puppeteer = require('puppeteer')
const { clickAndWait } = require('../utils/click')

const PARKS = [
  { pageNumber: 2, buttonId: 'fbox_520' }, // 富岡西公園
]

const getParkInfo = async (browser, park) => {
  const context = await browser.createIncognitoBrowserContext()
  const page = await context.newPage()
  await page.goto('https://yoyaku.city.yokohama.lg.jp')
  const reservationSelector = '#outline #main001 .txt_area2 button#RSGK001_05'
  await page.waitFor(reservationSelector) // NOTE: リダイレクト処理を待つ
  await clickAndWait(page, reservationSelector)
  await clickAndWait(page, '#outline button#fbox_01')
  await clickAndWait(page, '#outline button#fbox_05')

  const nextPages = []
  for (let i = 1; i < park.pageNumber; i += 1) {
    nextPages.push(clickAndWait(page, '#outline .next button:first-child'))
  }
  await Promise.all(nextPages)

  await clickAndWait(page, `#outline button#${park.buttonId}`)
  await clickAndWait(page, '#outline button#fbox_00')

  await page.screenshot({ path: './test-end.png' })

  await context.close()
}

const watchYokohama = async () => {
  try {
    // await watch()
    const browser = await puppeteer.launch()
    await getParkInfo(browser, PARKS[0])
  } catch (err) {
    if (err instanceof Error) {
      console.error(err) // eslint-disable-line no-console
    } else {
      console.error(new Error(err)) // eslint-disable-line no-console
    }
  }
}

module.exports.watchYokohama = watchYokohama
