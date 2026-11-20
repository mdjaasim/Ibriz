// Makes a VAPID key pair for Web Push. The PUBLIC key goes to stderr (put it in wrangler.toml as VAPID_PUBLIC).
// The PRIVATE key goes to stdout only, so pipe it straight into wrangler and it is never shown or saved:
//   node scripts/vapid.mjs 2>vapid-public.txt | npx wrangler secret put VAPID_PRIVATE
import { b64urlEncode } from '../src/b64.js';

const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign']);
const pub = new Uint8Array(await crypto.subtle.exportKey('raw', pair.publicKey));
const jwk = await crypto.subtle.exportKey('jwk', pair.privateKey);
console.error(b64urlEncode(pub));
process.stdout.write(jwk.d);
