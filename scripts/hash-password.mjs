// Usage: node scripts/hash-password.mjs "NewPassword"  → prints a value for ADMIN_PASSWORD_HASH
import { randomBytes, scryptSync } from "node:crypto";
const pw = process.argv[2];
if (!pw) {
  console.error('Usage: node scripts/hash-password.mjs "NewPassword"');
  process.exit(1);
}
const salt = randomBytes(16);
const hash = scryptSync(pw, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
console.log(["scrypt", 16384, 8, 1, salt.toString("base64"), hash.toString("base64")].join(":"));
