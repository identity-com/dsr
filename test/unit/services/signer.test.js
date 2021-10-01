const fs = require('fs');
const { sign, verify, sanityCheck } = require('../../../src/services/signer');

const hexpub = '04378df3e480e626541daec66c4bbad532430d28e1ecb6b70a03313fc07fbad5c0d8b26410eac8f0b1a448898cbed9d714fd9cab2a8d1a7885bfbb48bd673da03c';
const hexprv = 'f728fed0153f3b46a0fccdd9ed9954ad56fd4e8af016fe59075655aa9feb9a59';

const message = {
  zhed: 200,
  hello: 'world',
  alpha: 'beta',
};

describe('Signer Tests', () => {
  test('Shoud ECC and ECDSA work', () => {
    expect(sanityCheck()).toBeTruthy();
  });

  test('Should return a valid signature', () => {
    const signatureResponse = sign(message, hexprv);
    expect(signatureResponse.signature).toBeDefined();
    expect(signatureResponse.algorithm).toBeDefined();
  });

  test('Should verify a valid signature', () => {
    const signatureResponse = sign(message, hexprv);
    const result = verify(message, signatureResponse.signature, hexpub);
    expect(result).toBeTruthy();
  });

  test('Should verify signature algorithm', () => {
    const signatureResponse = sign(message, hexprv);
    expect(signatureResponse.algorithm).toBeDefined();
    expect(signatureResponse.algorithm).toBe('ES256');
  });

  test('Should verify a valid signature - branch test', () => {
    const signatureResponse = sign(message, hexprv);
    const result = verify(message, signatureResponse.signature, hexpub.substr(2));

    expect(result).toBeTruthy();
  });

  it('Should filter out credentials that have the issued date greater than the DSR constraint', async () => {
    const unresolvedFileContents = fs.readFileSync('test/fixtures/signing/unresolvedDsrWithWrongClaims.json', 'utf8');
    const unresolvedRequest = JSON.parse(unresolvedFileContents);
    const signature = sign(unresolvedRequest.payload, hexprv);
    console.log(signature);
  });
});
