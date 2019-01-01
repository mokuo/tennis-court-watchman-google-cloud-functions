const appRoot = require('app-root-path')
const postMsg = require('../../utils/post-msg')
const { buildAvailableDateTimeObj, watch, getParkInfo } = require('../../functions/watch-shinjuku')

jest.mock('../../utils/post-msg')

describe('buildAvailableDateTimeObj()', () => {
  beforeEach(async () => {
    await page.goto(`file://${appRoot}/__pages__/schedule.html`)
  })

  it('build availabble datetime object', async () => {
    const subject = await buildAvailableDateTimeObj(page)
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

// TODO: getParkInfo を mock してテストする
xdescribe('watch()', () => {
  const info = `10/20(土)
  - 13:00～15:00
10/27(土)
  - 13:00～15:00
  - 15:00～17:00
`
  const expectedText = `\`テニス区\`
甘泉園公園: 空いているテニスコートはありません
落合中央公園:
\`\`\`
10/20(土)
  - 13:00～15:00
10/27(土)
  - 13:00～15:00
  - 15:00～17:00
\`\`\`
西落合公園: 空いているテニスコートはありません
`

  beforeAll(() => {
    getParkInfo
      .mockReturnValueOnce('')
      .mockReturnValueOnce(info)
      .mockReturnValueOnce('')
  })

  beforeEach(async () => {
    await watch()
  })

  it('Slack に空き状況を通知する', () => {
    expect(postMsg).toBeCalledWith(expectedText)
  })
})
