import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function Hero() {
  const [currentHeroImage, setCurrentHeroImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    fetchHeroImage();
  }, []);

  const fetchHeroImage = async () => {
    try {
      setImageLoading(true);
      const { data, error } = await supabase
        .from('church_images')
        .select('image_url')
        .eq('is_hero_image', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar imagem:', error);
        setImageLoading(false);
        return;
      }

      if (data?.image_url) {
        setCurrentHeroImage(data.image_url);
      }
    } catch (error) {
      console.error('Erro ao carregar imagem:', error);
    } finally {
      setImageLoading(false);
    }
  };

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      {!imageLoading && currentHeroImage && (
        <div className="absolute inset-0 transition-opacity duration-500">
          {/* Mobile and tablet - cover background */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat lg:hidden"
            style={{ 
              backgroundImage: `url(${currentHeroImage})`
            }}
          />
          
          {/* Desktop - use img tag for better control */}
          <div className="hidden lg:block absolute inset-0">
            <img 
              src={currentHeroImage}
              alt="Igreja"
              className="w-full h-full object-contain"
              style={{ 
                minHeight: '100%',
                backgroundColor: 'rgba(0,0,0,0.1)'
              }}
            />
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-r from-primary/70 to-church-blue-medium/60" />
        </div>
      )}
      
      {/* Fallback gradient background when no image */}
      {(!currentHeroImage || imageLoading) && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-church-blue-medium to-church-blue-deep" />
      )}

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
          Assembleia de Deus
          <span className="block text-church-gold-light">Templo Central</span>
          <span className="block text-3xl md:text-4xl lg:text-5xl font-semibold mt-4">Araporanga</span>
        </h1>
        

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12">
          <Button asChild variant="gold" size="xl" className="text-lg px-8 py-4">
            <Link to="/avisos">Ver Avisos</Link>
          </Button>
          <Button asChild variant="outline" size="xl" className="border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-4">
            <Link to="/cadastro">Cadastrar-se</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}