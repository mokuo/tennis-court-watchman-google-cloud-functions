const functions = require('./index');

class ResponseMock {
  send(str) { // eslint-disable-line class-methods-use-this
    console.log(`mock send() : ${str}`); // eslint-disable-line no-console
  }
}

functions.watchShinjuku(null, new ResponseMock());
