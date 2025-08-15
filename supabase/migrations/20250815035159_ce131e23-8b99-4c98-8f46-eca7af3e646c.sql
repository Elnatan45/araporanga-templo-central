-- Create storage bucket for posts images
INSERT INTO storage.buckets (id, name, public) VALUES ('posts', 'posts', true);

-- Create policies for posts images
CREATE POLICY "Posts images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'posts');

CREATE POLICY "Only admins can upload posts images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'posts' AND EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::text))));

CREATE POLICY "Only admins can update posts images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'posts' AND EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::text))));

CREATE POLICY "Only admins can delete posts images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'posts' AND EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::text))));