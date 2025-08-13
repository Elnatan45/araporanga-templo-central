import { useState } from "react";
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

  const onSubmit = async (data: FormData) => {
    try {
      // Dados PIX para geração do QR Code
      const pixData = {
        pixKey: "103.646.613-21",
        receiverName: "Elnatã Oliveira da Rocha Sousa",
        city: "Arapiraca",
        amount: "100.00",
        txId: "PALESTRA" + Date.now(),
        description: "Palestra de Casais - ADTC Araporanga"
      };

      // Formato EMV para PIX (padrão brasileiro)
      const pixString = `00020101021226830014br.gov.bcb.pix2561${pixData.pixKey}5204000053039865802BR5925${pixData.receiverName}6008${pixData.city}62070503***6304`;
      
      // Gerar QR Code
      const qrCodeDataUrl = await QRCode.toDataURL(pixString, {
        width: 300,
        margin: 2,
      });
      
      setQrCodeUrl(qrCodeDataUrl);
      setShowPayment(true);
      
      toast.success("Inscrição realizada! Escaneie o QR Code para pagamento.");
    } catch (error) {
      toast.error("Erro ao gerar QR Code. Tente novamente.");
    }
  };

  const handleWhatsAppRedirect = () => {
    const message = encodeURIComponent(
      "Olá! Realizei a inscrição para a Palestra de Casais e gostaria de enviar o comprovante de pagamento."
    );
    window.open(`https://wa.me/5588988236003?text=${message}`, "_blank");
  };

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
                <p><strong>Valor:</strong> R$ 100,00</p>
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
            <CardTitle className="text-2xl">Inscrição Palestra de Casais</CardTitle>
            <CardDescription>
              <div className="space-y-1">
                <p><strong>Local:</strong> ADTC Araporanga</p>
                <p><strong>Data:</strong> 13/12/2025</p>
                <p><strong>Investimento:</strong> R$ 100,00</p>
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