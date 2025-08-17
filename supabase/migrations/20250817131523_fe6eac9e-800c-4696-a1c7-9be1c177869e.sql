-- Create table for managing church images
CREATE TABLE public.church_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  is_hero_image BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.church_images ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view church images" 
ON public.church_images 
FOR SELECT 
USING (true);

CREATE POLICY "Admin can create church images" 
ON public.church_images 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admin can update church images" 
ON public.church_images 
FOR UPDATE 
USING (true);

CREATE POLICY "Admin can delete church images" 
ON public.church_images 
FOR DELETE 
USING (true);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_church_images_updated_at
BEFORE UPDATE ON public.church_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for church images
INSERT INTO storage.buckets (id, name, public) VALUES ('church-images', 'church-images', true);

-- Create storage policies for church images
CREATE POLICY "Church images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'church-images');

CREATE POLICY "Admin can upload church images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'church-images');

CREATE POLICY "Admin can update church images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'church-images');

CREATE POLICY "Admin can delete church images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'church-images');