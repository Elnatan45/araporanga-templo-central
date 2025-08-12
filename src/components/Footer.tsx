import { MapPin, Phone, Mail } from "lucide-react";
import churchLogo from "@/assets/church-logo.png";
import { ServiceSchedules } from "./ServiceSchedules";

export function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Church Info */}
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <img src={churchLogo} alt="Logo AD Templo Central" className="h-8 w-8" />
              <span className="font-bold text-xl">AD Templo Central</span>
            </div>
            <p className="text-white/80 mb-4">
              Assembleia de Deus Templo Central - Araporanga. 
              Uma comunidade de fé, esperança e amor.
            </p>
            <div className="space-y-2 text-sm text-white/70">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>Araporanga - CE</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>Telefone da Igreja</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>adtcaraporanga@gmail.com</span>
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
            © 2024 Assembleia de Deus Templo Central - Araporanga. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}