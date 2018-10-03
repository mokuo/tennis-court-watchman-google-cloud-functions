const test = require('ava');
const sinon = require('sinon');
const Page = require('puppeteer/lib/Page');
const index = require('../index');

const pageStub = sinon.createStubInstance(new Page(), {
  waitForNavigation: 3,
  click: 3,
});

test('clickAndWait()', async (t) => {
  const promises = await index.clickAndWait(pageStub, 'selector');
  console.log(promises);
  t.pass();
});

// test('watchShinjuku()', async (t) => {
//   await index.watchShinjuku(null, new ResponseMock());
//   t.pass();
// });
