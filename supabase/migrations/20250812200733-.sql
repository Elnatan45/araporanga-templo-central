-- Create table for service schedules
CREATE TABLE public.service_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week TEXT NOT NULL,
  service_name TEXT NOT NULL,
  service_time TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.service_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies for service schedules
CREATE POLICY "Anyone can view service schedules" 
ON public.service_schedules 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Only admins can create service schedules" 
ON public.service_schedules 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Only admins can update service schedules" 
ON public.service_schedules 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Only admins can delete service schedules" 
ON public.service_schedules 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_service_schedules_updated_at
BEFORE UPDATE ON public.service_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default service schedules
INSERT INTO public.service_schedules (day_of_week, service_name, service_time, sort_order) VALUES
('Domingo', 'Culto da Noite', '19h', 1),
('Segunda-feira', 'Escola Bíblica', '19h', 2),
('Quarta-feira', 'Culto de Adoração', '19h00', 3),
('Sexta-feira', 'Culto de Doutrina', '19h00', 4);