const puppeteer = require('puppeteer')
const { clickAndWait, evalClickAndWait } = require('../utils/click')
const buildInfo = require('../utils/build-info')
const postMsg = require('../utils/post-msg')

const PARK_NAMES = [
  '甘泉園公園',
  '落合中央公園',
  '西落合公園',
]

const buildAvailableDateTimeObj = async (page) => {
  const availableDateTimeObj = await page.$eval('#contents #inner-contents1 #timetable .wrapper table', (tableElement) => {
    const thElements = Array.from(tableElement.querySelectorAll('thead tr th')).slice(1)
    const times = thElements.map(el => el.textContent.replace(/(\n|\t|<br>|<span>|<\/span>)/g, ''))
    const obj = {}

    tableElement.querySelectorAll('tbody').forEach((tbodyElement) => {
      const date = tbodyElement.querySelector('th').textContent.trim()
      if (/[月火水木金]/.test(date)) { return }

      const availableTimeList = []
      tbodyElement.querySelectorAll('td').forEach((tdElement, index) => {
        const imgElement = tdElement.querySelector('img')
        const OX = imgElement.getAttribute('title')
        if (OX === 'O') {
          availableTimeList.push(times[index])
        }
      })

      obj[date] = availableTimeList
    })

    return obj
  })

  return availableDateTimeObj
}

const getParkInfo = async (browser, parkName) => {
  const context = await browser.createIncognitoBrowserContext()
  const page = await context.newPage()
  await page.goto('https://yoyaku.cultos-y.jp/regasu-shinjuku/reserve/gin_menu')
  await clickAndWait(page, '#contents ul.double li.first input[title="かんたん操作"]')
  await clickAndWait(page, '#contents ul.double li.first input[title="空き状況確認"]')
  await clickAndWait(page, '#inner-contents a[title="屋外スポーツ施設"]')
  await clickAndWait(page, `#inner-contents tbody td.left a[title="${parkName}"]`)
  const tennisSelector = '#inner-contents ul.double-text-buttons a[title="テニス"]'
  await evalClickAndWait(page, `#inner-contents ul.double-text-buttons2 a[title^="${parkName}庭球場"]`, tennisSelector)
  await clickAndWait(page, tennisSelector)
  await clickAndWait(page, '#contents #buttons-navigation input#btnOK')
  await clickAndWait(page, '#buttons-navigation ul.triple li.first a')
  const availableDateTimeObj1 = await buildAvailableDateTimeObj(page)
  const info1 = buildInfo(availableDateTimeObj1)

  let info2 = ''
  try {
    await clickAndWait(page, '#timetable .top-nav input[title="次月"]')
    const availableDateTimeObj2 = await buildAvailableDateTimeObj(page)
    info2 = buildInfo(availableDateTimeObj2)
  } catch (err) {
    if (!err.message.startsWith('No node found for selector:')) throw err
  }

  await context.close()

  let info = ''
  if (info1 !== '') info += `${info1}`
  if (info2 !== '') info += `\n${info2}`

  return info
}

const watch = async () => {
  const options = {}
  // run without the sandbox if running on GCP
  if (process.env.FUNCTION_NAME !== undefined) { options.args = ['--no-sandbox', '--disable-setuid-sandbox'] }
  const browser = await puppeteer.launch(options)
  let text = '`新宿区`\n'
  await Promise.all(PARK_NAMES.map(async (parkName) => {
    const info = await getParkInfo(browser, parkName)
    if (info === '') {
      text += `${parkName}: 空いているテニスコートはありません\n`
    } else {
      text += `${parkName}:\n`
      text += '```\n'
      text += `${info}`
      text += '```\n'
    }
  }))
  await browser.close()

  await postMsg(text)
}

const watchShinjuku = async () => {
  try {
    await watch()
  } catch (err) {
    if (err instanceof Error) {
      console.error(err) // eslint-disable-line no-console
    } else {
      console.error(new Error(err)) // eslint-disable-line no-console
    }
  }
}

module.exports.getParkInfo = getParkInfo
module.exports.buildAvailableDateTimeObj = buildAvailableDateTimeObj
module.exports.watch = watch
module.exports.watchShinjuku = watchShinjuku
