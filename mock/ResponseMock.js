class ResponseMock {
  send(str) { // eslint-disable-line class-methods-use-this
    console.log(`mock send() : ${str}`); // eslint-disable-line no-console
  }
}

module.exports = ResponseMock;
