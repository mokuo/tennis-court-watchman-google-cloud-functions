import test from 'ava';
import ResponseMock from '../mock/ResponseMock';

const functions = require('../index');

test('watch shinjuku', async (t) => {
  await functions.watchShinjuku(null, new ResponseMock());
  t.pass();
});
