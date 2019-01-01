const { WebClient } = require('@slack/client')

const postMsg = (text) => {
  const token = process.env.SLACK_TOKEN
  const web = new WebClient(token)
  web.chat.postMessage({ channel: 'CD1M8BUM7', text })
}

module.exports = postMsg
