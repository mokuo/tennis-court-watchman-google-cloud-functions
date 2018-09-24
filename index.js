const puppeteer = require('puppeteer');

exports.watchShinjuku = async (req, res) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://yoyaku.cultos-y.jp/regasu-shinjuku/reserve/gin_menu');

  await page.waitForSelector('#header h1 img');
  const pageHeader = await page.$eval('#header h1 img', el => el.getAttribute('title'));
  console.log(pageHeader);

  await browser.close();
};
