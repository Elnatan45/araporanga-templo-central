import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Shield, Users, MessageSquare, Plus, Clock, Edit, Trash2 } from "lucide-react";
import { User, Session } from '@supabase/supabase-js';

interface Member {
  id: string;
  full_name: string;
  civil_status: string;
  gender: string;
  congregation: string;
  created_at: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
}

interface PostForm {
  title: string;
  content: string;
  imageUrl: string;
}

interface ServiceSchedule {
  id: string;
  day_of_week: string;
  service_name: string;
  service_time: string;
  is_active: boolean;
  sort_order: number;
}

interface ServiceForm {
  day_of_week: string;
  service_name: string;
  service_time: string;
}

const congregationLabels = {
  sede_araporanga: "Sede Araporanga",
  congregacao_boa_vista: "Congregação da Boa Vista",
  congregacao_ponta_serra: "Congregação da Ponta da Serra",
  congregacao_balsamo: "Congregação do Bálsamo",
  congregacao_latao_baixo: "Congregação do Latão de Baixo",
  congregacao_latao_cima: "Congregação do Latão de Cima",
};

const civilStatusLabels = {
  solteiro: "Solteiro(a)",
  casado: "Casado(a)",
  divorciado: "Divorciado(a)",
  viuvo: "Viúvo(a)",
};

