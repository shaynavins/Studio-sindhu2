-- Add workshopSendDate to measurements table
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS workshop_send_date TIMESTAMP;

-- Create scheduled_jobs table
CREATE TABLE IF NOT EXISTS scheduled_jobs (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL,
  scheduled_for TIMESTAMP NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  recipient_phone TEXT NOT NULL,
  message TEXT NOT NULL,
  order_id VARCHAR,
  measurement_id VARCHAR,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index for faster queries on pending jobs
CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_status_time ON scheduled_jobs(status, scheduled_for);
