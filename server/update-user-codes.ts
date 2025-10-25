import 'dotenv/config';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

async function updateUserCodes() {
  console.log('🔄 Updating user codes...');

  try {
    // Get all tailor users
    const tailors = await db.select().from(users).where(eq(users.role, 'tailor'));
    
    console.log(`Found ${tailors.length} tailors to update`);
    
    // Update each tailor with a user code if they don't have one
    for (const tailor of tailors) {
      if (!tailor.userCode) {
        // Generate a user code based on their name or phone
        const code = tailor.name.toUpperCase().replace(/\s+/g, '') + '123';
        
        await db.update(users)
          .set({ userCode: code })
          .where(eq(users.id, tailor.id));
        
        console.log(`✅ Updated ${tailor.name} with code: ${code}`);
      } else {
        console.log(`⏭️  ${tailor.name} already has code: ${tailor.userCode}`);
      }
    }
    
    console.log('\n🎉 Update completed!');
    
  } catch (error) {
    console.error('❌ Update failed:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

updateUserCodes();
