-- Criar tabela para informações do pastor titular
CREATE TABLE public.pastor_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pastor_info ENABLE ROW LEVEL SECURITY;

-- Criar políticas
CREATE POLICY "Anyone can view active pastor info" 
ON public.pastor_info 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admin can create pastor info" 
ON public.pastor_info 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admin can update pastor info" 
ON public.pastor_info 
FOR UPDATE 
USING (true);

CREATE POLICY "Admin can delete pastor info" 
ON public.pastor_info 
FOR DELETE 
USING (true);

-- Adicionar trigger para timestamps
CREATE TRIGGER update_pastor_info_updated_at
BEFORE UPDATE ON public.pastor_info
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();