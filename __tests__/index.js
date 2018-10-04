const index = require('../index');

describe('buildInfo()', () => {
  test('build infomation to post', () => {
    expect.assertions(1);

    const availableDateTimeObj = {
      '10/6(土)': [],
      '10/7(日)': [],
      '10/13(土)': [],
      '10/14(日)': [],
      '10/20(土)': [
        '13:00～15:00',
      ],
      '10/21(日)': [],
      '10/27(土)': [
        '13:00～15:00',
        '15:00～17:00',
      ],
      '10/28(日)': [],
    };
    const expectInfo = `10/20(土)
  - 13:00～15:00
10/27(土)
  - 13:00～15:00
  - 15:00～17:00
`;
    const subject = index.buildInfo(availableDateTimeObj);

    expect(subject).toBe(expectInfo);
  });
});
