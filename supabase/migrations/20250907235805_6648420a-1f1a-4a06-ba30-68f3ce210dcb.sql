-- Add baptized field to members table
ALTER TABLE public.members 
ADD COLUMN is_baptized boolean DEFAULT false;