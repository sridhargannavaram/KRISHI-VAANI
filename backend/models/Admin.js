const { query } = require('../config/db');
const bcrypt = require('bcrypt');

/**
 * Format raw database row into clean Admin object
 */
function formatAdmin(row, includeHash = false) {
  if (!row) return null;
  const adminObj = {
    id: row.id,
    name: row.name,
    email: row.email,
    mobile: row.mobile,
    role: row.role || 'ADMIN',
    isActive: !!row.is_active,
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };

  if (includeHash) {
    adminObj.passwordHash = row.password_hash;
  }

  return adminObj;
}

const Admin = {
  /**
   * Find admin by Email
   */
  findByEmail: async (email, includeHash = false) => {
    if (!email) return null;
    const normalized = email.toLowerCase().trim();
    const res = await query('SELECT * FROM admins WHERE LOWER(email) = $1 LIMIT 1', [normalized]);
    return res.rows.length > 0 ? formatAdmin(res.rows[0], includeHash) : null;
  },

  /**
   * Find admin by Mobile Number
   */
  findByMobile: async (mobile, includeHash = false) => {
    if (!mobile) return null;
    const cleanMobile = mobile.replace(/[^0-9]/g, '');
    const res = await query(`
      SELECT * FROM admins 
      WHERE mobile = $1 
         OR mobile = $2 
         OR mobile = $3
      LIMIT 1
    `, [mobile.trim(), cleanMobile, cleanMobile.slice(-10)]);
    return res.rows.length > 0 ? formatAdmin(res.rows[0], includeHash) : null;
  },

  /**
   * Find admin by either Email or Mobile identifier
   */
  findByIdentifier: async (identifier, includeHash = false) => {
    if (!identifier) return null;
    const idStr = String(identifier).trim();
    if (idStr.includes('@')) {
      return await Admin.findByEmail(idStr, includeHash);
    }
    return await Admin.findByMobile(idStr, includeHash);
  },

  /**
   * Find admin by UUID ID
   */
  findById: async (id, includeHash = false) => {
    if (!id) return null;
    const res = await query('SELECT * FROM admins WHERE id = $1 LIMIT 1', [id]);
    return res.rows.length > 0 ? formatAdmin(res.rows[0], includeHash) : null;
  },

  /**
   * Compare candidate password against stored bcrypt hash
   */
  comparePassword: async (candidatePassword, passwordHash) => {
    if (!candidatePassword || !passwordHash) return false;
    return await bcrypt.compare(candidatePassword, passwordHash);
  },

  /**
   * Update last login timestamp
   */
  updateLastLogin: async (id) => {
    await query('UPDATE admins SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1', [id]);
  },

  /**
   * Idempotent Admin Seeder
   */
  seedAdmin: async ({ name = 'Administrator', email, mobile, password }) => {
    if (!email || !password) {
      throw new Error('Admin email and password are required for initialization.');
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanMobile = (mobile || '').trim();

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Upsert into admins table (on conflict on email update hash, role, is_active)
    const res = await query(`
      INSERT INTO admins (name, email, mobile, password_hash, role, is_active, updated_at)
      VALUES ($1, $2, $3, $4, 'ADMIN', TRUE, NOW())
      ON CONFLICT (email) 
      DO UPDATE SET 
        name = EXCLUDED.name,
        mobile = EXCLUDED.mobile,
        password_hash = EXCLUDED.password_hash,
        role = 'ADMIN',
        is_active = TRUE,
        updated_at = NOW()
      RETURNING *
    `, [name, cleanEmail, cleanMobile, passwordHash]);

    return formatAdmin(res.rows[0]);
  },

  /**
   * List all admins (safe summary)
   */
  listAll: async () => {
    const res = await query('SELECT id, name, email, mobile, role, is_active, last_login_at, created_at FROM admins ORDER BY created_at ASC');
    return res.rows.map(r => formatAdmin(r));
  },

  formatAdmin
};

module.exports = Admin;
