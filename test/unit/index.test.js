const DsrResolver = require('../../src/index');

describe('DSR Factory Tests', () => {
  it('Should not Construct DSR with unknown claims', () => {
    expect(DsrResolver.Resolver).toBeDefined();
    expect(DsrResolver.ScopeRequest).toBeDefined();
  });
});
