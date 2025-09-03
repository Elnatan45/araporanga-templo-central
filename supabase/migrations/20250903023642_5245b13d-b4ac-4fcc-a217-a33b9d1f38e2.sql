-- Create church_info table to store church configuration
CREATE TABLE public.church_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  church_name TEXT NOT NULL DEFAULT 'AD Templo Central',
  church_description TEXT NOT NULL DEFAULT 'Assembleia de Deus Templo Central - Araporanga. Uma comunidade de fé, esperança e amor.',
  location TEXT NOT NULL DEFAULT 'Araporanga - CE',
  phone TEXT NOT NULL DEFAULT 'Telefone da Igreja',
  email TEXT NOT NULL DEFAULT 'adtcaraporanga@gmail.com',
  copyright_text TEXT NOT NULL DEFAULT '© 2024 Assembleia de Deus Templo Central - Araporanga. Todos os direitos reservados.',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.church_info ENABLE ROW LEVEL SECURITY;

-- Create policies for church_info
CREATE POLICY "Anyone can view church info" 
ON public.church_info 
FOR SELECT 
USING (true);

CREATE POLICY "Admin can create church info" 
ON public.church_info 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admin can update church info" 
ON public.church_info 
FOR UPDATE 
USING (true);

CREATE POLICY "Admin can delete church info" 
ON public.church_info 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_church_info_updated_at
BEFORE UPDATE ON public.church_info
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default church information
INSERT INTO public.church_info (church_name, church_description, location, phone, email, copyright_text)
VALUES (
  'AD Templo Central',
  'Assembleia de Deus Templo Central - Araporanga. Uma comunidade de fé, esperança e amor.',
  'Araporanga - CE',
  'Telefone da Igreja',
  'adtcaraporanga@gmail.com',
  '© 2024 Assembleia de Deus Templo Central - Araporanga. Todos os direitos reservados.'
);