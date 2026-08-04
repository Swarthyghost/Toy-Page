require('dotenv').config({ path: '.env' });
const raw = process.env.GOOGLE_PRIVATE_KEY;
console.log("raw starts with:", JSON.stringify(raw.slice(0,5)));
const privateKey = raw
  ? raw.replace(/^"(.*)"$/s, '$1').replace(/\\n/g, '\n')
  : undefined;
console.log("fixed starts with:", JSON.stringify(privateKey.slice(0,30)));
console.log("fixed ends with:", JSON.stringify(privateKey.slice(-30)));

const crypto = require('crypto');
try {
  const keyObj = crypto.createPrivateKey(privateKey);
  console.log("SUCCESS: key parses,", keyObj.asymmetricKeyType, keyObj.asymmetricKeyDetails?.modulusLength);
} catch (e) {
  console.log("FAILED:", e.message);
}
