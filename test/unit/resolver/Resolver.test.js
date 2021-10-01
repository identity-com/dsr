const fs = require('fs');
const { schemaLoader, CVCSchemaLoader } = require('@identity.com/credential-commons');
const Resolver = require('../../../src/resolver/Resolver');
const { ScopeRequest } = require('../../../src/ScopeRequest');

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
    eventsURL: 'https://localhost/sr/events',
    payloadURL: 'https://localhost/sr/payload',
  },
};

describe('DSR Filtering and Constraints Tests', () => {
  beforeAll(() => {
    schemaLoader.addLoader(new CVCSchemaLoader());
  });

  it('Shoud know how to convert', () => {
    const resolver = new Resolver();
    expect(resolver.convertMongoOperatorToJavascript('$gt')).toBe('>');
    expect(resolver.convertMongoOperatorToJavascript('$gte')).toBe('>=');
    expect(resolver.convertMongoOperatorToJavascript('$lt')).toBe('<');
    expect(resolver.convertMongoOperatorToJavascript('$lte')).toBe('<=');
  });

  it('Should return two cities from an DSR requesting all VC that contains address.city', async () => {
    const unresolvedFileContents = fs.readFileSync('test/fixtures/filtering/requestCitySimple.json', 'utf8');
    const unresolvedRequest = JSON.parse(unresolvedFileContents);

    const credential1FileContent = fs.readFileSync('test/fixtures/filtering/address1.json', 'utf8');
    const credential1 = JSON.parse(credential1FileContent);

    const credential2FileContent = fs.readFileSync('test/fixtures/filtering/address2.json', 'utf8');
    const credential2 = JSON.parse(credential2FileContent);

    const credential3FileContent = fs.readFileSync('test/fixtures/filtering/identity1.json', 'utf8');
    const credential3 = JSON.parse(credential3FileContent);

    const resolver = new Resolver();
    const filtered = await resolver.filterCredentials(unresolvedRequest, [credential1, credential2, credential3]);

    expect(filtered.length).toBe(2);
  });

  it('Should read an simple DSR that contains an constraint for VCs that contains city', async () => {
    const unresolvedFileContents = fs.readFileSync('test/fixtures/filtering/requestCityOneConstraint.json', 'utf8');
    const unresolvedRequest = JSON.parse(unresolvedFileContents);

    const credential1FileContent = fs.readFileSync('test/fixtures/filtering/address1.json', 'utf8');
    const credential1 = JSON.parse(credential1FileContent);

    const credential2FileContent = fs.readFileSync('test/fixtures/filtering/address2.json', 'utf8');
    const credential2 = JSON.parse(credential2FileContent);

    const credential3FileContent = fs.readFileSync('test/fixtures/filtering/identity1.json', 'utf8');
    const credential3 = JSON.parse(credential3FileContent);

    const resolver = new Resolver();
    const filtered = await resolver.filterCredentials(unresolvedRequest, [credential1, credential2, credential3]);

    expect(filtered.length).toBe(1);
  });

  it('Should read an simple DSR that contains multiple constraint for VCs that contains city', async () => {
    const unresolvedFileContents = fs.readFileSync('test/fixtures/filtering/requestCityMultipleConstraint.json', 'utf8');
    const unresolvedRequest = JSON.parse(unresolvedFileContents);

    const credential1FileContent = fs.readFileSync('test/fixtures/filtering/address1.json', 'utf8');
    const credential1 = JSON.parse(credential1FileContent);

    const credential2FileContent = fs.readFileSync('test/fixtures/filtering/address2.json', 'utf8');
    const credential2 = JSON.parse(credential2FileContent);

    const credential3FileContent = fs.readFileSync('test/fixtures/filtering/identity1.json', 'utf8');
    const credential3 = JSON.parse(credential3FileContent);

    const resolver = new Resolver();
    const filtered = await resolver.filterCredentials(unresolvedRequest, [credential1, credential2, credential3]);

    expect(filtered.length).toBe(1);
  });

  it('Should read an simple DSR that contains a global identifier for claim of an aka for firstName', async () => {
    const unresolvedFileContents = fs.readFileSync('test/fixtures/filtering/requestFirstNameAka.json', 'utf8');
    const unresolvedRequest = JSON.parse(unresolvedFileContents);

    const credential1FileContent = fs.readFileSync('test/fixtures/filtering/address1.json', 'utf8');
    const credential1 = JSON.parse(credential1FileContent);

    const credential2FileContent = fs.readFileSync('test/fixtures/filtering/identity1.json', 'utf8');
    const credential2 = JSON.parse(credential2FileContent);

    const credential3FileContent = fs.readFileSync('test/fixtures/filtering/genericId1.json', 'utf8');
    const credential3 = JSON.parse(credential3FileContent);

    const resolver = new Resolver();
    const filtered = await resolver.filterCredentials(unresolvedRequest, [credential1, credential2, credential3]);
    expect(filtered.length).toBe(1);
  });

  it('Should read an simple DSR that contains a global identifier for claim of without aka', async () => {
    const unresolvedFileContents = fs.readFileSync('test/fixtures/filtering/requestFirstNameWithoutAka.json', 'utf8');
    const unresolvedRequest = JSON.parse(unresolvedFileContents);

    const credential1FileContent = fs.readFileSync('test/fixtures/filtering/address1.json', 'utf8');
    const credential1 = JSON.parse(credential1FileContent);

    const credential2FileContent = fs.readFileSync('test/fixtures/filtering/identity1.json', 'utf8');
    const credential2 = JSON.parse(credential2FileContent);

    const credential3FileContent = fs.readFileSync('test/fixtures/filtering/genericId1.json', 'utf8');
    const credential3 = JSON.parse(credential3FileContent);

    const resolver = new Resolver();
    const filtered = await resolver.filterCredentials(unresolvedRequest, [credential1, credential2, credential3]);
    expect(filtered.length).toBe(1);
  });

  it('Should read an simple DSR that contains a global identifier for claim of without aka returning more than one', async () => {
    const unresolvedFileContents = fs.readFileSync('test/fixtures/filtering/requestFirstNameInDocument.json', 'utf8');
    const unresolvedRequest = JSON.parse(unresolvedFileContents);

    const credential1FileContent = fs.readFileSync('test/fixtures/filtering/genericId1.json', 'utf8');
    const credential1 = JSON.parse(credential1FileContent);

    const credential2FileContent = fs.readFileSync('test/fixtures/filtering/genericId2.json', 'utf8');
    const credential2 = JSON.parse(credential2FileContent);

    const credential3FileContent = fs.readFileSync('test/fixtures/filtering/genericId3.json', 'utf8');
    const credential3 = JSON.parse(credential3FileContent);

    const resolver = new Resolver();
    const filtered = await resolver.filterCredentials(unresolvedRequest, [credential1, credential2, credential3]);
    expect(filtered.length).toBe(3);
  });

  it('Should read an simple DSR with a wrongly created global identifier and return nothing', async () => {
    const unresolvedFileContents = fs.readFileSync('test/fixtures/filtering/requestWrongGlobalIdentifier.json', 'utf8');
    const unresolvedRequest = JSON.parse(unresolvedFileContents);

    const credential1FileContent = fs.readFileSync('test/fixtures/filtering/genericId1.json', 'utf8');
    const credential1 = JSON.parse(credential1FileContent);

    const credential2FileContent = fs.readFileSync('test/fixtures/filtering/genericId2.json', 'utf8');
    const credential2 = JSON.parse(credential2FileContent);

    const credential3FileContent = fs.readFileSync('test/fixtures/filtering/genericId3.json', 'utf8');
    const credential3 = JSON.parse(credential3FileContent);

    const resolver = new Resolver();
    const filtered = await resolver.filterCredentials(unresolvedRequest, [credential1, credential2, credential3]);
    expect(filtered.length).toBe(0);
  });

  it('Should read an simple DSR with a Identity:name request and return one credential', async () => {
    const unresolvedFileContents = fs.readFileSync('test/fixtures/filtering/requestIdentityName.json', 'utf8');
    const unresolvedRequest = JSON.parse(unresolvedFileContents);

    const credential1FileContent = fs.readFileSync('test/fixtures/filtering/genericId1.json', 'utf8');
    const credential1 = JSON.parse(credential1FileContent);

    const credential2FileContent = fs.readFileSync('test/fixtures/filtering/identity1.json', 'utf8');
    const credential2 = JSON.parse(credential2FileContent);

    const credential3FileContent = fs.readFileSync('test/fixtures/filtering/address1.json', 'utf8');
    const credential3 = JSON.parse(credential3FileContent);

    const resolver = new Resolver();
    const filtered = await resolver.filterCredentials(unresolvedRequest, [credential1, credential2, credential3]);
    expect(filtered.length).toBe(1);
  });

  it('Should read an simple DSR with a Identity:name and a constraint request and return one credential', async () => {
    const unresolvedFileContents = fs.readFileSync('test/fixtures/filtering/requestIdentityNameOneConstraint.json', 'utf8');
    const unresolvedRequest = JSON.parse(unresolvedFileContents);

    const credential1FileContent = fs.readFileSync('test/fixtures/filtering/genericId1.json', 'utf8');
    const credential1 = JSON.parse(credential1FileContent);

    const credential2FileContent = fs.readFileSync('test/fixtures/filtering/genericId2.json', 'utf8');
    const credential2 = JSON.parse(credential2FileContent);

    const credential3FileContent = fs.readFileSync('test/fixtures/filtering/genericId3.json', 'utf8');
    const credential3 = JSON.parse(credential3FileContent);

    const resolver = new Resolver();
    const filtered = await resolver.filterCredentials(unresolvedRequest, [credential1, credential2, credential3]);
    expect(filtered.length).toBe(1);
    const vc = filtered[0];
    expect(vc.claim.document.name.givenNames).toBe('JRbSLu3809');
  });

  it('Should filter out credentials that have the same issuer as the DSR constraint', async () => {
    const unresolvedFileContents = fs.readFileSync('test/fixtures/filtering/requestMetaIssuer.json', 'utf8');
    const unresolvedRequest = JSON.parse(unresolvedFileContents);

    const credential1FileContent = fs.readFileSync('test/fixtures/filtering/identity1.json', 'utf8');
    const credential1 = JSON.parse(credential1FileContent);

    const credential2FileContent = fs.readFileSync('test/fixtures/filtering/identity2.json', 'utf8');
    const credential2 = JSON.parse(credential2FileContent);

    const credential3FileContent = fs.readFileSync('test/fixtures/filtering/identity3.json', 'utf8');
    const credential3 = JSON.parse(credential3FileContent);

    const resolver = new Resolver();
    const filtered = await resolver.filterCredentials(unresolvedRequest, [credential1, credential2, credential3]);
    expect(filtered.length).toBe(1);
    const vc = filtered[0];
    expect(vc.issuer).toBe('jest:test:2d516330-d2cc-11e8-b214-99085237d65e');
  });

  it('Should filter out credentials that have the issued date greater than the DSR constraint', async () => {
    const unresolvedFileContents = fs.readFileSync('test/fixtures/filtering/requestMetaIssued.json', 'utf8');
    const unresolvedRequest = JSON.parse(unresolvedFileContents);

    const credential1FileContent = fs.readFileSync('test/fixtures/filtering/identity1.json', 'utf8');
    const credential1 = JSON.parse(credential1FileContent);

    const credential2FileContent = fs.readFileSync('test/fixtures/filtering/identity2.json', 'utf8');
    const credential2 = JSON.parse(credential2FileContent);

    const credential3FileContent = fs.readFileSync('test/fixtures/filtering/identity3.json', 'utf8');
    const credential3 = JSON.parse(credential3FileContent);

    const resolver = new Resolver();
    const filtered = await resolver.filterCredentials(unresolvedRequest, [credential1, credential2, credential3]);
    expect(filtered.length).toBe(3);
  });

  it('Should filter out credentials that have the expiry date lesser than the DSR constraint', async () => {
    const unresolvedFileContents = fs.readFileSync('test/fixtures/filtering/requestMetaIssued.json', 'utf8');
    const unresolvedRequest = JSON.parse(unresolvedFileContents);

    const credential1FileContent = fs.readFileSync('test/fixtures/filtering/identity1.json', 'utf8');
    const credential1 = JSON.parse(credential1FileContent);

    const credential2FileContent = fs.readFileSync('test/fixtures/filtering/identity2.json', 'utf8');
    const credential2 = JSON.parse(credential2FileContent);

    const credential3FileContent = fs.readFileSync('test/fixtures/filtering/identity3.json', 'utf8');
    const credential3 = JSON.parse(credential3FileContent);

    const resolver = new Resolver();
    const filtered = await resolver.filterCredentials(unresolvedRequest, [credential1, credential2, credential3]);
    expect(filtered.length).toBe(3);
  });

  it('Should filter out credentials with a complete meta constraint', async () => {
    const unresolvedFileContents = fs.readFileSync('test/fixtures/filtering/requestMetaComplete.json', 'utf8');
    const unresolvedRequest = JSON.parse(unresolvedFileContents);

    const credential1FileContent = fs.readFileSync('test/fixtures/filtering/identity1.json', 'utf8');
    const credential1 = JSON.parse(credential1FileContent);

    const credential2FileContent = fs.readFileSync('test/fixtures/filtering/identity2.json', 'utf8');
    const credential2 = JSON.parse(credential2FileContent);

    const credential3FileContent = fs.readFileSync('test/fixtures/filtering/identity3.json', 'utf8');
    const credential3 = JSON.parse(credential3FileContent);

    const resolver = new Resolver();
    const filtered = await resolver.filterCredentials(unresolvedRequest, [credential1, credential2, credential3]);
    expect(filtered.length).toBe(1);
    const vc = filtered[0];
    expect(vc.issuer).toBe('jest:test:2d516330-d2cc-11e8-b214-99085237d65e');
  });

  it('Should not give any errors on filtering an empty array of credential items', async () => {
    const dsr = await ScopeRequest.create('abcd', [], config.channels, config.app, config.partner);
    const resolver = new Resolver();
    const filtered = await resolver.filterCredentials(dsr, []);
    expect(filtered.length).toBe(0);
  });

  it('Should not give any errors on filtering DSR with only aggregate tags', async () => {
    const dsr = await ScopeRequest.create('abcd', [
      {
        identifier: 'credential-cvc:Covid19-v1',
        aggregate: [
          {
            $limit: 3,
          },
        ],
      }], config.channels, config.app, config.partner);
    const resolver = new Resolver();
    const filtered = await resolver.filterCredentials(dsr, []);
    expect(filtered.length).toBe(0);
  });

  it('Should filter only by constraints tag and ignore the aggregate tag', async () => {
    const unresolvedFileContents = fs.readFileSync('test/fixtures/aggregation/dsrAggregationLimit.json', 'utf8');
    const unresolvedRequest = JSON.parse(unresolvedFileContents);

    const credential1FileContent = fs.readFileSync('test/fixtures/filtering/identity1.json', 'utf8');
    const credential1 = JSON.parse(credential1FileContent);

    const credential2FileContent = fs.readFileSync('test/fixtures/filtering/identity2.json', 'utf8');
    const credential2 = JSON.parse(credential2FileContent);

    const credential3FileContent = fs.readFileSync('test/fixtures/filtering/identity3.json', 'utf8');
    const credential3 = JSON.parse(credential3FileContent);

    const resolver = new Resolver();
    const filtered = await resolver.filterCredentials(unresolvedRequest, [credential1, credential2, credential3]);
    expect(filtered.length).toBe(1);
    const vc = filtered[0];
    expect(vc.issuer).toBe('jest:test:2d516330-d2cc-11e8-b214-99085237d65e');
  });
});
