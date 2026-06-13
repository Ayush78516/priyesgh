// CCAvenue AES-128 Utility
// Exact copy from NodeJS_Integration_Kit/AES-128/nonseamless/ccavutil.js
import crypto from "crypto";

export function encrypt(plainText, workingKey) {
  const key = crypto.createHash("md5").update(workingKey).digest();
  const iv = Buffer.from([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]);
  const cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
  let encoded = cipher.update(plainText, "utf8", "hex");
  encoded += cipher.final("hex");
  return encoded;
}

export function decrypt(encText, workingKey) {
  const key = crypto.createHash("md5").update(workingKey).digest();
  const iv = Buffer.from([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]);
  const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
  let decoded = decipher.update(encText, "hex", "utf8");
  decoded += decipher.final("utf8");
  return decoded;
}