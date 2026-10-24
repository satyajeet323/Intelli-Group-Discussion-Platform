/**
 * test-role-based-access.js
 *
 * Automated verification of:
 * 1. Default role "user" assigned on public registration
 * 2. Privilege escalation prevention during registration
 * 3. Normal user login through the standard login page
 * 4. Regular users strictly blocked from accessing any admin APIs (403 Forbidden)
 * 5. Admin users logging in via the same normal user login page
 * 6. Admin token generation and session persistence
 * 7. Admin verified access to protected admin APIs
 * 8. Suspended account handling
 */

import "dotenv/config";
import axios from "axios";
import { connectDB } from "./src/db.js";
import { User } from "./src/models/User.js";
import { AdminUser } from "./src/models/AdminUser.js";
import { AdminRole } from "./src/models/AdminRole.js";
import { PERMISSIONS } from "./src/models/permissions.js";

const PORT = process.env.PORT ?? 4000;
const BASE_URL = `http://localhost:${PORT}`;

async function runTests() {
  console.log("==================================================");
  console.log(" INTELLIBOT Role-Based Access System Verification ");
  console.log("==================================================");

  await connectDB();
  console.log("Connected to MongoDB.");

  // Clean up any test records
  const emails = [
    "normal_test_user@example.com",
    "attacker_test_user@example.com",
    "admin_test_user@example.com",
  ];
  await User.deleteMany({ email: { $in: emails } });
  await AdminUser.deleteMany({ email: { $in: emails } });

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  // ── TEST 1: Public Registration assigns default role 'user' ───────────────
  console.log("\nTest 1: Public registration assigns default role 'user'");
  try {
    const regRes = await axios.post(`${BASE_URL}/api/auth/register`, {
      name: "Normal User",
      email: "normal_test_user@example.com",
      password: "NormalPassword123!",
    });

    assert(regRes.status === 201, "Registration returns 201 Created");
    assert(regRes.data.user.role === "user", "API response indicates role: user");

    const dbUser = await User.findOne({ email: "normal_test_user@example.com" });
    assert(dbUser && dbUser.role === "user", "MongoDB strictly stores role: 'user'");
  } catch (err) {
    assert(false, `Registration failed: ${err.message}`);
  }

  // ── TEST 2: Privilege Escalation Prevention on Registration ──────────────
  console.log("\nTest 2: Privilege escalation prevented when payload specifies role: admin");
  try {
    const attackRes = await axios.post(`${BASE_URL}/api/auth/register`, {
      name: "Attacker User",
      email: "attacker_test_user@example.com",
      password: "AttackerPassword123!",
      role: "admin", // Malicious attempt to escalate role
      isAdmin: true,
    });

    assert(attackRes.status === 201, "Registration succeeded");
    assert(attackRes.data.user.role === "user", "Response role is 'user' (escalation ignored)");

    const dbAttacker = await User.findOne({ email: "attacker_test_user@example.com" });
    assert(dbAttacker && dbAttacker.role === "user", "MongoDB securely stores role: 'user', rejecting escalation");
  } catch (err) {
    assert(false, `Escalation test failed: ${err.message}`);
  }

  // ── TEST 3: Normal User Login via Standard Login Page ─────────────────────
  console.log("\nTest 3: Normal user login via standard /api/auth/login endpoint");
  let normalToken = null;
  try {
    const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: "normal_test_user@example.com",
      password: "NormalPassword123!",
    });

    assert(loginRes.status === 200, "Login returns 200 OK");
    assert(!!loginRes.data.token, "Normal user JWT token is issued");
    assert(loginRes.data.user.role === "user", "Returned user role is 'user'");
    assert(loginRes.data.user.isAdmin === false, "Returned user.isAdmin is false");
    assert(!loginRes.data.adminToken, "No adminToken issued for normal user");

    normalToken = loginRes.data.token;

    // Verify /api/auth/me
    const meRes = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${normalToken}` },
    });
    assert(meRes.data.user.role === "user", "/api/auth/me confirms role: 'user'");
    assert(meRes.data.user.isAdmin === false, "/api/auth/me confirms isAdmin: false");
    assert(!meRes.data.adminToken, "/api/auth/me returns no adminToken");
  } catch (err) {
    assert(false, `Normal login test failed: ${err.message}`);
  }

  // ── TEST 4: Regular User Blocked from Admin APIs (403 Forbidden) ──────────
  console.log("\nTest 4: Regular users blocked from all protected admin APIs");
  const protectedAdminEndpoints = [
    { method: "get", path: "/api/admin/users" },
    { method: "get", path: "/api/admin/system/health" },
    { method: "get", path: "/api/admin/sessions" },
    { method: "get", path: "/api/admin/analytics/overview" },
    { method: "get", path: "/api/admin/roles" },
    { method: "get", path: "/api/admin/audit" },
  ];

  for (const ep of protectedAdminEndpoints) {
    try {
      await axios[ep.method](`${BASE_URL}${ep.path}`, {
        headers: { Authorization: `Bearer ${normalToken}` },
      });
      assert(false, `Regular user unexpectedly accessed ${ep.path}`);
    } catch (err) {
      const status = err.response?.status;
      assert(status === 403, `Regular user blocked from ${ep.path} with 403 Forbidden (got ${status})`);
    }
  }

  // Test unauthenticated access (no token) -> 401
  try {
    await axios.get(`${BASE_URL}/api/admin/users`);
    assert(false, "Unauthenticated user unexpectedly accessed /api/admin/users");
  } catch (err) {
    assert(err.response?.status === 401, "Unauthenticated request rejected with 401 Unauthorized");
  }

  // ── TEST 5: Admin Login via SAME Standard Login Page ──────────────────────
  console.log("\nTest 5: Administrator login via SAME normal user login page");
  // Create an admin user in User collection (as would be created or promoted in MongoDB)
  const adminDbUser = await User.create({
    name: "Platform Admin",
    email: "admin_test_user@example.com",
    password: "AdminPassword123!",
    role: "admin",
  });
  assert(adminDbUser.role === "admin", "Admin user stored in MongoDB with role: 'admin'");

  let adminUserToken = null;
  let adminAdminToken = null;
  try {
    const adminLoginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: "admin_test_user@example.com",
      password: "AdminPassword123!",
    });

    assert(adminLoginRes.status === 200, "Admin login via standard /api/auth/login returns 200 OK");
    assert(!!adminLoginRes.data.token, "User token issued for admin session");
    assert(!!adminLoginRes.data.adminToken, "Admin token issued for admin panel access");
    assert(adminLoginRes.data.user.role === "admin", "Returned user.role is 'admin'");
    assert(adminLoginRes.data.user.isAdmin === true, "Returned user.isAdmin is true");

    adminUserToken = adminLoginRes.data.token;
    adminAdminToken = adminLoginRes.data.adminToken;

    // Verify /api/auth/me for admin
    const adminMeRes = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${adminUserToken}` },
    });
    assert(adminMeRes.data.user.role === "admin", "/api/auth/me confirms role: 'admin'");
    assert(adminMeRes.data.user.isAdmin === true, "/api/auth/me confirms isAdmin: true");
    assert(!!adminMeRes.data.adminToken, "/api/auth/me returns active adminToken");
  } catch (err) {
    assert(false, `Admin login failed: ${err.message}`);
  }

  // ── TEST 6: Admin Access to Protected Admin APIs ──────────────────────────
  console.log("\nTest 6: Admin authorized access to protected admin APIs");
  for (const ep of protectedAdminEndpoints) {
    try {
      const res = await axios[ep.method](`${BASE_URL}${ep.path}`, {
        headers: { Authorization: `Bearer ${adminAdminToken}` },
      });
      assert(res.status === 200, `Admin successfully accessed ${ep.path} with 200 OK`);
    } catch (err) {
      assert(false, `Admin failed to access ${ep.path}: ${err.message}`);
    }
  }

  // Also verify admin can access admin routes using the user JWT token
  console.log("\nTest 6b: Admin accessing admin routes using unified user token");
  try {
    const res = await axios.get(`${BASE_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${adminUserToken}` },
    });
    assert(res.status === 200, "Admin accessed /api/admin/users with user token (dual-token compatibility)");
  } catch (err) {
    assert(false, `Admin user token access failed: ${err.message}`);
  }

  // ── TEST 7: Suspended User / Admin Handling ───────────────────────────────
  console.log("\nTest 7: Suspended account handling");
  await User.updateOne({ email: "admin_test_user@example.com" }, { $set: { isSuspended: true } });
  try {
    await axios.post(`${BASE_URL}/api/auth/login`, {
      email: "admin_test_user@example.com",
      password: "AdminPassword123!",
    });
    assert(false, "Suspended admin should not be able to log in");
  } catch (err) {
    assert(err.response?.status === 403, "Suspended admin login rejected with 403 Forbidden");
  }

  // Clean up test users
  await User.deleteMany({ email: { $in: emails } });
  await AdminUser.deleteMany({ email: { $in: emails } });

  console.log("\n==================================================");
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================");

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
