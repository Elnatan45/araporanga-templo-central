-- Create table for lecture information
CREATE TABLE public.lecture_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Palestra para Casais',
  description TEXT,
  location TEXT,
  price DECIMAL(10,2),
  date_time TIMESTAMP WITH TIME ZONE,
  max_participants INTEGER,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  contact_info TEXT,
  additional_info TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lecture_info ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view lecture info" 
ON public.lecture_info 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Allow admin operations on lecture info" 
ON public.lecture_info 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_lecture_info_updated_at
BEFORE UPDATE ON public.lecture_info
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default lecture information
INSERT INTO public.lecture_info (
  title, 
  description, 
  location, 
  price, 
  contact_info,
  additional_info
) VALUES (
  'Palestra para Casais',
  'Uma palestra especial dedicada ao fortalecimento dos relacionamentos matrimoniais.',
  'Assembleia de Deus Templo Central - Araporanga',
  0.00,
  'Entre em contato pelo telefone da igreja ou WhatsApp',
  'Traga sua Bíblia e venha com expectativa de uma palavra especial para seu casamento.'
);