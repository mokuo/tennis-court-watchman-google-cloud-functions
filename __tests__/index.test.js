const index = require('../index')

describe('buildAvailableDateTimeObj()', () => {
  beforeEach(async () => {
    await page.goto(`file://${__dirname}/../__pages__/schedule.html`)
  })

  it('build availabble datetime object', async () => {
    const subject = await index.buildAvailableDateTimeObj(page)
    const expectObj = {
      '10/13(土)': [],
      '10/14(日)': [],
      '10/20(土)': [],
      '10/21(日)': [],
      '10/27(土)': [],
      '10/28(日)': [],
    }
    expect(subject).toEqual(expectObj)
  })
})
