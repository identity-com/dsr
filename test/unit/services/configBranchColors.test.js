describe('Test colors on config', () => {
  beforeEach(() => {
    process.env.APP_PRIMARY_COLOR = 'FFFFFF';
    process.env.APP_SECONDARY_COLOR = 'FFFFFF';
  });

  it('Should validate different colors', () => {
    // it's not linting because we need to test branching of this config file
    // eslint-disable-next-line no-trailing-spaces,global-require
    const config = require('../../../src/services/config');
    expect(config.app.primaryColor).toBe('FFFFFF');
  });

  afterEach(() => {
    process.env.APP_PRIMARY_COLOR = null;
  });
});
