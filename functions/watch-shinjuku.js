const puppeteer = require('puppeteer')
const { clickAndWait, evalClickAndWait } = require('../utils/click')
const postMsg = require('../utils/post-msg')
const buildInfo = require('../utils/build-info')

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

  await clickAndWait(page, '#timetable .top-nav input[title="次月"]')
  const availableDateTimeObj2 = await buildAvailableDateTimeObj(page)
  const info2 = buildInfo(availableDateTimeObj2)

  await context.close()

  let info = ''
  if (info1 !== '') info += `${info1}\n`
  if (info2 !== '') info += `${info2}\n`

  return info
}

const watchShinjuku = async (req, res) => {
  try {
    const PARK_NAMES = [
      '甘泉園公園',
      '落合中央公園',
      '西落合公園',
    ]

    const options = {}
    // run without the sandbox if running on GCP
    if (process.env.FUNCTION_NAME !== undefined) { options.args = ['--no-sandbox', '--disable-setuid-sandbox'] }
    const browser = await puppeteer.launch(options)
    let text = ''
    await Promise.all(PARK_NAMES.map(async (parkName) => {
      text += `${parkName}\n`
      const info = await getParkInfo(browser, parkName)
      if (info === '') {
        text += '空いているテニスコートはありません\n'
      } else {
        text += '\\\\n'
        text += `${info}\n`
        text += '\\\\n'
      }
    }))
    await browser.close()

    await postMsg(text)

    res.send('Success!')
  } catch (err) {
    if (err instanceof Error) {
      console.error(err) // eslint-disable-line no-console
      res.send(`${err.name} : ${err.message}`)
    } else {
      console.error(new Error(err)) // eslint-disable-line no-console
      res.send(err)
    }
  }
}

module.exports.buildAvailableDateTimeObj = buildAvailableDateTimeObj
module.exports.watchShinjuku = watchShinjuku
