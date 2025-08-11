import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Users, Heart, Star } from "lucide-react";

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
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Nossa Missão
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Evangelizar, discipular e formar vidas para a glória de Deus, 
            através do amor de Cristo e da comunhão fraternal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="text-center group hover:scale-105 transition-transform duration-300">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-church-blue-medium rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-[var(--shadow-button)] transition-shadow">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">Amor</h3>
              <p className="text-muted-foreground">
                Demonstramos o amor de Cristo através do cuidado e comunhão entre os irmãos.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center group hover:scale-105 transition-transform duration-300">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-church-gold to-church-gold-light rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-[var(--shadow-button)] transition-shadow">
                <Users className="w-8 h-8 text-church-blue-deep" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">Comunidade</h3>
              <p className="text-muted-foreground">
                Uma família unida em Cristo, compartilhando alegrias e momentos de crescimento.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center group hover:scale-105 transition-transform duration-300">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-[var(--shadow-button)] transition-shadow">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">Excelência</h3>
              <p className="text-muted-foreground">
                Buscamos a excelência em tudo que fazemos para honrar e glorificar a Deus.
              </p>
            </CardContent>
          </Card>
        </div>

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