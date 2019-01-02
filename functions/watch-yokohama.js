const puppeteer = require('puppeteer')
const { clickAndWait } = require('../utils/click')

const PARKS = [
  { pageNumber: 2, buttonId: 'fbox_520' }, // 富岡西公園
  { pageNumber: 2, buttonId: 'fbox_470' }, // 新杉田公園
]

const buildAvailableDateTimeObj = async (page) => {
  const displayDate = page.$eval('#outline table.tbl_month td.date strong', (strongElement) => {
    const array = strongElement.innerText.match(/\d+/g)
    return { year: array[0], month: array[1] }
  })

  const availableDateTimeObj = await page.$$eval('#outline table#calendar tbody input', (inputElements) => {
    const filteredInputElements = inputElements.map((inputElement) => {
      const day = new Date(displayDate.year, displayDate.month - 1, inputElement.value).getDay()
      return [0, 6].includes(day) // 土日
    })
  })

  return availableDateTimeObj
}

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

  const availableDateTimeObj = await buildAvailableDateTimeObj(page)

  await context.close()
}

const watchYokohama = async () => {
  try {
    // await watch()
    const browser = await puppeteer.launch()
    await getParkInfo(browser, PARKS[1])
  } catch (err) {
    if (err instanceof Error) {
      console.error(err) // eslint-disable-line no-console
    } else {
      console.error(new Error(err)) // eslint-disable-line no-console
    }
  }
}

module.exports.watchYokohama = watchYokohama
