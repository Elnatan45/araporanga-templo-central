-- Add delete policy for members
CREATE POLICY "Admin can delete members" ON public.members
FOR DELETE USING (true);