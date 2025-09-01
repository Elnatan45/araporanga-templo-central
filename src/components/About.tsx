import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock } from "lucide-react";
import { ServiceSchedules } from "@/components/ServiceSchedules";

export function About() {
  const congregations = [
    "Sede Araporanga",
    "Congregação da Boa Vista", 
    "Congregação da Ponta da Serra",
    "Congregação do Bálsamo",
    "Congregação do Latão de Baixo",
    "Congregação do Latão de Cima"
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Horários dos Cultos */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Horários dos Cultos
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Venha participar dos nossos momentos de adoração e comunhão.
            </p>
          </div>

          <div className="bg-gradient-to-r from-primary/5 to-church-blue-light/20 rounded-2xl p-8 md:p-12">
            <div className="flex items-center justify-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-church-blue-medium rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-white" />
              </div>
            </div>
            <ServiceSchedules />
          </div>
        </div>

        {/* Congregações */}
        <div className="bg-gradient-to-r from-primary/5 to-church-blue-light/20 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-primary mb-4">
              Nossas Congregações
            </h3>
            <p className="text-muted-foreground">
              Estamos presentes em diferentes localidades para servir nossa comunidade
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {congregations.map((congregation, index) => (
              <div key={index} className="flex items-center space-x-3 bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-white/60">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="font-medium text-primary">{congregation}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}