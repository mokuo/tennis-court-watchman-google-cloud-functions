const puppeteer = require('puppeteer');
const { WebClient } = require('@slack/client');

const clickAndWait = async (page, selector) => {
  await Promise.all([
    page.waitForNavigation(),
    page.click(selector),
  ]);
};

const evalClickAndWait = async (page, selector, nextSelector) => {
  await Promise.all([
    page.waitForNavigation(),
    page.$eval(selector, el => el.click()),
    page.waitForSelector(nextSelector),
  ]);
};

const buildAvailableDateTimeObj = async (page) => {
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

  return availableDateTimeObj;
};

const buildInformation = (availableDateTimeObj) => {
  let info = '';

  Object.keys(availableDateTimeObj).forEach((key) => {
    const times = availableDateTimeObj[key];
    if (times.length === 0) { return; }

    info += `${key}\n`;
    times.forEach((time) => {
      info += `  - ${time}\n`;
    });
  });

  return info;
};

const notifyInfomation = (info, parkName) => {
  const text = (info === '') ? `${parkName} : no available time.` : `${parkName}\n\`\`\`\n${info}\`\`\``;
  const token = process.env.SLACK_TOKEN;
  const web = new WebClient(token);
  web.chat.postMessage({ channel: 'CD1M8BUM7', text });
};

const perform = async (page, parkName) => {
  const availableDateTimeObj = await buildAvailableDateTimeObj(page);
  const info = buildInformation(availableDateTimeObj);
  notifyInfomation(info, parkName);
};

const watchPark = async (browser, parkName) => {
  const context = await browser.createIncognitoBrowserContext();
  const page = await context.newPage();
  await page.goto('https://yoyaku.cultos-y.jp/regasu-shinjuku/reserve/gin_menu');
  await clickAndWait(page, '#contents ul.double li.first input[title="かんたん操作"]');
  await clickAndWait(page, '#contents ul.double li.first input[title="空き状況確認"]');
  await clickAndWait(page, '#inner-contents a[title="屋外スポーツ施設"]');
  await clickAndWait(page, `#inner-contents tbody td.left a[title="${parkName}"]`);
  const tennisSelector = '#inner-contents ul.double-text-buttons a[title="テニス"]';
  await evalClickAndWait(page, `#inner-contents ul.double-text-buttons2 a[title="${parkName}庭球場"]`, tennisSelector);
  await clickAndWait(page, tennisSelector);
  await clickAndWait(page, '#contents #buttons-navigation input#btnOK');
  await clickAndWait(page, '#buttons-navigation ul.triple li.first a');
  await perform(page, parkName);
  await clickAndWait(page, '#timetable .top-nav input[title="次月"]');
  await perform(page, parkName);
};

exports.watchShinjuku = async (req, res) => {
  const PARK_NAMES = [
    '落合中央公園',
    '西落合公園',
  ];

  const browser = await puppeteer.launch();
  await Promise.all(PARK_NAMES.map(async (parkName) => {
    await watchPark(browser, parkName);
  }));
  await browser.close();
};
