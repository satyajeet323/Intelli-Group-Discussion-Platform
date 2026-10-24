/**
 * adminAuth.js — Admin JWT authentication and permission middleware.
 *
 * Usage:
 *   requireAdmin                  — any authenticated admin
 *   requirePermission("users.edit") — admin with specific permission
 *   requireSuperAdmin             — super admin only
 */

import jwt from "jsonwebtoken";
import { AdminUser } from "../models/AdminUser.js";
import { AdminRole } from "../models/AdminRole.js";
import { User } from "../models/User.js";
import { AuditLog } from "../models/AuditLog.js";
import { PERMISSIONS } from "../models/permissions.js";

const ADMIN_JWT_SECRET = () =>
  process.env.ADMIN_JWT_SECRET ?? process.env.JWT_SECRET ?? "admin_fallback_secret";

const USER_JWT_SECRET = () =>
  process.env.JWT_SECRET ?? "fallback_secret";

export function signAdminToken(admin) {
  return jwt.sign(
    { id: admin._id.toString(), name: admin.name, email: admin.email, isAdmin: true, role: "admin" },
    ADMIN_JWT_SECRET(),
    { expiresIn: process.env.ADMIN_JWT_EXPIRES_IN ?? "8h" }
  );
}

export async function requireAdmin(req, res, next) {
  const header = req.headers.authorization ?? "";
  const token  = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: "Admin token required." });
  }

  let payload = null;
  // Try verifying with ADMIN_JWT_SECRET first
  try {
    payload = jwt.verify(token, ADMIN_JWT_SECRET());
  } catch {
    // If not valid with admin secret, try USER_JWT_SECRET
    try {
      payload = jwt.verify(token, USER_JWT_SECRET());
    } catch {
      return res.status(401).json({ success: false, message: "Invalid or expired admin token." });
    }
  }

  try {
    // Check if payload belongs to a User (MongoDB User model)
    const user = await User.findById(payload.id).lean();
    if (user) {
      if (user.isSuspended) {
        return res.status(403).json({ success: false, message: "Account suspended." });
      }
      if (user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Forbidden: Admin access required." });
      }

      // User has role: "admin". Find or sync corresponding AdminUser
      let admin = await AdminUser.findOne({ email: user.email.toLowerCase() }).populate("role").lean();
      if (!admin) {
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
        const created = await AdminUser.create({
          name: user.name,
          email: user.email.toLowerCase(),
          password: user.password || "AdminInitialPass@123!",
          role: superRole._id,
          isSuperAdmin: true,
          isActive: true,
        });
        admin = await AdminUser.findById(created._id).populate("role").lean();
      }

      if (!admin || !admin.isActive) {
        return res.status(403).json({ success: false, message: "Admin account suspended." });
      }

      req.admin = admin;
      req.user = user;
      return next();
    }

    // If not in User, check AdminUser model (e.g. seeded admin)
    const admin = await AdminUser.findById(payload.id).populate("role").lean();
    if (!admin || !admin.isActive) {
      return res.status(401).json({ success: false, message: "Admin account not found or suspended." });
    }

    req.admin = admin;
    return next();
  } catch (err) {
    console.error("[adminAuth] Verification error:", err.message);
    return res.status(500).json({ success: false, message: "Authorization error." });
  }
}

export function requirePermission(permission) {
  return async (req, res, next) => {
    requireAdmin(req, res, () => {
      if (req.admin.isSuperAdmin) return next();
      const perms = req.admin.role?.permissions ?? [];
      if (!perms.includes(permission)) {
        return res.status(403).json({ success: false, message: `Permission denied: ${permission}` });
      }
      next();
    });
  };
}

export function requireSuperAdmin(req, res, next) {
  requireAdmin(req, res, () => {
    if (!req.admin.isSuperAdmin) {
      return res.status(403).json({ success: false, message: "Super admin access required." });
    }
    next();
  });
}

/** Helper to write audit log entries from route handlers */
export async function audit(req, action, category, opts = {}) {
  try {
    if (!req.admin) return;
    await AuditLog.create({
      adminId:    req.admin._id,
      adminName:  req.admin.name,
      adminEmail: req.admin.email,
      action,
      category,
      targetType: opts.targetType ?? "",
      targetId:   opts.targetId   ?? "",
      targetName: opts.targetName ?? "",
      details:    opts.details    ?? {},
      ip:         req.ip ?? "",
      userAgent:  req.headers["user-agent"] ?? "",
      severity:   opts.severity   ?? "info",
    });
  } catch (err) {
    console.error("[audit] Failed to write audit log:", err.message);
  }
}
