const puppeteer = require('puppeteer')
const postMsg = require('./post-msg')

const watch = async (parkNames, getParkInfo) => {
  const options = {}
  // run without the sandbox if running on GCP
  if (process.env.FUNCTION_NAME !== undefined) { options.args = ['--no-sandbox', '--disable-setuid-sandbox'] }
  const browser = await puppeteer.launch(options)
  let text = ''
  await Promise.all(parkNames.map(async (parkName) => {
    const info = await getParkInfo(browser, parkName)
    if (info === '') {
      text += `${parkName}: 空いているテニスコートはありません\n`
    } else {
      text += `${parkName}:\n`
      text += '\\\\n'
      text += `${info}\n`
      text += '\\\\n'
    }
  }))
  await browser.close()

  await postMsg(text)
}

module.exports = watch
