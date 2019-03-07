const sjcl = require('sjcl');


const keyPair = sjcl.ecc.ecdsa.generateKeys(sjcl.ecc.curves.k256);
const pub = keyPair.pub.get();
const prv = keyPair.sec.get();

// 04 is a well-known hex public key prefix
const hexpub = `04${sjcl.codec.hex.fromBits(pub.x.concat(pub.y))}`;
const hexprv = `${sjcl.codec.hex.fromBits(prv)}`;


console.log(JSON.stringify({ xpub: hexpub, xprv: hexprv }, null, 2));
