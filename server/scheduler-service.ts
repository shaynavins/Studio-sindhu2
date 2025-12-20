import cron from 'node-cron';
import { db } from './db.js';
import { scheduledJobs } from '@shared/schema';
import { eq, and, lte } from 'drizzle-orm';
import { sendWhatsAppMessage } from './whatsapp-service.js';

/**
 * Scheduler service that checks for pending scheduled jobs
 * and provides methods to manage them
 */

let schedulerTask: cron.ScheduledTask | null = null;

/**
 * Check for pending jobs that are due
 * Returns jobs that should be executed now
 */
export async function getPendingJobs() {
  try {
    const now = new Date();
    
    const jobs = await db
      .select()
      .from(scheduledJobs)
      .where(
        and(
          eq(scheduledJobs.status, 'pending'),
          lte(scheduledJobs.scheduledFor, now)
        )
      );
    
    return jobs;
  } catch (error) {
    console.error('Error fetching pending jobs:', error);
    return [];
  }
}

/**
 * Mark a job as completed
 */
export async function markJobCompleted(jobId: string) {
  try {
    await db
      .update(scheduledJobs)
      .set({ 
        status: 'completed',
        updatedAt: new Date()
      })
      .where(eq(scheduledJobs.id, jobId));
    
    console.log(`Job ${jobId} marked as completed`);
  } catch (error) {
    console.error(`Error marking job ${jobId} as completed:`, error);
  }
}

/**
 * Cancel a scheduled job
 */
export async function cancelJob(jobId: string) {
  try {
    await db
      .update(scheduledJobs)
      .set({ 
        status: 'cancelled',
        updatedAt: new Date()
      })
      .where(eq(scheduledJobs.id, jobId));
    
    console.log(`Job ${jobId} cancelled`);
  } catch (error) {
    console.error(`Error cancelling job ${jobId}:`, error);
  }
}

/**
 * Execute a scheduled job
 */
export async function executeJob(jobId: string) {
  try {
    const [job] = await db
      .select()
      .from(scheduledJobs)
      .where(eq(scheduledJobs.id, jobId))
      .limit(1);
    
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    
    if (job.status !== 'pending') {
      console.log(`Job ${jobId} is not pending (status: ${job.status})`);
      return;
    }
    
    // Send the WhatsApp message
    await sendWhatsAppMessage(job.recipientPhone, job.message);
    
    // Mark as completed
    await markJobCompleted(jobId);
    console.log(`Successfully executed job ${jobId}`);
  } catch (error: any) {
    console.error(`Error executing job ${jobId}:`, error);
    throw error;
  }
}

/**
 * Start the scheduler
 * Runs every hour to check for pending jobs and execute them
 */
export function startScheduler() {
  if (schedulerTask) {
    console.log('Scheduler is already running');
    return;
  }
  
  // Run every hour at the start of the hour
  schedulerTask = cron.schedule('0 * * * *', async () => {
    console.log('Running scheduled job check...');
    const pendingJobs = await getPendingJobs();
    
    if (pendingJobs.length > 0) {
      console.log(`Found ${pendingJobs.length} pending job(s) to execute`);
      
      // Execute each pending job
      for (const job of pendingJobs) {
        try {
          await executeJob(job.id);
        } catch (error) {
          console.error(`Failed to execute job ${job.id}:`, error);
        }
      }
    }
  });
  
  console.log('Scheduler started - checking for pending jobs every hour');
}

/**
 * Stop the scheduler
 */
export function stopScheduler() {
  if (schedulerTask) {
    schedulerTask.stop();
    schedulerTask = null;
    console.log('Scheduler stopped');
  }
}

/**
 * Get all scheduled jobs for today and upcoming
 */
export async function getUpcomingJobs() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const jobs = await db
      .select()
      .from(scheduledJobs)
      .where(
        and(
          eq(scheduledJobs.status, 'pending'),
          lte(scheduledJobs.scheduledFor, new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)) // Next 7 days
        )
      );
    
    return jobs;
  } catch (error) {
    console.error('Error fetching upcoming jobs:', error);
    return [];
  }
}
