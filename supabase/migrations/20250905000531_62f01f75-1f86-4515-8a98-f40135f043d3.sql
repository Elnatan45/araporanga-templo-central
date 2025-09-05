-- Add image_position field to pastor_info table
ALTER TABLE public.pastor_info 
ADD COLUMN image_position TEXT NOT NULL DEFAULT 'center center';

-- Update existing records to use default position
UPDATE public.pastor_info 
SET image_position = 'center center' 
WHERE image_position IS NULL;