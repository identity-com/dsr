const { schemaLoader, CVCSchemaLoader } = require('@identity.com/credential-commons');
const { initServices } = require('../../src/services/index');

jest.setTimeout(30000);

const config = {
  partner: {
    id: 'TestPartnerId',
    signingKeys: {
      xpub: '04378df3e480e626541daec66c4bbad532430d28e1ecb6b70a03313fc07fbad5c0d8b26410eac8f0b1a448898cbed9d714fd9cab2a8d1a7885bfbb48bd673da03c',
      xprv: 'f728fed0153f3b46a0fccdd9ed9954ad56fd4e8af016fe59075655aa9feb9a59',
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
    baseEventsURL: 'https://example.com/sr/events',
    basePayloadURL: 'https://example.com/sr/payload',
  },
};

initServices(config);

const validConfig = {
  partner: {
    id: 'test',
    signingKeys: {
      xpub: 'test',
      xprv: 'test',
    },
  },
  app: {
    id: 'test',
    name: 'test',
    logo: 'https://example.com/',
    description: 'test',
    primaryColor: 'FFF',
    secondaryColor: 'FFF',
  },
  channels: {
    eventsURL: 'https://example.com/',
    payloadURL: 'https://example.com/',
  },
};

const { ScopeRequest, buildSignedRequestBody, verifySignedRequestBody } = require('../../src/ScopeRequest');

// -----Fixtures
const idDoc = require('../fixtures/idDocCred');
const emailV3Doc = require('../fixtures/emailV3Cred');
const filteredIdDoc = require('../fixtures/idDocV2Filtered.json');

describe('DSR Factory Tests', () => {
  beforeEach(() => {
    schemaLoader.addLoader(new CVCSchemaLoader());

    initServices(config);
  });

  it('Should not Construct DSR with unknown claims', () => expect(ScopeRequest.create('abcd',
    ['claim-boggus:identifier-1'])).rejects.toThrow('claim-boggus:identifier-1 is not valid'));

  it('Should not Construct DSR with unknown credentials', () => expect(ScopeRequest.create('abcd',
    ['credential-boggus:identifier-1'])).rejects.toThrow('credential-boggus:identifier-1 is not valid'));

  it('Should Construct DSR with known claims', async () => {
    const dsr = await ScopeRequest.create('abcd', ['claim-cvc:Identity.name-v1']);
    expect(dsr).toBeDefined();
  });

  it('Should Construct DSR with known credentials', async () => {
    const dsr = await ScopeRequest.create('abcd', ['credential-cvc:Identity-v1']);
    expect(dsr).toBeDefined();
  });

  it('Should Construct DSR with valid constraints', async () => {
    const dsr = await ScopeRequest.create('abcd',
      [{
        identifier: 'credential-cvc:Identity-v1',
        constraints: {
          meta: {
            issuer: { is: { $eq: 'did:ethr:0xf3beac30c498d9e26865f34fcaa57dbb935b0d74' } },
            issued: { is: { $lt: 15999999 } },
            expiry: { is: { $gt: 19999999 } },
          },
          claims: [
            { path: 'email', is: { $eq: 'jpsantos@gmail.com' } },
          ],
        },
      }]);
    expect(dsr).toBeDefined();
  });

  it('Should succeed validation of the credential items on a DSR', async () => {
    const dsr = await ScopeRequest.create('abcd',
      [{
        identifier: 'credential-cvc:Identity-v1',
        constraints: {
          meta: {
            issuer: { is: { $eq: 'did:ethr:0xf3beac30c498d9e26865f34fcaa57dbb935b0d74' } },
            issued: { is: { $lt: 15999999 } },
            expiry: { is: { $gt: 19999999 } },
          },
          claims: [
            { path: 'name.first', is: { $eq: 'pgbXa8A3QI' } },
          ],
        },
      }]);
    const isValid = ScopeRequest.validateCredentialItems(dsr.credentialItems);
    expect(isValid).toBeTruthy();
  });

  it('Should succeed validation of an string identifier for credential items on a DSR', async () => {
    const dsr = await ScopeRequest.create('abcd', ['credential-cvc:Identity-v1']);
    const isValid = ScopeRequest.validateCredentialItems(dsr.credentialItems);
    expect(isValid).toBeTruthy();
  });

  // TODO
  // it('Should skip https test for local url in payloadUrl or eventsUrl and succeed validation', () => {
  //   let dsr;
  //   expect(() => {
  //     dsr = await ScopeRequest.create('abcd', ['credential-cvc:Identity-v1'], {
  //       eventsURL: 'http://localhost/',
  //       payloadURL: 'http://127.0.0.1/',
  //     });
  //   }).not.toThrow('only HTTPS is supported for payloadURL');
  //   const isValid = ScopeRequest.validateCredentialItems(dsr.credentialItems);
  //   expect(isValid).toBeTruthy();
  // });

  it('Should fail validation of an string identifier for credential items on a DSR',
    async () => expect(ScopeRequest.create('abcd', [{}])).rejects.toThrow());

  it('Should fail validation on the meta issuer', async () => expect(ScopeRequest.create('abcd',
    [{
      identifier: 'credential-cvc:Identity-v1',
      constraints: {
        meta: {
          issued: { is: { $lt: 15999999 } },
          expiry: { is: { $gt: 19999999 } },
        },
        claims: [
          { path: 'email', is: { $eq: 'jpsantos@gmail.com' } },
        ],
      },
    }])).rejects.toThrow());

  it('Should fail validation on the meta issuer operator', async () => expect(ScopeRequest.create('abcd',
    [{
      identifier: 'credential-cvc:Identity-v1',
      constraints: {
        meta: {
          issuer: { is: { $lt: 'did:ethr:0xf3beac30c498d9e26865f34fcaa57dbb935b0d74' } },
          issued: { is: { $lt: 15999999 } },
          expiry: { is: { $gt: 19999999 } },
        },
        claims: [
          { path: 'email', is: { $eq: 'jpsantos@gmail.com' } },
        ],
      },
    }])).rejects.toThrow('undefined is not a valid issuer'));

  it('Should fail validation on the claims path section', async () => expect(ScopeRequest.create('abcd',
    [{
      identifier: 'credential-cvc:Identity-v1',
      constraints: {
        meta: {
          issuer: { is: { $eq: 'did:ethr:0xf3beac30c498d9e26865f34fcaa57dbb935b0d74' } },
          issued: { is: { $lt: 15999999 } },
          expiry: { is: { $gt: 19999999 } },
        },
        claims: [
          { path: '', is: { $eq: 'jpsantos@gmail.com' } },
        ],
      },
    }])).rejects.toThrow('Claim path is required'));

  it('Should fail validation on the claims with null property value', async () => expect(ScopeRequest.create('abcd',
    [{
      identifier: 'credential-cvc:Identity-v1',
      constraints: {
        meta: {
          issuer: { is: { $eq: 'did:ethr:0xf3beac30c498d9e26865f34fcaa57dbb935b0d74' } },
          issued: { is: { $lt: 15999999 } },
          expiry: { is: { $gt: 19999999 } },
        },
        claims: [
          { path: 'name' },
        ],
      },
    }])).rejects.toThrow('Claim constraint is required'));

  it('Should fail validation on the operators constraint', async () => expect(ScopeRequest.create('abcd',
    [{
      identifier: 'credential-cvc:Identity-v1',
      constraints: {
        meta: {
          issuer: { is: { $eq: 'did:ethr:0xf3beac30c498d9e26865f34fcaa57dbb935b0d74' } },
          issued: { is: { $lt: 15999999 } },
          expiry: { is: { $gt: 19999999 } },
        },
        claims: [
          { path: 'email', is: { $eq: 'jpsantos@gmail.com', $ne: 'jpsantos@gmail.com' } },
        ],
      },
    }])).rejects.toThrow('Invalid Constraint Object - only one operator is allowed'));

  it('Should fail validation on the operators constraint with invalid operators', async () => expect(ScopeRequest.create('abcd',
    [{
      identifier: 'credential-cvc:Identity-v1',
      constraints: {
        meta: {
          issuer: { is: { $eq: 'did:ethr:0xf3beac30c498d9e26865f34fcaa57dbb935b0d74' } },
          issued: { is: { $lt: 15999999 } },
          expiry: { is: { $gt: 19999999 } },
        },
        claims: [
          { path: 'email', is: { $super: 'jpsantos@gmail.com' } },
        ],
      },
    }])).rejects.toThrow('Invalid Constraint Object - $super is not a valid operator'));

  it('Should fail validation while mocking the config file without eventsURL', () => expect(ScopeRequest.create('abcd', ['credential-cvc:Identity-v1'], {})).rejects.toThrow('eventsURL is required'));

  it('Should fail validation while mocking the config file with eventsURL without https', () => expect(
    ScopeRequest.create('abcd', ['credential-cvc:Identity-v1'],
      { eventsURL: 'http://example.com/' }),
  ).rejects.toThrow('only HTTPS is supported for eventsURL'));

  it('Should fail validation while mocking the config file with payloadURL without https', () => expect(ScopeRequest.create('abcd', ['credential-cvc:Identity-v1'], {
    eventsURL: 'https://example.com/',
    payloadURL: 'http://example.com/',
  })).rejects.toThrow('only HTTPS is supported for payloadURL'));

  it('Should fail validation while mocking the appConfig without id', () => expect(ScopeRequest.create('abcd', ['credential-cvc:Identity-v1'], {
    eventsURL: 'https://example.com/',
    payloadURL: 'https://example.com/',
  }, {})).rejects.toThrow('app.id is required'));

  it('Should fail validation while mocking the appConfig without name', () => {
    const appConfig = { id: 'test' };

    return expect(ScopeRequest.create('abcd', ['credential-cvc:Identity-v1'], {
      eventsURL: 'https://example.com/', payloadURL: 'https://example.com/',
    }, appConfig)).rejects.toThrow('app.name is required');
  });

  it('Should fail validation while mocking the appConfig without logo', () => {
    const appConfig = { id: 'test', name: 'test' };

    return expect(
      ScopeRequest.create('abcd', ['credential-cvc:Identity-v1'], {
        eventsURL: 'https://example.com/',
        payloadURL: 'https://example.com/',
      }, appConfig),
    ).rejects.toThrow('app.logo is required');
  });

  it('Should fail validation while mocking the appConfig without logo https', () => {
    const appConfig = { id: 'test', name: 'test', logo: 'http://example.com/' };

    return expect(ScopeRequest.create('abcd', ['credential-cvc:Identity-v1'], {
      eventsURL: 'https://example.com/', payloadURL: 'https://example.com/',
    }, appConfig)).rejects.toThrow('only HTTPS is supported for app.logo');
  });

  it('Should fail validation while mocking the appConfig without description', () => {
    const appConfig = {
      id: 'test', name: 'test', logo: 'https://example.com/', primaryColor: 'FFF',
    };
    return expect(ScopeRequest.create('abcd', ['credential-cvc:Identity-v1'], {
      eventsURL: 'https://example.com/', payloadURL: 'https://example.com/',
    }, appConfig)).rejects.toThrow('app.description is required');
  });

  it('Should fail validation while mocking the appConfig without primaryColor', () => {
    const appConfig = {
      id: 'test', name: 'test', logo: 'https://example.com/', description: 'test',
    };

    return expect(ScopeRequest.create('abcd', ['credential-cvc:Identity-v1'], {
      eventsURL: 'https://example.com/', payloadURL: 'https://example.com/',
    }, appConfig)).rejects.toThrow('app.primaryColor is required');
  });

  it('Should fail validation while mocking the appConfig without secondaryColor', () => {
    const appConfig = {
      id: 'test', name: 'test', logo: 'https://example.com/', primaryColor: 'FFF', description: 'test',
    };

    return expect(ScopeRequest.create('abcd', ['credential-cvc:Identity-v1'], {
      eventsURL: 'https://example.com/', payloadURL: 'https://example.com/',
    }, appConfig)).rejects.toThrow('app.secondaryColor is required');
  });

  it('Should fail validation while mocking the appConfig without partnerConfig id', () => {
    const appConfig = {
      id: 'test',
      name: 'test',
      logo: 'https://example.com/',
      primaryColor: 'FFF',
      secondaryColor: 'FFF',
      description: 'test',
    };
    const partnerConfig = {};

    return expect(ScopeRequest.create('abcd', ['credential-cvc:Identity-v1'], {
      eventsURL: 'https://example.com/', payloadURL: 'https://example.com/',
    }, appConfig, partnerConfig)).rejects.toThrow('partner.id is required');
  });

  it('Should fail validation while mocking the appConfig without partnerConfig signingKeys', () => {
    const appConfig = {
      id: 'test',
      name: 'test',
      logo: 'https://example.com/',
      primaryColor: 'FFF',
      secondaryColor: 'FFF',
      description: 'test',
    };
    const partnerConfig = {
      id: 'test',
    };

    return expect(ScopeRequest.create('abcd', ['credential-cvc:Identity-v1'], {
      eventsURL: 'https://example.com/', payloadURL: 'https://example.com/',
    }, appConfig, partnerConfig)).rejects.toThrow('Partner public and private signing keys are required');
  });

  it('Should fail the creation of an dsr without an unique id', () => expect(ScopeRequest.create(null, ['credential-cvc:Identity-v1'])).rejects.toThrow('uniqueId is required'));

  it('Should succeed validation while mocking the appConfig with partnerConfig signingKeys', async () => {
    const dsr = await ScopeRequest.create(
      'abcd',
      ['credential-cvc:Identity-v1'],
      validConfig.channels,
      validConfig.app,
      validConfig.partner,
    );
    expect(dsr.requesterInfo.requesterId).toBe(validConfig.partner.id);
  });

  it('Should Construct DSR with authentication default to true when authentication value not specified', async () => {
    const dsr = await ScopeRequest.create(
      'abcd',
      ['credential-cvc:Identity-v1'],
      validConfig.channels,
      validConfig.app,
      validConfig.partner,
    );
    expect(dsr).toBeDefined();
    expect(dsr.authentication).toBeDefined();
    expect(dsr.authentication).toBeTruthy();
  });

  it('Should Construct DSR with authentication', async () => {
    const authentication = false;
    const dsr = await ScopeRequest.create(
      'abcd',
      ['credential-cvc:Identity-v1'],
      validConfig.channels,
      validConfig.app,
      validConfig.partner,
      authentication,
    );
    expect(dsr).toBeDefined();
    expect(dsr.authentication).toBeDefined();
    expect(dsr.authentication).toEqual(authentication);

    const requestBody = buildSignedRequestBody(dsr);
    expect(requestBody.payload.authentication).toBeDefined();
    expect(requestBody.payload.authentication).toEqual(authentication);
  });

  it('Should fail the creation of an dsr when a invalid value of authentication is provided', () => {
    const invalidAuthentication = 'invalid';
    return expect(ScopeRequest.create(
      'abcd',
      ['credential-cvc:Identity-v1'],
      validConfig.channels,
      validConfig.app,
      validConfig.partner,
      invalidAuthentication,
    )).rejects.toThrow('Invalid value for authentication');
  });
});

describe('DSR Request Utils', () => {
  beforeEach(() => {
    schemaLoader.addLoader(new CVCSchemaLoader());

    initServices(config);
  });
  test('Build a signed request', async () => {
    const dsr = await ScopeRequest.create('abcd',
      [{
        identifier: 'credential-cvc:Identity-v1',
        constraints: {
          meta: {
            issuer: { is: { $eq: 'did:ethr:0xf3beac30c498d9e26865f34fcaa57dbb935b0d74' } },
            issued: { is: { $lt: 15999999 } },
            expiry: { is: { $gt: 19999999 } },
          },
          claims: [
            { path: 'email', is: { $eq: 'jpsantos@gmail.com' } },
          ],
        },
      }]);
    const requestBody = buildSignedRequestBody(dsr);
    expect(requestBody.payload).toBeDefined();
    expect(requestBody.signature).toBeDefined();
    expect(requestBody.xpub).toBeDefined();
  });

  test('Verify a signed request without pinned xpub', async () => {
    const dsr = await ScopeRequest.create('abcd',
      [{
        identifier: 'credential-cvc:Identity-v1',
        constraints: {
          meta: {
            issuer: { is: { $eq: 'did:ethr:0xf3beac30c498d9e26865f34fcaa57dbb935b0d74' } },
            issued: { is: { $lt: 15999999 } },
            expiry: { is: { $gt: 19999999 } },
          },
          claims: [
            { path: 'email', is: { $eq: 'jpsantos@gmail.com' } },
          ],
        },
      }]);
    const requestBody = buildSignedRequestBody(dsr);

    expect(verifySignedRequestBody(requestBody)).toBeTruthy();
  });

  test('Verify a signed request with pinned xpub', async () => {
    const dsr = await ScopeRequest.create('abcd',
      [{
        identifier: 'credential-cvc:Identity-v1',
        constraints: {
          meta: {
            issuer: { is: { $eq: 'did:ethr:0xf3beac30c498d9e26865f34fcaa57dbb935b0d74' } },
            issued: { is: { $lt: 15999999 } },
            expiry: { is: { $gt: 19999999 } },
          },
          claims: [
            { path: 'email', is: { $eq: 'jpsantos@gmail.com' } },
          ],
        },
      }]);
    const requestBody = buildSignedRequestBody(dsr);
    const { xpub } = config.partner.signingKeys;
    expect(xpub).toBeDefined();
    expect(verifySignedRequestBody(requestBody, xpub)).toBeTruthy();
  });

  test('Verify a signed request with pinned xpub', async () => {
    const dsr = await ScopeRequest.create('abcd',
      [{
        identifier: 'credential-cvc:Identity-v1',
        constraints: {
          meta: {
            issuer: { is: { $eq: 'did:ethr:0xf3beac30c498d9e26865f34fcaa57dbb935b0d74' } },
            issued: { is: { $lt: 15999999 } },
            expiry: { is: { $gt: 19999999 } },
          },
          claims: [
            { path: 'email', is: { $eq: 'jpsantos@gmail.com' } },
          ],
        },
      }]);
    const requestBody = buildSignedRequestBody(dsr);
    expect(() => {
      verifySignedRequestBody(requestBody, 'xpub');
    }).toThrow();
  });

  test('Should Throw Request must have a payload object', async () => {
    const dsr = await ScopeRequest.create('abcd',
      [{
        identifier: 'credential-cvc:Identity-v1',
        constraints: {
          meta: {
            issuer: { is: { $eq: 'did:ethr:0xf3beac30c498d9e26865f34fcaa57dbb935b0d74' } },
            issued: { is: { $lt: 15999999 } },
            expiry: { is: { $gt: 19999999 } },
          },
          claims: [
            { path: 'email', is: { $eq: 'jpsantos@gmail.com' } },
          ],
        },
      }]);
    const requestBody = buildSignedRequestBody(dsr);
    requestBody.payload = undefined;
    expect(() => {
      verifySignedRequestBody(requestBody);
    }).toThrow();
  });

  test('Should Throw Request must have a signature', async () => {
    const dsr = await ScopeRequest.create('abcd',
      [{
        identifier: 'credential-cvc:Identity-v1',
        constraints: {
          meta: {
            issuer: { is: { $eq: 'did:ethr:0xf3beac30c498d9e26865f34fcaa57dbb935b0d74' } },
            issued: { is: { $lt: 15999999 } },
            expiry: { is: { $gt: 19999999 } },
          },
          claims: [
            { path: 'email', is: { $eq: 'jpsantos@gmail.com' } },
          ],
        },
      }]);
    const requestBody = buildSignedRequestBody(dsr);
    requestBody.signature = undefined;
    expect(() => {
      verifySignedRequestBody(requestBody);
    }).toThrow();
  });

  test('Should Throw Request must have a public key', async () => {
    const dsr = await ScopeRequest.create('abcd',
      [{
        identifier: 'credential-cvc:Identity-v1',
        constraints: {
          meta: {
            issuer: { is: { $eq: 'did:ethr:0xf3beac30c498d9e26865f34fcaa57dbb935b0d74' } },
            issued: { is: { $lt: 15999999 } },
            expiry: { is: { $gt: 19999999 } },
          },
          claims: [
            { path: 'email', is: { $eq: 'jpsantos@gmail.com' } },
          ],
        },
      }]);
    const requestBody = buildSignedRequestBody(dsr);
    requestBody.xpub = undefined;

    expect(() => {
      verifySignedRequestBody(requestBody);
    }).toThrow();
  });

  it('Should change config settings when partnerConfig object is passed', async () => {
    const partnerConfig = {
      id: 'New Partner',
      signingKeys: {
        xpub: '04378df3e480e626541daec66c4bbad532430d28e1ecb6b70a03313fc07fbad5c0d8b26410eac8f0b1a448898cbed9d714fd9cab2a8d1a7885bfbb48bd673da03c',
        xprv: 'f728fed0153f3b46a0fccdd9ed9954ad56fd4e8af016fe59075655aa9feb9a59',
      },
    };
    const dsr = await ScopeRequest.create('abcd',
      [{
        identifier: 'credential-cvc:Identity-v1',
        constraints: {
          meta: {
            issuer: { is: { $eq: 'did:ethr:0xf3beac30c498d9e26865f34fcaa57dbb935b0d74' } },
            issued: { is: { $lt: 15999999 } },
            expiry: { is: { $gt: 19999999 } },
          },
          claims: [
            { path: 'email', is: { $eq: 'jpsantos@gmail.com' } },
          ],
        },
      }], null, null, partnerConfig);
    const signature = buildSignedRequestBody(dsr);
    expect(signature.xpub).toBe(partnerConfig.signingKeys.xpub);
    expect(verifySignedRequestBody(signature, partnerConfig.signingKeys.xpub)).toBeTruthy();
    expect(dsr.requesterInfo.requesterId).toBe(partnerConfig.id);
  });

  it('Should build an empty credential item array', async () => {
    const partnerConfig = {
      id: 'New Partner',
      signingKeys: {
        xpub: '04378df3e480e626541daec66c4bbad532430d28e1ecb6b70a03313fc07fbad5c0d8b26410eac8f0b1a448898cbed9d714fd9cab2a8d1a7885bfbb48bd673da03c',
        xprv: 'f728fed0153f3b46a0fccdd9ed9954ad56fd4e8af016fe59075655aa9feb9a59',
      },
    };
    const dsr = await ScopeRequest.create('abcd', [], null, null, partnerConfig);
    const requestBody = buildSignedRequestBody(dsr);
    expect(requestBody.payload).toBeDefined();
    expect(requestBody.signature).toBeDefined();
    expect(requestBody.xpub).toBeDefined();
  });

  it('Should throw an error when trying to ask for an claim and while also having the noClaims flag',
    async () => expect(ScopeRequest.create('abcd',
      [{
        identifier: 'claim-cvc:Address.city-v1',
        constraints: {
          meta: {
            issuer: { is: { $eq: 'did:ethr:0xf3beac30c498d9e26865f34fcaa57dbb935b0d74' } },
            issued: { is: { $eq: 15999999 } },
            expiry: { is: { $eq: 19999999 } },
            noClaims: true,
          },
        },
      }])).rejects.toThrow('Cannot ask for Claims and also have the flag noClaimss equals true'));

  it('Should accept one credentialItem as a simple string', async () => {
    const requestId = '123';
    const dsr = await ScopeRequest.create(
      requestId, 'credential-cvc:IDVaaS-v1',
      {
        eventsURL: `https://example.com/event/${requestId}`,
        payloadURL: `https://example.com/payload/${requestId}`,
      },
      {
        id: 'TestPartnerApp',
        name: 'TestPartnerApp',
        logo: 'https://s-media-cache-ak0.pinimg.com/originals.png',
        description: 'TestPartnerApp',
        primaryColor: 'A80B00',
        secondaryColor: 'FFFFFF',
      },
      {
        id: 'TestPartnerId',
        signingKeys: {
          xpub: '04378df3e480e626541daec66c4bbad532430d28e1ecb6b70a03313fc07fbad5c0d8b26410eac8f0b1a448898cbed9d714fd9cab2a8d1a7885bfbb48bd673da03c',
          xprv: 'f728fed0153f3b46a0fccdd9ed9954ad56fd4e8af016fe59075655aa9feb9a59',
        },
      },
    );
    expect(dsr).toBeDefined();
  });

  it('Should check if credentials matches the request constraints', async () => {
    const credentialItems = [idDoc]; // This is should be the CI on the scopeRequest response
    const dsr = await ScopeRequest.create('abcd',
      [{
        identifier: 'credential-cvc:IdDocument-v1',
        credential: 'credential-cvc:IdDocument-v1',
        constraints: {
          meta: {
            issuer: { is: { $eq: 'did:ethr:0xf3beac30c498d9e26865f34fcaa57dbb935b0d74' } },
          },
          claims: [
            { path: 'document.dateOfBirth', is: { $lte: '-21y' } },
          ],
        },
      }]);
    expect(dsr).toBeDefined();
    const match = await ScopeRequest.credentialsMatchesRequest(credentialItems, dsr);
    expect(match).toBeTruthy();
  });

  it('Should check if a v3 credential matches the request constraints', async () => {
    const credentialItems = [emailV3Doc];
    const dsr = await ScopeRequest.create('abcd',
      [{
        identifier: 'credential-cvc:Email-v3',
        credential: 'credential-cvc:Email-v3',
        constraints: {
          meta: {
            issuer: { is: { $eq: 'did:sol:tid652xmv91UHLW3HKnQSYMoNYko6FWd8sUEuYF5LPn' } },
          },
          claims: [
            { path: 'contact.email.domain.name', is: { $eq: 'civic' } },
          ],
        },
      }]);
    expect(dsr).toBeDefined();
    const match = await ScopeRequest.credentialsMatchesRequest(credentialItems, dsr);
    expect(match).toBeTruthy();
  });

  it('Should check if a v3 credential matches the request constraints including the credential meta', async () => {
    const credentialItems = [emailV3Doc];
    const dsr = await ScopeRequest.create('abcd',
      [{
        identifier: 'credential-cvc:Email-v3',
        credential: 'credential-cvc:Email-v3',
        constraints: {
          meta: {
            issuer: { is: { $eq: 'did:sol:tid652xmv91UHLW3HKnQSYMoNYko6FWd8sUEuYF5LPn' } },
          },
          claims: [
            { path: 'contact.email.domain.name', is: { $eq: 'civic' } },
          ],
        },
      }]);
    expect(dsr).toBeDefined();
    const match = await ScopeRequest.credentialsMatchesRequest(credentialItems, dsr, true);
    expect(match).toBeTruthy();
  });

  it('Should check if partial credentials matches the request constraints', async () => {
    const credentialItems = [filteredIdDoc]; // This is should be the CI on the scopeRequest response
    const dsr = await ScopeRequest.create('abcd',
      [{
        identifier: 'claim-cvc:Document.dateOfBirth-v1',
        credential: 'credential-cvc:IdDocument-v2',
        constraints: {
          meta: {
            issuer: { is: { $eq: 'did:ethr:0x1a88a35421a4a0d3e13fe4e8ebcf18e9a249dc5a' } },
          },
          claims: [
            { path: 'document.dateOfBirth', is: { $lte: '-21y' } },
          ],
        },
      }]);
    expect(dsr).toBeDefined();
    const match = await ScopeRequest.credentialsMatchesRequest(credentialItems, dsr, true);
    expect(match).toBeTruthy();
  });

  it('Should fail ckeck if credentials dont match the request constraints', async () => {
    const credentialItems = [idDoc]; // This is should be the CI on the scopeRequest response
    const dsr = await ScopeRequest.create('abcd',
      [{
        identifier: 'credential-cvc:IdDocument-v1',
        constraints: {
          meta: {
            issuer: { is: { $eq: 'did:ethr:0xf3beac30c498d9e26865f34fcaa57dbb935b0d74' } },
          },
          claims: [
            { path: 'document.dateOfBirth', is: { $lte: '-45y' } },
          ],
        },
      }]);
    expect(dsr).toBeDefined();
    const match = await ScopeRequest.credentialsMatchesRequest(credentialItems, dsr);
    expect(match).toBeFalsy();
  });

  it('Should fail check if v3 credential doesnt match the request constraints', async () => {
    const credentialItems = [emailV3Doc];
    const dsr = await ScopeRequest.create('abcd',
      [{
        identifier: 'credential-cvc:Email-v3',
        credential: 'credential-cvc:Email-v3',
        constraints: {
          meta: {
            issuer: { is: { $eq: 'did:sol:tid652xmv91UHLW3HKnQSYMoNYko6FWd8sUEuYF5LPn' } },
          },
          claims: [
            { path: 'contact.email.domain.name', is: { $eq: 'gmail' } },
          ],
        },
      }]);
    expect(dsr).toBeDefined();
    // will fail check because the credential domain is civic (not gmail)
    const match = await ScopeRequest.credentialsMatchesRequest(credentialItems, dsr);
    expect(match).toBeFalsy();
  });

  it('Should fail ckeck if a credential fails the credential meta check', async () => {
    const credentialItems = [idDoc];
    const dsr = await ScopeRequest.create('abcd',
      [{
        identifier: 'credential-cvc:IdDocument-v1',
        credential: 'credential-cvc:IdDocument-v1',
        constraints: {
          meta: {
            issuer: { is: { $eq: 'did:ethr:different-issuer' } },
          },
          claims: [
            { path: 'document.dateOfBirth', is: { $lte: '-21y' } },
          ],
        },
      }]);
    expect(dsr).toBeDefined();
    const match = await ScopeRequest.credentialsMatchesRequest(credentialItems, dsr, true);
    expect(match).toBeFalsy();
  });

  it('Should fail check if v3 credential fails the credential meta check', async () => {
    const credentialItems = [emailV3Doc];
    const dsr = await ScopeRequest.create('abcd',
      [{
        identifier: 'credential-cvc:Email-v3',
        credential: 'credential-cvc:Email-v3',
        constraints: {
          meta: {
            issuer: { is: { $eq: 'did:sol:different-issuer' } },
          },
          claims: [
            { path: 'contact.email.domain.name', is: { $eq: 'civic' } },
          ],
        },
      }]);
    expect(dsr).toBeDefined();
    // will fail check because the credential domain is civic (not gmail)
    const match = await ScopeRequest.credentialsMatchesRequest(credentialItems, dsr, true);
    expect(match).toBeFalsy();
  });

  it('Should throw with empty credentialItems', async () => {
    const credentialItems = []; // This is should be the CI on the scopeRequest response
    const dsr = await ScopeRequest.create('abcd',
      [{
        identifier: 'credential-cvc:IdDocument-v1',
        constraints: {
          meta: {
            issuer: { is: { $eq: 'did:ethr:0xf3beac30c498d9e26865f34fcaa57dbb935b0d74' } },
          },
          claims: [
            { path: 'document.dateOfBirth', is: { $lte: '-45y' } },
          ],
        },
      }]);
    expect(dsr).toBeDefined();
    return expect(ScopeRequest.credentialsMatchesRequest(credentialItems, dsr)).rejects.toThrow('empty credentialItems param');
  });

  it('Should throw with invaid scopeRequest', () => {
    const credentialItems = [idDoc]; // This is should be the CI on the scopeRequest response
    const dsr = [{
      identifier: 'credential-cvc:IdDocument-v1',
      constraints: {
        meta: {
          issuer: { is: { $eq: 'did:ethr:0xf3beac30c498d9e26865f34fcaa57dbb935b0d74' } },
        },
        claims: [
          { path: 'document.dateOfBirth', is: { $lte: '-45y' } },
        ],
      },
    }];
    expect(dsr).toBeDefined();
    return expect(ScopeRequest.credentialsMatchesRequest(credentialItems, dsr)).rejects.toThrow('invalid scopeRequest object');
  });

  it('Should Construct DSR with evidence idDocumentFront requested with auth', async () => {
    const dsr = await ScopeRequest.create('abcd', ['credential-cvc:Identity-v1'], {
      payloadURL: 'http://localhost/abc',
      eventsURL: 'http://localhost/abc',
      evidences: {
        idDocumentFront: {
          accepts: 'application/json',
          method: 'put',
          url: 'http://localhost/idDocumentFront',
          authorization: 'JWT fjasldfjalsdjfalsjdla',
        },
      },
    });
    expect(dsr).toBeDefined();
  });

  it('Should Construct DSR with evidence idDocumentFront requested without auth', async () => {
    const dsr = await ScopeRequest.create('abcd', ['credential-cvc:Identity-v1'], {
      payloadURL: 'http://localhost/abc',
      eventsURL: 'http://localhost/abc',
      evidences: {
        idDocumentFront: {
          accepts: 'application/json',
          method: 'put',
          url: 'http://localhost/idDocumentFront',
        },
      },
    });
    expect(dsr).toBeDefined();
  });

  it('Should fail Construct DSR with evidence idDocumentFront requested - invalid method', () => expect(ScopeRequest.create('abcd', ['credential-cvc:Identity-v1'], {
    payloadURL: 'http://localhost/abc',
    eventsURL: 'http://localhost/abc',
    evidences: {
      idDocumentFront: {
        accepts: 'application/json',
        method: 'get',
        url: 'http://localhost/idDocumentFront',
      },
    },
  })).rejects.toThrow());

  it('Should fail Construct DSR with evidence idDocumentFront requested - missing url', () => expect(ScopeRequest.create('abcd', ['credential-cvc:Identity-v1'], {
    payloadURL: 'http://localhost/abc',
    eventsURL: 'http://localhost/abc',
    evidences: {
      idDocumentFront: {
        accepts: 'application/json',
        method: 'post',
      },
    },
  })).rejects.toThrow());

  it('Should Construct DSR with all evidence requested', async () => {
    const dsr = await ScopeRequest.create('abcd', [
      {
        identifier: 'claim-cvc:Document.dateOfBirth-v1',
        constraints: {
          meta: {
            credential: 'credential-cvc:IdDocument-v1',
            issuer: { is: { $eq: 'did:ethr:0xf3beac30c498d9e26865f34fcaa57dbb935b0d74' } },
          },
          claims: [
            { path: 'document.dateOfBirth', is: { $lte: '-45y' } },
          ],
        },
      },
      {
        identifier: 'claim-cvc:Validation:evidences.idDocumentFront-v1',
        constraints: {
          meta: {
            credential: 'credential-cvc:IdDocument-v1',
            issuer: { is: { $eq: 'did:ethr:0xf3beac30c498d9e26865f34fcaa57dbb935b0d74' } },
          },
        },
      },
      {
        identifier: 'claim-cvc:Validation:evidences.idDocumentBack-v1',
        constraints: {
          meta: {
            credential: 'credential-cvc:IdDocument-v1',
            issuer: { is: { $eq: 'did:ethr:0xf3beac30c498d9e26865f34fcaa57dbb935b0d74' } },
          },
        },
      },
    ], {
      payloadURL: 'http://localhost/abc',
      eventsURL: 'http://localhost/abc',
      evidences: {
        idDocumentFront: {
          accepts: 'application/json',
          method: 'put',
          url: 'http://localhost/idDocumentFront',
        },
        idDocumentBack: {
          accepts: 'application/json',
          method: 'put',
          url: 'http://localhost/idDocumentBack',
        },
      },
    });
    expect(dsr).toBeDefined();
  });

  it('Should throw an error when creating a DSR with wrong aggregate filters', () => expect(ScopeRequest.create('abcd', [
    {
      identifier: 'claim-cvc:Phone.countryCode-v1',
      aggregate: [
        {
          $somethingToError: [
            {
              path: 'meta.issuer',
              is: {
                $eq: 'did:ethr:0x1a88a35421a4a0d3e13fe4e8ebcf18e9a249dc5a',
              },
            },
            {
              path: 'claims.contact.phoneNumber.countryCode',
              is: {
                $eq: '55',
              },
            },
          ],
        },
      ],
    }])).rejects.toThrow('Invalid Aggregate Object - $somethingToError is not a valid filter'));

  it('Should Construct DSR with aggregation first', async () => {
    const dsr = await ScopeRequest.create('abcd', [
      {
        identifier: 'credential-cvc:Covid19-v1',
        aggregate: [
          {
            $first: 'true',
          },
        ],
      }]);
    expect(dsr).toBeDefined();
  });

  it('Should Construct DSR with aggregation last', async () => {
    const dsr = await ScopeRequest.create('abcd', [
      {
        identifier: 'credential-cvc:Covid19-v1',
        aggregate: [
          {
            $last: 'true',
          },
        ],
      }]);
    expect(dsr).toBeDefined();
  });

  it('Should Construct DSR with aggregation limit', async () => {
    const dsr = await ScopeRequest.create('abcd', [
      {
        identifier: 'credential-cvc:Covid19-v1',
        aggregate: [
          {
            $limit: 3,
          },
        ],
      }]);
    expect(dsr).toBeDefined();
  });

  it('Should Construct DSR with aggregation max', async () => {
    const dsr = await ScopeRequest.create('abcd', [
      {
        identifier: 'credential-cvc:Covid19-v1',
        aggregate: [
          {
            $max: 'claims.medical.covid19.patient.dateOfBirth',
          },
        ],
      }]);
    expect(dsr).toBeDefined();
  });

  it('Should Construct DSR with aggregation min', async () => {
    const dsr = await ScopeRequest.create('abcd', [
      {
        identifier: 'credential-cvc:Covid19-v1',
        aggregate: [
          {
            $min: 'claims.medical.covid19.patient.dateOfBirth',
          },
        ],
      }]);
    expect(dsr).toBeDefined();
  });

  it('Should Construct DSR with aggregation sort', async () => {
    const dsr = await ScopeRequest.create('abcd', [
      {
        identifier: 'claim-cvc:Phone.countryCode-v1',
        aggregate: [
          {
            $sort: {
              'meta.issuanceDate': 'ASC',
            },
          },
        ],
      }]);
    expect(dsr).toBeDefined();
  });

  it('Should Construct DSR with multiple aggregation filters', async () => {
    const dsr = await ScopeRequest.create('abcd', [
      {
        identifier: 'claim-cvc:Phone.countryCode-v1',
        aggregate: [
          {
            $max: 'claims.medical.covid19.patient.dateOfBirth',
          },
          {
            $sort: {
              'meta.issuanceDate': 'ASC',
            },
          },
          {
            $limit: 3,
          },
        ],
      }]);
    expect(dsr).toBeDefined();
  });
});

module.exports = ScopeRequest;
