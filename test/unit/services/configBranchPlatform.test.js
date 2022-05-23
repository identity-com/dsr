
const originalPlatform = process.platform;
describe('Test process platform', () => {
  beforeEach(() => {
    Object.defineProperty(process, 'platform', {
      value: 'win32',
    });
  });

  it('Should validate that it is in windows', () => {
    // it's not linting because we need to test branching of this config file
    try {
      // eslint-disable-next-line no-trailing-spaces,global-require
      require('../../../src/services/config');
    } catch (err) {
      expect(err.message).toBe('Unsupported platform: win32');
    }
  });

  afterEach(() => {
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
    });
  });
});
