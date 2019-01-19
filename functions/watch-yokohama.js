const puppeteer = require('puppeteer')
const { clickAndWait } = require('../utils/click')

const PARKS = [
  { pageNumber: 2, buttonId: 'fbox_520' }, // 富岡西公園
  { pageNumber: 2, buttonId: 'fbox_470' }, // 新杉田公園
]

const buildAvailableTimeList = async (page) => {
  const availableTimeList = await page.$eval('#outline #tbl_time', (tableElement) => {
    const thElements = tableElement.querySelectorAll('th:nth-child(n+3)')
    const timeList = thElements.map(thElement => thElement.textContent)
    return timeList.filter((time, index) => {
      const tdElements = tableElement.querySelectorAll(`td:nth-child${index + 3}`)
      return tdElements.includes('')
    })
  })
  return availableTimeList
}

const buildFilteredDayList = async (page) => {
  const filteredDayList = await page.$$eval('#outline table#calendar tbody input', (inputElements) => {
    const now = new Date()
    const filteredInputElements = inputElements.filter((inputElement) => {
      const day = new Date(now.getFullYear(), now.getMonth(), inputElement.value).getDay()
      // return [0, 6].includes(day) // NOTE: 土日
      return [1, 2, 3, 4, 5].includes(day) // 仮で平日を返す
    })
    return filteredInputElements.map(el => ({ inputId: el.id, day: el.value }))
  })
  return filteredDayList
}

const gotoCalendarPage = async (page, park) => {
  await page.goto('https://yoyaku.city.yokohama.lg.jp')
  const reservationSelector = '#outline #main001 .txt_area2 button#RSGK001_05'
  await page.waitFor(reservationSelector) // NOTE: リダイレクト処理を待つ
  await clickAndWait(page, reservationSelector)
  const sportSelector = '#outline button#fbox_01'
  await page.waitFor(sportSelector)
  await clickAndWait(page, sportSelector)
  const tennisCourtSelector = '#outline button#fbox_05'
  await page.waitFor(tennisCourtSelector)
  await clickAndWait(page, tennisCourtSelector)

  const nextPages = []
  for (let i = 1; i < park.pageNumber; i += 1) {
    nextPages.push(clickAndWait(page, '#outline .next button:first-child'))
  }
  await Promise.all(nextPages)

  await clickAndWait(page, `#outline button#${park.buttonId}`)
  await clickAndWait(page, '#outline button#fbox_00')
}

const getParkInfo = async (browser, park) => {
  const context = await browser.createIncognitoBrowserContext()
  const page = await context.newPage()
  await gotoCalendarPage(page, park)
  const filteredDayList = await buildFilteredDayList(page)
  console.log('aaa!!!')
  console.log(filteredDayList)
  // const availableDateTimeObj = {}
  await Promise.all(filteredDayList.map(async (filteredDay) => {
    // gotoCalendarPage, inputId を使って各ページから availableDateTimeObj を生成する
    const newPage = await context.newPage()
    await gotoCalendarPage(newPage, park)
    await clickAndWait(page, `#calendar input#${filteredDay.inputId}`)
    const availableTimeList = await buildAvailableTimeList(newPage)
    console.log('bbb!!!')
    console.log(availableTimeList)
  }))

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
