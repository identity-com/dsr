const { getConfig, initServices } = require('../../../src/services/index');

describe('Services index tests', () => {
  it('Should test the init of an config file', () => {
    expect(getConfig()).toBeDefined();
  });

  it('Should force a null config file', () => {
    const services = initServices(null);
    expect(services.id).toBe(0);
  });
});
