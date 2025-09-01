import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserCheck, Users, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface FormData {
  fullName: string;
  birthDate: string;
  civilStatus: string;
  gender: string;
  congregation: string;
}

const congregations = [
  { value: "sede_araporanga", label: "Sede Araporanga" },
  { value: "congregacao_boa_vista", label: "Congregação da Boa Vista" },
  { value: "congregacao_ponta_serra", label: "Congregação da Ponta da Serra" },
  { value: "congregacao_balsamo", label: "Congregação do Bálsamo" },
  { value: "congregacao_latao_baixo", label: "Congregação do Latão de Baixo" },
  { value: "congregacao_latao_cima", label: "Congregação do Latão de Cima" },
];

const civilStatusOptions = [
  { value: "solteiro", label: "Solteiro(a)" },
  { value: "casado", label: "Casado(a)" },
  { value: "divorciado", label: "Divorciado(a)" },
  { value: "viuvo", label: "Viúvo(a)" },
];

const genderOptions = [
  { value: "masculino", label: "Masculino" },
  { value: "feminino", label: "Feminino" },
];

export default function Cadastro() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    birthDate: "",
    civilStatus: "",
    gender: "",
    congregation: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.birthDate || !formData.civilStatus || !formData.gender || !formData.congregation) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('members')
        .insert({
          full_name: formData.fullName,
          birth_date: formData.birthDate,
          civil_status: formData.civilStatus as any,
          gender: formData.gender as any,
          congregation: formData.congregation as any,
        });

      if (error) throw error;

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Seus dados foram registrados. Seja bem-vindo(a) à nossa comunidade!",
      });

      // Reset form
      setFormData({
        fullName: "",
        birthDate: "",
        civilStatus: "",
        gender: "",
        congregation: "",
      });
    } catch (error) {
      console.error('Erro ao cadastrar membro:', error);
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro ao processar seu cadastro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Header */}
      <section className="bg-gradient-to-r from-primary to-church-blue-medium text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Cadastro de Membros</h1>
          <p className="text-xl text-white/90">
            Faça parte da nossa família cristã
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-church-blue-medium rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-primary">Dados do Membro</CardTitle>
              <p className="text-muted-foreground">
                Preencha os dados abaixo para se cadastrar em nossa igreja
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo *</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Digite seu nome completo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate">Data de Nascimento *</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => {
                      // Corrigir problema de timezone adicionando um dia
                      const selectedDate = new Date(e.target.value + 'T12:00:00');
                      const formattedDate = selectedDate.toISOString().split('T')[0];
                      setFormData({ ...formData, birthDate: formattedDate });
                    }}
                    required
                    max={new Date().toISOString().split('T')[0]}
                    min="1900-01-01"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gênero *</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o gênero" />
                      </SelectTrigger>
                      <SelectContent>
                        {genderOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="civilStatus">Situação Civil *</Label>
                    <Select value={formData.civilStatus} onValueChange={(value) => setFormData({ ...formData, civilStatus: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a situação civil" />
                      </SelectTrigger>
                      <SelectContent>
                        {civilStatusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="congregation">Congregação *</Label>
                  <Select value={formData.congregation} onValueChange={(value) => setFormData({ ...formData, congregation: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione sua congregação" />
                    </SelectTrigger>
                    <SelectContent>
                      {congregations.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  variant="hero" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Cadastrando..." : "Finalizar Cadastro"}
                </Button>
              </form>

              <div className="mt-8 p-4 bg-church-blue-light/10 rounded-lg border border-church-blue-light/20">
                <div className="flex items-center mb-2">
                  <Users className="h-5 w-5 text-primary mr-2" />
                  <span className="font-semibold text-primary">Nossas Congregações</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                  {congregations.map((congregation) => (
                    <div key={congregation.value}>• {congregation.label}</div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}