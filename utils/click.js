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
