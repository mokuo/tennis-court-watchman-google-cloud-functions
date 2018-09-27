const puppeteer = require('puppeteer');
const { WebClient } = require('@slack/client');

exports.watchShinjuku = async (req, res) => {
  let navigationPromise;

  const browser = await puppeteer.launch({ defaultViewport: { width: 800, height: 1000 } });
  const page = await browser.newPage();
  await page.goto('https://yoyaku.cultos-y.jp/regasu-shinjuku/reserve/gin_menu');

  navigationPromise = page.waitForNavigation();
  await page.click('#contents ul.double li.first input[title="かんたん操作"]');
  await navigationPromise;

  navigationPromise = page.waitForNavigation();
  await page.click('#contents ul.double li.first input[title="空き状況確認"]');
  await navigationPromise;

  navigationPromise = page.waitForNavigation();
  await page.click('#inner-contents a[title="屋外スポーツ施設"]');
  await navigationPromise;

  navigationPromise = page.waitForNavigation();
  await page.click('#inner-contents tbody td.left a[title="西落合公園"]');
  await navigationPromise;

  const tennisSelector = '#inner-contents ul.double-text-buttons a[title="テニス"]';
  const selectorPromise = page.waitForSelector(tennisSelector);
  await page.$eval('#inner-contents ul.double-text-buttons2 a[title="西落合公園庭球場"]', el => el.click());
  await selectorPromise;

  navigationPromise = page.waitForNavigation();
  await page.click(tennisSelector);
  await navigationPromise;

  navigationPromise = page.waitForNavigation();
  await page.click('#contents #buttons-navigation input#btnOK');
  await navigationPromise;

  navigationPromise = page.waitForNavigation();
  await page.click('#buttons-navigation ul.triple li.first a');
  await navigationPromise;

  const availableDateTimeObj = await page.$eval('#contents #inner-contents1 #timetable .wrapper table', (tableElement) => {
    const thElements = Array.from(tableElement.querySelectorAll('thead tr th')).slice(1);
    const times = thElements.map(el => el.textContent.replace(/(\n|\t|<br>|<span>|<\/span>)/g, ''));
    const obj = {};

    tableElement.querySelectorAll('tbody').forEach((tbodyElement) => {
      const date = tbodyElement.querySelector('th').textContent.trim();
      if (/[月火水木金]/.test(date)) { return; }

      const availableTimeList = [];
      tbodyElement.querySelectorAll('td').forEach((tdElement, index) => {
        const imgElement = tdElement.querySelector('img');
        const OX = imgElement.getAttribute('title');
        if (OX === 'O') {
          availableTimeList.push(times[index]);
        }
      });

      obj[date] = availableTimeList;
    });

    return obj;
  });

  await browser.close();

  let info = '';
  Object.keys(availableDateTimeObj).forEach((key) => {
    const times = availableDateTimeObj[key];
    if (times.length === 0) { return; }

    info += `${key}\n`;
    times.forEach((time) => {
      info += `  - ${time}\n`;
    });
  });
  const text = `西落合公園\n\`\`\`\n${info}\`\`\``;

  const token = process.env.SLACK_TOKEN;
  const web = new WebClient(token);
  web.chat.postMessage({ channel: 'CD1M8BUM7', text });
};
