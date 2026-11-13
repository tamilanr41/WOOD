/**
 * Securely create or promote the first administrator account.
 * Usage:
 *   node scripts/create-admin.mjs <email> <password> "<Full Name>"
 * Or with environment variables:
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... ADMIN_NAME="..." npm run create-admin
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const email = (process.argv[2] || process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const password = process.argv[3] || process.env.ADMIN_PASSWORD || "";
const name = (process.argv[4] || process.env.ADMIN_NAME || "Store Administrator").trim();

if (!email || password.length < 8) {
  console.error(
    "Usage: node scripts/create-admin.mjs <email> <password (min 8 chars)> \"<Full Name>\""
  );
  process.exit(1);
}

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mariya_plywoods";

await mongoose.connect(uri);

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true },
    passwordHash: String,
    role: String,
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const passwordHash = await bcrypt.hash(password, 12);

const existing = await User.findOne({ email });
if (existing) {
  existing.role = "admin";
  existing.passwordHash = passwordHash;
  existing.name = name;
  await existing.save();
  console.log(`Updated existing user ${email} to role=admin.`);
} else {
  await User.create({ name, email, passwordHash, role: "admin" });
  console.log(`Created new admin user: ${email}`);
}

await mongoose.disconnect();

