process.env.TZ = 'Asia/Shanghai';

jest.setTimeout(30000);

beforeAll(() => {
  console.log('Test suite starting...');
});

afterAll(() => {
  console.log('Test suite completed.');
});
