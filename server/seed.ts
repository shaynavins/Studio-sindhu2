import 'dotenv/config';
import { db } from './db';
import { users } from '@shared/schema';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Create admin user
    const [admin] = await db.insert(users).values({
      username: 'admin@example.com',
      password: 'admin123', // Change this!
      name: 'Admin User',
      role: 'admin',
    }).returning();
    console.log('✅ Created admin:', admin.username);

    // Create tailor users
    const tailors = await db.insert(users).values([
      {
        phone: '8867636725',
        name: 'Shayna',
        userCode: 'SHAYNA123',
        role: 'tailor',
      },
      {
        phone: '+1234567890',
        name: 'Tailor One',
        userCode: 'TAILOR1',
        role: 'tailor',
      },
      {
        phone: '+9876543210',
        name: 'Tailor Two',
        userCode: 'TAILOR2',
        role: 'tailor',
      },
      // Add more tailors here
    ]).returning();
    console.log(`✅ Created ${tailors.length} tailors`);
    tailors.forEach(t => console.log(`   - ${t.name} (${t.phone}) - Code: ${t.userCode}`));

    console.log('\n🎉 Seeding completed!');
    console.log('\nLogin credentials:');
    console.log('📧 Admin: admin@example.com / admin123');
    console.log('🔑 Tailors: (use user code)');
    tailors.forEach(t => console.log(`   - ${t.name}: ${t.userCode}`));
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

seed();
