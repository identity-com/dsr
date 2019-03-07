const { initServices } = require('../../src/services/index');

const config = {
  partner: {
    id: 'TestPartnerId',
    signingKeys: {
      xpub: 'XPUB',
      xprv: 'XPUB',
    },
  },
  app: {
    id: 'TestPartnerApp',
    name: 'TestPartnerApp',
    logo: 'https://s-media-cache-ak0.pinimg.com/originals.png',
    description: 'TestPartnerApp',
    primaryColor: 'A80B00',
    secondaryColor: 'FFFFFF',
  },
  channels: {
    baseEventsURL: 'https://localhost/sr/events',
    basePayloadURL: 'https://localhost/sr/payload',
  },
};

initServices(config);

const { ScopeRequest } = require('../../src/ScopeRequest');

describe('Coverage Branching Tests for DSR Factory', () => {
  it('Should not Construct DSR with unknown claims', () => {
    function createNewDSR() {
      return new ScopeRequest('abcd',
        ['claim-boggus:identifier-1']);
    }

    expect(createNewDSR).toThrow('claim-boggus:identifier-1 is not valid');
  });
});

module.exports = ScopeRequest;
