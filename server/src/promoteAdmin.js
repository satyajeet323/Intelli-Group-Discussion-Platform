/**
 * promoteAdmin.js — Promote a regular user to admin role.
 * Usage: node src/promoteAdmin.js <email>
 * Example: node src/promoteAdmin.js satyajeet@example.com
 */

import "dotenv/config";
import { connectDB } from "./db.js";
import { User } from "./models/User.js";
import { AdminUser } from "./models/AdminUser.js";
import { AdminRole } from "./models/AdminRole.js";
import { PERMISSIONS } from "./models/permissions.js";

const email = process.argv[2];
if (!email) {
  console.error("Usage: node src/promoteAdmin.js <email>");
  process.exit(1);
}

await connectDB();

const user = await User.findOneAndUpdate(
  { email: email.toLowerCase() },
  { $set: { role: "admin" } },
  { new: true }
);

if (!user) {
  console.error(`No user found with email: ${email}`);
  process.exit(1);
}

let superRole = await AdminRole.findOne({ name: "Super Admin" });
if (!superRole) {
  superRole = await AdminRole.create({
    name: "Super Admin",
    description: "Full access to all platform features",
    color: "#ef4444",
    permissions: [...PERMISSIONS],
    isSystem: true,
  });
}

let adminUser = await AdminUser.findOne({ email: user.email.toLowerCase() });
if (!adminUser) {
  await AdminUser.create({
    name: user.name,
    email: user.email.toLowerCase(),
    password: user.password,
    role: superRole._id,
    isSuperAdmin: true,
    isActive: true,
  });
} else {
  adminUser.isActive = true;
  await adminUser.save();
}

console.log(`✓ Promoted ${user.name} (${user.email}) to admin role.`);
process.exit(0);
