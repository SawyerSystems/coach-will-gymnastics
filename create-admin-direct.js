import bcrypt from 'bcrypt';
import 'dotenv/config';
import pkg from 'pg';

const { Client } = pkg;

async function createAdminDirectly() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL database');

    // Hash the admin password
    const email = process.env.ADMIN_EMAIL || 'admin@coachwilltumbles.com';
    const password = process.env.ADMIN_PASSWORD || 'TumbleCoach2025!';
    const passwordHash = await bcrypt.hash(password, 10);

    console.log(`🔧 Creating admin account for: ${email}`);

    // Check if admin already exists
    const existingAdmin = await client.query(
      'SELECT id FROM admins WHERE email = $1',
      [email]
    );

    if (existingAdmin.rows.length > 0) {
      console.log('⚠️  Admin already exists, updating password...');
      
      await client.query(
        'UPDATE admins SET password_hash = $1, updated_at = NOW() WHERE email = $2',
        [passwordHash, email]
      );
      
      console.log('✅ Admin password updated successfully');
    } else {
      console.log('🆕 Creating new admin account...');
      
      await client.query(
        'INSERT INTO admins (email, password_hash, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())',
        [email, passwordHash]
      );
      
      console.log('✅ Admin account created successfully');
    }

    // Verify admin was created
    const adminCheck = await client.query(
      'SELECT id, email, created_at FROM admins WHERE email = $1',
      [email]
    );

    if (adminCheck.rows.length > 0) {
      console.log('✅ Admin verification successful:', {
        id: adminCheck.rows[0].id,
        email: adminCheck.rows[0].email,
        created_at: adminCheck.rows[0].created_at
      });
    } else {
      console.log('❌ Admin verification failed');
    }

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    await client.end();
  }
}

createAdminDirectly();
