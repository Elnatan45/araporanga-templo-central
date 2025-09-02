import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "lucide-react";

interface PastorInfo {
  id: string;
  name: string;
  image_url: string | null;
  is_active: boolean;
}

export function PastorInfo() {
  const [pastorInfo, setPastorInfo] = useState<PastorInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPastorInfo();
  }, []);

  const fetchPastorInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('pastor_info')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar informações do pastor:', error);
        return;
      }

      if (data) {
        setPastorInfo(data);
      }
    } catch (error) {
      console.error('Erro ao carregar informações do pastor:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-muted-foreground">Carregando informações do pastor...</div>
        </div>
      </section>
    );
  }

  if (!pastorInfo) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Pastor Titular
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Conheça nosso pastor
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-primary/5 to-church-blue-light/20 rounded-2xl p-8 md:p-12 text-center">
            <div className="mb-8">
              {pastorInfo.image_url ? (
                <div className="w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <img 
                    src={pastorInfo.image_url} 
                    alt={`Foto do ${pastorInfo.name}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-48 h-48 mx-auto rounded-full bg-gradient-to-br from-primary to-church-blue-medium flex items-center justify-center border-4 border-white shadow-lg">
                  <User className="w-24 h-24 text-white" />
                </div>
              )}
            </div>
            
            <h3 className="text-2xl md:text-3xl font-bold text-primary mb-4">
              {pastorInfo.name}
            </h3>
            
            <p className="text-lg text-muted-foreground">
              Pastor Titular da Assembleia de Deus - Templo Central Araporanga
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}