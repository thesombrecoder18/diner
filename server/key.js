import crypto from 'crypto';
const secretKey = crypto.randomBytes(32).toString('base64');
console.log(secretKey);