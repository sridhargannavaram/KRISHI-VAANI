require('dotenv').config();
const { initDb } = require('./config/db');
const Admin = require('./models/Admin');

async function seedAdminAccount() {
  const email = process.env.ADMIN_EMAIL;
  const mobile = process.env.ADMIN_MOBILE;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('❌ Error: ADMIN_EMAIL and ADMIN_PASSWORD environment variables must be defined in .env');
    process.exit(1);
  }

  try {
    // Ensure DB tables exist
    await initDb();

    // Mask mobile for security
    const maskedMobile = mobile 
      ? mobile.slice(0, 2) + '******' + mobile.slice(-2)
      : 'Not provided';

    const admin = await Admin.seedAdmin({
      name: 'System Administrator',
      email: email,
      mobile: mobile || '',
      password: password
    });

    console.log('==================================================');
    console.log('🛡️  KRISHI VAANI — ADMIN INITIALIZATION SUCCESSFUL');
    console.log('==================================================');
    console.log(`Admin ID     : ${admin.id}`);
    console.log(`Admin Email  : ${admin.email}`);
    console.log(`Admin Mobile : ${maskedMobile}`);
    console.log(`Role         : ${admin.role}`);
    console.log(`Status       : ${admin.isActive ? 'ACTIVE' : 'INACTIVE'}`);
    console.log('Password     : [SECURELY HASHED WITH BCRYPT IN DATABASE]');
    console.log('==================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Admin initialization failed:', err.message);
    process.exit(1);
  }
}

seedAdminAccount();
