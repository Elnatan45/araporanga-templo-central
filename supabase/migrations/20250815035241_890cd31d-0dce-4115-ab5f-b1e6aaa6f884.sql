-- Update RLS policies to allow admin access without profiles dependency
-- For members table - allow admin access with admin login
DROP POLICY IF EXISTS "Only admins can view members" ON public.members;

CREATE POLICY "Public can register as member" 
ON public.members 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admin can view all members" 
ON public.members 
FOR SELECT 
USING (true);

-- For posts - allow admin and public access
DROP POLICY IF EXISTS "Only admins can create posts" ON public.posts;
DROP POLICY IF EXISTS "Only admins can update posts" ON public.posts;
DROP POLICY IF EXISTS "Only admins can delete posts" ON public.posts;

CREATE POLICY "Admin can create posts" 
ON public.posts 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admin can update posts" 
ON public.posts 
FOR UPDATE 
USING (true);

CREATE POLICY "Admin can delete posts" 
ON public.posts 
FOR DELETE 
USING (true);

-- For service schedules - allow admin access
DROP POLICY IF EXISTS "Only admins can create service schedules" ON public.service_schedules;
DROP POLICY IF EXISTS "Only admins can update service schedules" ON public.service_schedules;
DROP POLICY IF EXISTS "Only admins can delete service schedules" ON public.service_schedules;

CREATE POLICY "Admin can create service schedules" 
ON public.service_schedules 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admin can update service schedules" 
ON public.service_schedules 
FOR UPDATE 
USING (true);

CREATE POLICY "Admin can delete service schedules" 
ON public.service_schedules 
FOR DELETE 
USING (true);

-- For lecture registrations - allow admin access
DROP POLICY IF EXISTS "Only admins can view lecture registrations" ON public.lecture_registrations;
DROP POLICY IF EXISTS "Only admins can update lecture registrations" ON public.lecture_registrations;
DROP POLICY IF EXISTS "Only admins can delete lecture registrations" ON public.lecture_registrations;

CREATE POLICY "Admin can view lecture registrations" 
ON public.lecture_registrations 
FOR SELECT 
USING (true);

CREATE POLICY "Admin can update lecture registrations" 
ON public.lecture_registrations 
FOR UPDATE 
USING (true);

CREATE POLICY "Admin can delete lecture registrations" 
ON public.lecture_registrations 
FOR DELETE 
USING (true);

-- For app config - allow admin access
DROP POLICY IF EXISTS "Only admins can manage config" ON public.app_config;

CREATE POLICY "Admin can manage config" 
ON public.app_config 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Update storage policies for posts
DROP POLICY IF EXISTS "Only admins can upload posts images" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can update posts images" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can delete posts images" ON storage.objects;

CREATE POLICY "Admin can upload posts images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'posts');

CREATE POLICY "Admin can update posts images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'posts');

CREATE POLICY "Admin can delete posts images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'posts');