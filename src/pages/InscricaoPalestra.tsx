import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Heart } from "lucide-react";

const formSchema = z.object({
  nomeEsposo: z.string().min(2, "Nome do esposo deve ter pelo menos 2 caracteres"),
  telefoneEsposo: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  cpfEsposo: z.string().min(11, "CPF deve ter 11 dígitos"),
  emailEsposo: z.string().email("Email inválido").optional().or(z.literal("")),
  nomeEsposa: z.string().min(2, "Nome da esposa deve ter pelo menos 2 caracteres"),
  telefoneEsposa: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  cpfEsposa: z.string().min(11, "CPF deve ter 11 dígitos"),
  emailEsposa: z.string().email("Email inválido").optional().or(z.literal("")),
});

type FormData = z.infer<typeof formSchema>;

export default function InscricaoPalestra() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [showPayment, setShowPayment] = useState(false);
  const [lectureEnabled, setLectureEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [lectureInfo, setLectureInfo] = useState<any>(null);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomeEsposo: "",
      telefoneEsposo: "",
      cpfEsposo: "",
      emailEsposo: "",
      nomeEsposa: "",
      telefoneEsposa: "",
      cpfEsposa: "",
      emailEsposa: "",
    },
  });

  useEffect(() => {
    checkLectureStatus();
    fetchLectureInfo();
  }, []);

  const checkLectureStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('app_config')
        .select('value')
        .eq('key', 'lecture_enabled')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setLectureEnabled(data?.value === 'true');
    } catch (error) {
      console.error('Erro ao verificar status da palestra:', error);
    }
  };

  const fetchLectureInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('lecture_info')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setLectureInfo(data);
    } catch (error) {
      console.error('Erro ao carregar informações da palestra:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      // Salvar no banco de dados
      const { error } = await supabase
        .from('lecture_registrations')
        .insert({
          husband_name: data.nomeEsposo,
          husband_phone: data.telefoneEsposo,
          husband_cpf: data.cpfEsposo,
          husband_email: data.emailEsposo || null,
          wife_name: data.nomeEsposa,
          wife_phone: data.telefoneEsposa,
          wife_cpf: data.cpfEsposa,
          wife_email: data.emailEsposa || null,
        });

      if (error) throw error;

      // Usar o valor da palestra ou valor padrão
      const lecturePrice = lectureInfo?.price || 100;
      
      // Dados PIX para geração do QR Code
      const pixData = {
        pixKey: "103.646.613-21",
        receiverName: "Elnatã Oliveira da Rocha Sousa",
        city: "Arapiraca",
        amount: lecturePrice.toFixed(2),
        txId: "PALESTRA" + Date.now(),
        description: lectureInfo?.title || "Palestra de Casais - ADTC Araporanga"
      };

      // Formato EMV para PIX (padrão brasileiro)
      const pixString = `00020126580014br.gov.bcb.pix0136${pixData.pixKey}52040000530398654${pixData.amount.length.toString().padStart(2, '0')}${pixData.amount}5802BR5925${pixData.receiverName}6009${pixData.city}62070503***6304`;
      
      // Gerar QR Code
      const qrCodeDataUrl = await QRCode.toDataURL(pixString, {
        width: 300,
        margin: 2,
      });
      
      setQrCodeUrl(qrCodeDataUrl);
      setShowPayment(true);
      
      toast.success("Inscrição realizada e dados salvos! Escaneie o QR Code para pagamento.");
    } catch (error) {
      console.error('Erro ao processar inscrição:', error);
      toast.error("Erro ao processar inscrição. Tente novamente.");
    }
  };

  const handleWhatsAppRedirect = () => {
    const formData = form.getValues();
    const message = encodeURIComponent(
      `Olá! Realizei a inscrição para a Palestra de Casais e gostaria de enviar o comprovante de pagamento.\n\nDados da inscrição:\nEsposo: ${formData.nomeEsposo}\nEsposa: ${formData.nomeEsposa}`
    );
    
    const whatsappUrl = `https://wa.me/5588988236003?text=${message}`;
    
    // Tenta abrir em nova aba primeiro
    const newWindow = window.open(whatsappUrl, "_blank");
    
    // Se bloqueado, redireciona na mesma aba
    if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
      // Fallback: redireciona na mesma janela
      window.location.href = whatsappUrl;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!lectureEnabled) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="text-center py-8">
              <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-4">Inscrições Encerradas</h2>
              <p className="text-muted-foreground">
                As inscrições para a Palestra de Casais foram encerradas.
                Obrigado pelo interesse!
              </p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (showPayment) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle>Pagamento PIX</CardTitle>
              <CardDescription>
                Escaneie o QR Code abaixo para efetuar o pagamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code PIX" 
                  className="mx-auto border rounded-lg"
                />
              </div>
              
              <div className="space-y-2 text-sm">
                <p><strong>Valor:</strong> R$ {lectureInfo?.price ? lectureInfo.price.toFixed(2).replace('.', ',') : '100,00'}</p>
                <p><strong>Recebedor:</strong> Elnatã Oliveira da Rocha Sousa</p>
                <p><strong>CPF:</strong> 103.646.613-21</p>
              </div>

              <Separator />

              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Após o pagamento, envie o comprovante pelo WhatsApp:
                </p>
                <Button onClick={handleWhatsAppRedirect} className="w-full">
                  Enviar Comprovante via WhatsApp
                </Button>
                
                <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  <p className="font-medium mb-2">Caso o botão não funcione:</p>
                  <p>1. Abra o WhatsApp manualmente</p>
                  <p>2. Envie para: <span className="font-mono">(88) 98823-6003</span></p>
                  <p>3. Mencione os nomes do casal na mensagem</p>
                </div>
              </div>

              <Button 
                variant="outline" 
                onClick={() => setShowPayment(false)}
                className="w-full"
              >
                Voltar ao Formulário
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{lectureInfo?.title || 'Inscrição Palestra de Casais'}</CardTitle>
              <CardDescription>
                <div className="space-y-1">
                  <p><strong>Local:</strong> {lectureInfo?.location || 'ADTC Araporanga'}</p>
                  <p><strong>Data:</strong> {lectureInfo?.date_time ? new Date(lectureInfo.date_time).toLocaleDateString('pt-BR') : 'A definir'}</p>
                  <p><strong>Investimento:</strong> R$ {lectureInfo?.price ? lectureInfo.price.toFixed(2).replace('.', ',') : '100,00'}</p>
                  {lectureInfo?.description && (
                    <p className="text-sm mt-2 text-muted-foreground">{lectureInfo.description}</p>
                  )}
                </div>
              </CardDescription>
            </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Dados do Esposo */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Dados do Esposo</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nomeEsposo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome completo do esposo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="telefoneEsposo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder="(00) 00000-0000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cpfEsposo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF</FormLabel>
                          <FormControl>
                            <Input placeholder="000.000.000-00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="emailEsposo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email (opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="email@exemplo.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Dados da Esposa */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Dados da Esposa</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nomeEsposa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome completo da esposa" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="telefoneEsposa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder="(00) 00000-0000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cpfEsposa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF</FormLabel>
                          <FormControl>
                            <Input placeholder="000.000.000-00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="emailEsposa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email (opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="email@exemplo.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Realizar Inscrição
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}