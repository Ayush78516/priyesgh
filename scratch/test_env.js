import "../Internship-project/config/env.js";

const key = process.env.CCAVENUE_WORKING_KEY;
const code = process.env.CCAVENUE_ACCESS_CODE;
const id = process.env.CCAVENUE_MERCHANT_ID;

console.log("WORKING_KEY:", JSON.stringify(key), "Length:", key?.length);
console.log("ACCESS_CODE:", JSON.stringify(code), "Length:", code?.length);
console.log("MERCHANT_ID:", JSON.stringify(id), "Length:", id?.length);
