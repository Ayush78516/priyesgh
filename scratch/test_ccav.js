import crypto from "crypto";

const workingKey = "12345678901232791839217823928132"; // 32-bit key
const plainText = "merchant_id=123456&order_id=ORD12345";

// Method A: Binary digest & string IV converted to Buffer using 'binary' encoding
const mA = crypto.createHash('md5');
mA.update(workingKey);
const keyA = Buffer.from(mA.digest('binary'), 'binary');
const ivA = Buffer.from('\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f', 'binary');
const cipherA = crypto.createCipheriv('aes-128-cbc', keyA, ivA);
let encodedA = cipherA.update(plainText, 'utf8', 'hex');
encodedA += cipherA.final('hex');

// Method B: Buffer digest & Buffer IV (Implemented)
const keyB = crypto.createHash("md5").update(workingKey).digest();
const ivB = Buffer.from([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]);
const cipherB = crypto.createCipheriv("aes-128-cbc", keyB, ivB);
let encodedB = cipherB.update(plainText, "utf8", "hex");
encodedB += cipherB.final("hex");

console.log("Method A:", encodedA);
console.log("Method B:", encodedB);
console.log("Match:", encodedA === encodedB);
