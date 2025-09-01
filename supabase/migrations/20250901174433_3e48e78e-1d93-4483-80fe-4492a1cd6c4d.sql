-- Adicionar campo dirigente na tabela service_schedules
ALTER TABLE public.service_schedules 
ADD COLUMN leader TEXT;