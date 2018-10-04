const puppeteer = require('puppeteer');
const clickAndWait = require('../index');

describe('clickAndWait()', () => {
  test('page.waitForNavigation() and page.click() is to be called', async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    // jest.mock(page);

    // page.waitForNavigation.mockResolvedValue('response');
    // page.click.mockResolvedValue(undefined);
    const selector = 'selector';

    await clickAndWait(page, selector);

    expect(page.waitForNavigation).toBeCalled();
    expect(page.click).toBeCalledWith(selector);
  });
});
