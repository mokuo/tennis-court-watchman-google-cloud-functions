const watch = require('../../utils/watch')
const postMsg = require('../../utils/post-msg')

jest.mock('../../utils/post-msg')

const mockGetParkInfo = jest.fn()

describe('watch()', () => {
  const localGovernmentName = 'テニス区'
  const parkNames = ['公園１', '公園２', '公園３']
  const info = `10/20(土)
  - 13:00～15:00
10/27(土)
  - 13:00～15:00
  - 15:00～17:00
`
  const expectedText = `\`テニス区\`
公園１: 空いているテニスコートはありません
公園２:
\`\`\`
10/20(土)
  - 13:00～15:00
10/27(土)
  - 13:00～15:00
  - 15:00～17:00
\`\`\`
公園３: 空いているテニスコートはありません
`

  beforeAll(() => {
    mockGetParkInfo
      .mockReturnValueOnce('')
      .mockReturnValueOnce(info)
      .mockReturnValueOnce('')
  })

  beforeEach(async () => {
    await watch(localGovernmentName, parkNames, mockGetParkInfo)
  })

  it('Slack に空き状況を通知する', () => {
    expect(postMsg).toBeCalledWith(expectedText)
  })
})
