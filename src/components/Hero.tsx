import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/church-hero.jpg";

export function Hero() {
  const [currentHeroImage, setCurrentHeroImage] = useState(heroImage);

  useEffect(() => {
    fetchHeroImage();
  }, []);

  const fetchHeroImage = async () => {
    try {
      const { data, error } = await supabase
        .from('church_images')
        .select('image_url')
        .eq('is_hero_image', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar imagem:', error);
        return;
      }

      if (data?.image_url) {
        setCurrentHeroImage(data.image_url);
      }
    } catch (error) {
      console.error('Erro ao carregar imagem:', error);
    }
  };

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${currentHeroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-church-blue-medium/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Assembleia de Deus
          <span className="block text-church-gold-light">Templo Central</span>
          <span className="block text-2xl md:text-3xl font-semibold mt-2">Araporanga</span>
        </h1>
        
        <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto leading-relaxed">
          Uma comunidade de fé, esperança e amor. Venha fazer parte da nossa família cristã.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild variant="gold" size="xl">
            <Link to="/avisos">Ver Avisos</Link>
          </Button>
          <Button asChild variant="outline" size="xl" className="border-white text-white hover:bg-white hover:text-primary">
            <Link to="/cadastro">Cadastrar-se</Link>
          </Button>
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-3xl font-bold text-church-gold-light mb-2">6</h3>
            <p className="text-white/90">Congregações</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-3xl font-bold text-church-gold-light mb-2">Unidos</h3>
            <p className="text-white/90">em Cristo</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-3xl font-bold text-church-gold-light mb-2">Família</h3>
            <p className="text-white/90">Cristã</p>
          </div>
        </div>
      </div>
    </section>
  );
}