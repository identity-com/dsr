
const sjcl = require('sjcl');
const stableStringify = require('json-stable-stringify');

// well-known hex public key prefix
const MAGIC_BYTE = '04';
const CURVE = sjcl.ecc.curves.k256;

/**
 *
 * @param {*} hexpub - The public key serialized in hex format
 *
 * return the public key on raw byte format
 */
function deserializeHexPub(hexpub) {
  let point = hexpub;
  if (hexpub.startsWith(MAGIC_BYTE)) {
    point = point.substr(2);
  }

  /* eslint-disable-next-line new-cap */
  const key = new sjcl.ecc.ecdsa.publicKey(CURVE, sjcl.codec.hex.toBits(point));

  return key;
}

/**
 *
 * @param {*} hexprv - The private key serialized in hex format
 *
 * return the private key on raw byte format
 */
function deserializeHexPrv(hexprv) {
  /* eslint-disable-next-line new-cap */
  return new sjcl.ecc.ecdsa.secretKey(CURVE, CURVE.field.fromBits(sjcl.codec.hex.toBits(hexprv)));
}

/**
 *
 * @param {*} request - The request object to be signed
 * @param {*} hexprv  - The private key used on the signing algorithm
 *
 * return hexprv.sign(SHA256(request))) as signature
 */
function sign(request, hexprv) {
  const prv = deserializeHexPrv(hexprv);
  const serialized = stableStringify(request);
  const hashed = sjcl.hash.sha256.hash(serialized);
  const signature = prv.sign(hashed);

  return {
    signature: sjcl.codec.hex.fromBits(signature), 
    algorithm: 'ES256'
  };
}

/**
 *
 * @param {*} request - The request object to match the signature
 * @param {*} signature - The digital signatures
 * @param {*} hexpub - The public key used to verify the signature
 *
 * return true is it vefication is valid
 */
function verify(request, signature, hexpub) {
  const pub = deserializeHexPub(hexpub);
  const serialized = stableStringify(request);
  const hashed = sjcl.hash.sha256.hash(serialized);
  return pub.verify(hashed, sjcl.codec.hex.toBits(signature));
}

// This is just a sanity check to make sure the installed SJCL is correct
function sanityCheck() {
  const pair = sjcl.ecc.ecdsa.generateKeys(sjcl.ecc.curves.k256);

  const signature = pair.sec.sign('Hello!');

  return pair.pub.verify('Hello!', signature);
}

module.exports = {
  sign,
  verify,
  sanityCheck,
};