const genderLabels = {
  masculino: "Masculino",
  feminino: "Feminino",
};

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [services, setServices] = useState<ServiceSchedule[]>([]);
  const [postForm, setPostForm] = useState<PostForm>({
    title: "",
    content: "",
    imageUrl: "",
  });
  const [serviceForm, setServiceForm] = useState<ServiceForm>({
    day_of_week: "",
    service_name: "",
    service_time: "",
  });
  const [editingService, setEditingService] = useState<ServiceSchedule | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginData, setLoginData] = useState({ email: "Elnata", password: "Araporanga" });
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session?.user);
        if (!session?.user) {
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);
      if (session?.user) {
        checkAdminAccess();
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user?.id)
        .single();

      if (profile?.role === 'admin') {
        fetchMembers();
        fetchPosts();
        fetchServices();
      } else {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para acessar esta área.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const redirectUrl = `${window.location.origin}/admin`;
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo à área administrativa.",
      });
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Verifique suas credenciais.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowLoginForm(false);
    setLoginData({ email: "Elnata", password: "Araporanga" });
  };

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('service_schedules')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!postForm.title.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Por favor, insira um título para o aviso.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          title: postForm.title,
          content: postForm.content || null,
          image_url: postForm.imageUrl || null,
          author_id: user?.id,
        });

      if (error) throw error;

      toast({
        title: "Aviso publicado!",
        description: "O aviso foi criado com sucesso.",
      });

      setPostForm({ title: "", content: "", imageUrl: "" });
      fetchPosts();
    } catch (error) {
      console.error('Erro ao criar post:', error);
      toast({
        title: "Erro ao publicar",
        description: "Ocorreu um erro ao criar o aviso. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!serviceForm.day_of_week.trim() || !serviceForm.service_name.trim() || !serviceForm.service_time.trim()) {
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
        .from('service_schedules')
        .insert({
          day_of_week: serviceForm.day_of_week,
          service_name: serviceForm.service_name,
          service_time: serviceForm.service_time,
          sort_order: services.length + 1,
        });

      if (error) throw error;

      toast({
        title: "Horário adicionado!",
        description: "O horário de culto foi criado com sucesso.",
      });

      setServiceForm({ day_of_week: "", service_name: "", service_time: "" });
      fetchServices();
    } catch (error) {
      console.error('Erro ao criar horário:', error);
      toast({
        title: "Erro ao criar",
        description: "Ocorreu um erro ao criar o horário. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingService) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('service_schedules')
        .update({
          day_of_week: serviceForm.day_of_week,
          service_name: serviceForm.service_name,
          service_time: serviceForm.service_time,
        })
        .eq('id', editingService.id);

      if (error) throw error;

      toast({
        title: "Horário atualizado!",
        description: "O horário de culto foi atualizado com sucesso.",
      });

      setServiceForm({ day_of_week: "", service_name: "", service_time: "" });
      setEditingService(null);
      fetchServices();
    } catch (error) {
      console.error('Erro ao atualizar horário:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar o horário. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditService = (service: ServiceSchedule) => {
    setEditingService(service);
    setServiceForm({
      day_of_week: service.day_of_week,
      service_name: service.service_name,
      service_time: service.service_time,
    });
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from('service_schedules')
        .update({ is_active: false })
        .eq('id', serviceId);

      if (error) throw error;

      toast({
        title: "Horário removido!",
        description: "O horário foi removido com sucesso.",
      });

      fetchServices();
    } catch (error) {
      console.error('Erro ao remover horário:', error);
      toast({
        title: "Erro ao remover",
        description: "Ocorreu um erro ao remover o horário. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    setEditingService(null);
    setServiceForm({ day_of_week: "", service_name: "", service_time: "" });
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <section className="py-20">
          <div className="max-w-md mx-auto px-4">
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-church-blue-medium rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-primary">Área Administrativa</CardTitle>
                <p className="text-muted-foreground">
                  Faça login para acessar o painel administrativo
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Usuário</Label>
                    <Input
                      id="username"
                      type="text"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      placeholder="Elnata"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      placeholder="********"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" variant="hero">
                    Entrar
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Header */}
      <section className="bg-gradient-to-r from-primary to-church-blue-medium text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Painel Administrativo</h1>
              <p className="text-xl text-white/90">
                Gerenciar membros, avisos e horários da igreja
              </p>
            </div>
            <Button onClick={handleLogout} variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
              Sair
            </Button>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="members" className="space-y-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="members" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Membros
              </TabsTrigger>
              <TabsTrigger value="posts" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Avisos
              </TabsTrigger>
              <TabsTrigger value="services" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Horários
              </TabsTrigger>
            </TabsList>

            <TabsContent value="members">
              <Card>
                <CardHeader>
                  <CardTitle>Membros Cadastrados ({members.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {members.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Nenhum membro cadastrado ainda.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Gênero</TableHead>
                            <TableHead>Estado Civil</TableHead>
                            <TableHead>Congregação</TableHead>
                            <TableHead>Data de Cadastro</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {members.map((member) => (
                            <TableRow key={member.id}>
                              <TableCell className="font-medium">{member.full_name}</TableCell>
                              <TableCell>{genderLabels[member.gender as keyof typeof genderLabels]}</TableCell>
                              <TableCell>{civilStatusLabels[member.civil_status as keyof typeof civilStatusLabels]}</TableCell>
                              <TableCell>{congregationLabels[member.congregation as keyof typeof congregationLabels]}</TableCell>
                              <TableCell>
                                {format(new Date(member.created_at), "dd/MM/yyyy", { locale: ptBR })}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="posts">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Create Post Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      Criar Novo Aviso
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreatePost} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Título *</Label>
                        <Input
                          id="title"
                          value={postForm.title}
                          onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                          placeholder="Título do aviso"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="content">Conteúdo</Label>
                        <Textarea
                          id="content"
                          value={postForm.content}
                          onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                          placeholder="Descrição do aviso..."
                          rows={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="imageUrl">URL da Imagem</Label>
                        <Input
                          id="imageUrl"
                          value={postForm.imageUrl}
                          onChange={(e) => setPostForm({ ...postForm, imageUrl: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                      <Button type="submit" disabled={isSubmitting} variant="hero" className="w-full">
                        {isSubmitting ? "Publicando..." : "Publicar Aviso"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Posts List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Avisos Publicados ({posts.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {posts.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Nenhum aviso publicado ainda.</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {posts.map((post) => (
                          <div key={post.id} className="border rounded-lg p-4">
                            <h3 className="font-semibold text-primary mb-2">{post.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {format(new Date(post.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </p>
                            {post.content && (
                              <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="services">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Create/Edit Service Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {editingService ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                      {editingService ? 'Editar Horário' : 'Adicionar Horário'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={editingService ? handleUpdateService : handleCreateService} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="dayOfWeek">Dia da Semana *</Label>
                        <Input
                          id="dayOfWeek"
                          value={serviceForm.day_of_week}
                          onChange={(e) => setServiceForm({ ...serviceForm, day_of_week: e.target.value })}
                          placeholder="ex: Domingo, Segunda-feira..."
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="serviceName">Nome do Culto *</Label>
                        <Input
                          id="serviceName"
                          value={serviceForm.service_name}
                          onChange={(e) => setServiceForm({ ...serviceForm, service_name: e.target.value })}
                          placeholder="ex: Culto da Noite, Escola Bíblica..."
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="serviceTime">Horário *</Label>
                        <Input
                          id="serviceTime"
                          value={serviceForm.service_time}
                          onChange={(e) => setServiceForm({ ...serviceForm, service_time: e.target.value })}
                          placeholder="ex: 19h, 19h30..."
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" disabled={isSubmitting} variant="hero" className="flex-1">
                          {isSubmitting ? "Salvando..." : (editingService ? "Atualizar" : "Adicionar")}
                        </Button>
                        {editingService && (
                          <Button type="button" onClick={cancelEdit} variant="outline">
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* Services List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Horários de Culto ({services.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {services.length === 0 ? (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Nenhum horário cadastrado ainda.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {services.map((service) => (
                          <div key={service.id} className="border rounded-lg p-4 flex justify-between items-center">
                            <div>
                              <h3 className="font-semibold text-primary">{service.day_of_week}</h3>
                              <p className="text-sm text-muted-foreground">{service.service_name} - {service.service_time}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditService(service)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteService(service.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
}