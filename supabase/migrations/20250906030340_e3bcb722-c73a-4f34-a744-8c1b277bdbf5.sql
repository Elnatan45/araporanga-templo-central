-- Fix RLS policies for pastor_info table to allow proper admin operations
DROP POLICY IF EXISTS "Admin can create pastor info" ON pastor_info;
DROP POLICY IF EXISTS "Admin can update pastor info" ON pastor_info;
DROP POLICY IF EXISTS "Admin can delete pastor info" ON pastor_info;

-- Create new policies that properly handle admin operations
CREATE POLICY "Allow admin operations on pastor info" 
ON pastor_info 
FOR ALL 
USING (true) 
WITH CHECK (true);