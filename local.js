const functions = require('./index');
const ResponseMock = require('./mock/ResponseMock');

functions.watchShinjuku(null, new ResponseMock());
