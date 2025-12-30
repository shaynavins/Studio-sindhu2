-- Add separate delivery and pickup dates for tailor, workshop, and tassels
ALTER TABLE "measurements" 
ADD COLUMN "tailor_delivery_date" timestamp,
ADD COLUMN "tailor_pickup_date" timestamp,
ADD COLUMN "workshop_delivery_date" timestamp,
ADD COLUMN "workshop_pickup_date" timestamp,
ADD COLUMN "tassels_delivery_date" timestamp,
ADD COLUMN "tassels_pickup_date" timestamp;
