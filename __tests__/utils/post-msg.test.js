const { WebClient } = require('@slack/client')
const postMsg = require('../../utils/post-msg')

jest.mock('@slack/client')

describe('postMsg()', () => {
  const mockPostMessage = jest.fn()

  beforeEach(() => {
    WebClient.mockImplementation(() => (
      { chat: { postMessage: mockPostMessage } }
    ))
    postMsg('text')
  })

  it('post message to slack', () => {
    expect(WebClient).toHaveBeenCalledWith(process.env.SLACK_TOKEN)
    expect(mockPostMessage).toHaveBeenCalledWith({ channel: 'CD1M8BUM7', text: 'text' })
  })
})
