import { MapPin, Phone, Mail } from "lucide-react";
import { ServiceSchedules } from "./ServiceSchedules";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ChurchInfo {
  id: string;
  church_name: string;
  church_description: string;
  location: string;
  phone: string;
  email: string;
  copyright_text: string;
}

export function Footer() {
  const [churchInfo, setChurchInfo] = useState<ChurchInfo | null>(null);

  useEffect(() => {
    fetchChurchInfo();
  }, []);

  const fetchChurchInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('church_info')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Erro ao carregar informações da igreja:', error);
        return;
      }

      if (data) {
        setChurchInfo(data);
      }
    } catch (error) {
      console.error('Erro ao carregar informações da igreja:', error);
    }
  };

  if (!churchInfo) {
    return null;
  }

  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Church Info */}
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <span className="font-bold text-xl">{churchInfo.church_name}</span>
            </div>
            <p className="text-white/80 mb-4">
              {churchInfo.church_description}
            </p>
            <div className="space-y-2 text-sm text-white/70">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>{churchInfo.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>{churchInfo.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>{churchInfo.email}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-church-gold">Links Rápidos</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li><a href="/" className="hover:text-church-gold transition-colors">Início</a></li>
              <li><a href="/avisos" className="hover:text-church-gold transition-colors">Avisos</a></li>
              <li><a href="/cadastro" className="hover:text-church-gold transition-colors">Cadastro de Membros</a></li>
            </ul>
          </div>

          {/* Service Times */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-church-gold">Horários de Culto</h3>
            <ServiceSchedules />
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-white/60 text-sm">
            {churchInfo.copyright_text}
          </p>
        </div>
      </div>
    </footer>
  );
}