-- Create couples lecture registrations table
CREATE TABLE public.lecture_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  husband_name TEXT NOT NULL,
  husband_phone TEXT NOT NULL,
  husband_cpf TEXT NOT NULL,
  husband_email TEXT,
  wife_name TEXT NOT NULL,
  wife_phone TEXT NOT NULL,
  wife_cpf TEXT NOT NULL,
  wife_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.lecture_registrations ENABLE ROW LEVEL SECURITY;

-- Create policies for the lecture registrations table
CREATE POLICY "Anyone can register for lecture" 
ON public.lecture_registrations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Only admins can view lecture registrations" 
ON public.lecture_registrations 
FOR SELECT 
USING (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::text))));

CREATE POLICY "Only admins can update lecture registrations" 
ON public.lecture_registrations 
FOR UPDATE 
USING (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::text))));

CREATE POLICY "Only admins can delete lecture registrations" 
ON public.lecture_registrations 
FOR DELETE 
USING (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::text))));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_lecture_registrations_updated_at
BEFORE UPDATE ON public.lecture_registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create a configuration table for feature toggles
CREATE TABLE public.app_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on config table
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Only admins can manage configuration
CREATE POLICY "Only admins can manage config" 
ON public.app_config 
FOR ALL 
USING (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::text))))
WITH CHECK (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::text))));

-- Insert default config for lecture feature
INSERT INTO public.app_config (key, value) VALUES ('lecture_enabled', 'true');

-- Create trigger for config table
CREATE TRIGGER update_app_config_updated_at
BEFORE UPDATE ON public.app_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();