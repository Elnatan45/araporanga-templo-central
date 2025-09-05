import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Shield, Users, MessageSquare, Plus, Clock, Edit, Trash2, Image, Star, User, BarChart3, Building2 } from "lucide-react";
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface ChurchInfo {
  id: string;
  church_name: string;
  church_description: string;
  location: string;
  phone: string;
  email: string;
  copyright_text: string;
}

interface Member {
  id: string;
  full_name: string;
  birth_date: string | null;
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
  imageFile: File | null;
}

interface ServiceSchedule {
  id: string;
  day_of_week: string;
  service_name: string;
  service_time: string;
  is_active: boolean;
  sort_order: number;
  leader: string | null;
}

interface ServiceForm {
  day_of_week: string;
  service_name: string;
  service_time: string;
  leader: string;
}

interface LectureRegistration {
  id: string;
  husband_name: string;
  husband_phone: string;
  husband_cpf: string;
  husband_email: string | null;
  wife_name: string;
  wife_phone: string;
  wife_cpf: string;
  wife_email: string | null;
  created_at: string;
}

interface ChurchImage {
  id: string;
  name: string;
  image_url: string;
  is_hero_image: boolean;
  created_at: string;
}

interface PastorInfo {
  id: string;
  name: string;
  image_url: string | null;
  image_position: string;
  is_active: boolean;
  created_at: string;
}

interface PastorForm {
  name: string;
  imageFile: File | null;
  imagePosition: string;
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [services, setServices] = useState<ServiceSchedule[]>([]);
  const [lectureRegistrations, setLectureRegistrations] = useState<LectureRegistration[]>([]);
  const [churchImages, setChurchImages] = useState<ChurchImage[]>([]);
  const [pastorInfo, setPastorInfo] = useState<PastorInfo | null>(null);
  const [churchInfo, setChurchInfo] = useState<ChurchInfo | null>(null);
  const [lectureEnabled, setLectureEnabled] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [postForm, setPostForm] = useState<PostForm>({
    title: "",
    content: "",
    imageFile: null,
  });
  const [serviceForm, setServiceForm] = useState<ServiceForm>({
    day_of_week: "",
    service_name: "",
    service_time: "",
    leader: "",
  });
  const [pastorForm, setPastorForm] = useState<PastorForm>({
    name: "",
    imageFile: null,
    imagePosition: "center center",
  });
  const [selectedCongregation, setSelectedCongregation] = useState<string>("all");
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [editingService, setEditingService] = useState<ServiceSchedule | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [adminPassword, setAdminPassword] = useState(() => {
    return localStorage.getItem('adminPassword') || 'Araporanga';
  });
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      fetchMembers();
      fetchPosts();
      fetchServices();
      fetchLectureRegistrations();
      fetchLectureConfig();
      fetchChurchImages();
      fetchPastorInfo();
      fetchChurchInfo();
    }
  }, [isAuthenticated]);

  // Filter members by congregation
  useEffect(() => {
    if (selectedCongregation === "all") {
      setFilteredMembers(members);
    } else {
      setFilteredMembers(members.filter(member => member.congregation === selectedCongregation));
    }
  }, [members, selectedCongregation]);

  // Calculate statistics
  const getStatistics = () => {
    const stats = {
      total: filteredMembers.length,
      male: filteredMembers.filter(m => m.gender === 'masculino').length,
      female: filteredMembers.filter(m => m.gender === 'feminino').length,
      averageAge: 0,
      ageGroups: {
        '0-17': 0,
        '18-35': 0,
        '36-60': 0,
        '61+': 0
      }
    };

    if (filteredMembers.length > 0) {
      const ages = filteredMembers
        .filter(m => m.birth_date)
        .map(m => {
          const today = new Date();
          const birthDate = new Date(m.birth_date + 'T12:00:00');
          return today.getFullYear() - birthDate.getFullYear();
        });

      if (ages.length > 0) {
        stats.averageAge = Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length);
        
        ages.forEach(age => {
          if (age <= 17) stats.ageGroups['0-17']++;
          else if (age <= 35) stats.ageGroups['18-35']++;
          else if (age <= 60) stats.ageGroups['36-60']++;
          else stats.ageGroups['61+']++;
        });
      }
    }

    return stats;
  };

  const congregationStats = Object.keys(congregationLabels).map(key => {
    const congregationMembers = members.filter(m => m.congregation === key);
    const male = congregationMembers.filter(m => m.gender === 'masculino').length;
    const female = congregationMembers.filter(m => m.gender === 'feminino').length;
    
    const ages = congregationMembers
      .filter(m => m.birth_date)
      .map(m => {
        const today = new Date();
        const birthDate = new Date(m.birth_date + 'T12:00:00');
        return today.getFullYear() - birthDate.getFullYear();
      });
    
    const averageAge = ages.length > 0 
      ? Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length)
      : 0;

    return {
      congregation: key,
      name: congregationLabels[key as keyof typeof congregationLabels],
      total: congregationMembers.length,
      male,
      female,
      averageAge
    };
  });

  const stats = getStatistics();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loginData.username === "admin" && loginData.password === adminPassword) {
      setIsAuthenticated(true);
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo à área administrativa.",
      });
    } else {
      toast({
        title: "Erro no login",
        description: "Usuário ou senha incorretos.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginData({ username: "", password: "" });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.currentPassword !== adminPassword) {
      toast({
        title: "Erro",
        description: "Senha atual incorreta.",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Erro",
        description: "A confirmação da senha não confere.",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 4) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 4 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setAdminPassword(passwordForm.newPassword);
    localStorage.setItem('adminPassword', passwordForm.newPassword);
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    
    toast({
      title: "Senha alterada!",
      description: "Sua senha foi alterada com sucesso.",
    });
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
      let imageUrl = null;

      // Upload image if provided
      if (postForm.imageFile) {
        const fileExt = postForm.imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `posts/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('posts')
          .upload(filePath, postForm.imageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('posts')
          .getPublicUrl(filePath);

        imageUrl = data.publicUrl;
      }

      const { error } = await supabase
        .from('posts')
        .insert({
          title: postForm.title,
          content: postForm.content || null,
          image_url: imageUrl,
          author_id: null,
        });

      if (error) throw error;

      toast({
        title: "Aviso publicado!",
        description: "O aviso foi criado com sucesso.",
      });

      setPostForm({ title: "", content: "", imageFile: null });
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

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Tem certeza que deseja excluir este aviso?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Aviso excluído!",
        description: "O aviso foi removido com sucesso.",
      });

      fetchPosts();
    } catch (error) {
      console.error('Erro ao excluir post:', error);
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir o aviso. Tente novamente.",
        variant: "destructive",
      });
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
          leader: serviceForm.leader || null,
          sort_order: services.length + 1,
        });

      if (error) throw error;

      toast({
        title: "Horário adicionado!",
        description: "O horário de culto foi criado com sucesso.",
      });

      setServiceForm({ day_of_week: "", service_name: "", service_time: "", leader: "" });
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
          leader: serviceForm.leader || null,
        })
        .eq('id', editingService.id);

      if (error) throw error;

      toast({
        title: "Horário atualizado!",
        description: "O horário de culto foi atualizado com sucesso.",
      });

      setServiceForm({ day_of_week: "", service_name: "", service_time: "", leader: "" });
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
      leader: service.leader || "",
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
    setServiceForm({ day_of_week: "", service_name: "", service_time: "", leader: "" });
  };

  const fetchLectureRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('lecture_registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLectureRegistrations(data || []);
    } catch (error) {
      console.error('Erro ao carregar inscrições:', error);
    }
  };

  const fetchLectureConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('app_config')
        .select('value')
        .eq('key', 'lecture_enabled')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setLectureEnabled(data?.value === 'true');
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    }
  };

  const handleDeleteLectureRegistration = async (registrationId: string) => {
    try {
      const { error } = await supabase
        .from('lecture_registrations')
        .delete()
        .eq('id', registrationId);

      if (error) throw error;

      toast({
        title: "Inscrição removida!",
        description: "A inscrição foi removida com sucesso.",
      });

      fetchLectureRegistrations();
    } catch (error) {
      console.error('Erro ao remover inscrição:', error);
      toast({
        title: "Erro ao remover",
        description: "Ocorreu um erro ao remover a inscrição. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleToggleLectureFeature = async () => {
    try {
      const newValue = !lectureEnabled;
      const { error } = await supabase
        .from('app_config')
        .upsert({ 
          key: 'lecture_enabled', 
          value: newValue.toString() 
        }, { 
          onConflict: 'key' 
        });

      if (error) throw error;

      setLectureEnabled(newValue);
      toast({
        title: newValue ? "Área da palestra ativada!" : "Área da palestra desativada!",
        description: newValue 
          ? "A área de inscrição para palestra foi ativada." 
          : "A área de inscrição para palestra foi desativada.",
      });
    } catch (error) {
      console.error('Erro ao alterar configuração:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao alterar a configuração. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Membro removido!",
        description: "O cadastro do membro foi removido com sucesso.",
      });

      fetchMembers();
    } catch (error) {
      console.error('Erro ao remover membro:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao alterar a configuração. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const fetchChurchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('church_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChurchImages(data || []);
    } catch (error) {
      console.error('Erro ao carregar imagens:', error);
    }
  };

  const fetchPastorInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('pastor_info')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Erro ao carregar informações do pastor:', error);
        return;
      }

      if (data) {
        setPastorInfo(data);
      }
    } catch (error) {
      console.error('Erro ao carregar informações do pastor:', error);
    }
  };

  const fetchChurchInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('church_info')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Erro ao carregar informações da igreja:', error);
        return;
      }

      if (data) {
        setChurchInfo(data);
      }
    } catch (error) {
      console.error('Erro ao carregar informações da igreja:', error);
    }
  };

  const handleChurchInfoUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!churchInfo) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('church_info')
        .update({
          church_name: churchInfo.church_name,
          church_description: churchInfo.church_description,
          location: churchInfo.location,
          phone: churchInfo.phone,
          email: churchInfo.email,
          copyright_text: churchInfo.copyright_text,
        })
        .eq('id', churchInfo.id);

      if (error) throw error;

      toast({
        title: "Informações salvas!",
        description: "As informações da igreja foram atualizadas com sucesso.",
      });

      fetchChurchInfo();
    } catch (error) {
      console.error('Erro ao salvar informações da igreja:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as informações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (file: File, name: string) => {
    setUploadingImage(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `church-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('church-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('church-images')
        .getPublicUrl(filePath);

      const { error } = await supabase
        .from('church_images')
        .insert({
          name,
          image_url: data.publicUrl,
          is_hero_image: false,
        });

      if (error) throw error;

      toast({
        title: "Imagem enviada!",
        description: "A imagem foi adicionada com sucesso.",
      });

      fetchChurchImages();
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
      toast({
        title: "Erro ao enviar",
        description: "Ocorreu um erro ao enviar a imagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSetHeroImage = async (imageId: string) => {
    try {
      // Remove hero status from all images
      await supabase
        .from('church_images')
        .update({ is_hero_image: false })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      // Set new hero image
      const { error } = await supabase
        .from('church_images')
        .update({ is_hero_image: true })
        .eq('id', imageId);

      if (error) throw error;

      toast({
        title: "Imagem principal definida!",
        description: "A imagem da tela inicial foi atualizada.",
      });

      fetchChurchImages();
    } catch (error) {
      console.error('Erro ao definir imagem principal:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao definir a imagem principal.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from('church_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      toast({
        title: "Imagem removida!",
        description: "A imagem foi removida com sucesso.",
      });

      fetchChurchImages();
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      toast({
        title: "Erro ao remover",
        description: "Ocorreu um erro ao remover a imagem. Tente novamente.",
        variant: "destructive",
      });
    }
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
                      value={loginData.username}
                      onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                      placeholder="admin"
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
                      placeholder="admin"
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
            <TabsList className="grid w-full grid-cols-9">
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
              <TabsTrigger value="pastor" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Pastor
              </TabsTrigger>
              <TabsTrigger value="lecture" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Palestra
              </TabsTrigger>
              <TabsTrigger value="images" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Imagens
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Relatórios
              </TabsTrigger>
              <TabsTrigger value="church-info" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Igreja
              </TabsTrigger>
              <TabsTrigger value="password" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Senha
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
                              <TableHead>Data de Nascimento</TableHead>
                              <TableHead>Gênero</TableHead>
                              <TableHead>Estado Civil</TableHead>
                              <TableHead>Congregação</TableHead>
                              <TableHead>Data de Cadastro</TableHead>
                              <TableHead>Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                         <TableBody>
                            {members.map((member) => (
                              <TableRow key={member.id}>
                                <TableCell className="font-medium">{member.full_name}</TableCell>
                                <TableCell>
                                  {member.birth_date 
                                    ? format(new Date(member.birth_date + 'T12:00:00'), "dd/MM/yyyy", { locale: ptBR })
                                    : "Não informado"
                                  }
                                </TableCell>
                                <TableCell>{genderLabels[member.gender as keyof typeof genderLabels]}</TableCell>
                                <TableCell>{civilStatusLabels[member.civil_status as keyof typeof civilStatusLabels]}</TableCell>
                                <TableCell>{congregationLabels[member.congregation as keyof typeof congregationLabels]}</TableCell>
                                <TableCell>
                                  {format(new Date(member.created_at), "dd/MM/yyyy", { locale: ptBR })}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteMember(member.id)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
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
                         <Label htmlFor="imageFile">Imagem do Aviso</Label>
                         <Input
                           id="imageFile"
                           type="file"
                           accept="image/*"
                           onChange={(e) => {
                             const file = e.target.files?.[0] || null;
                             setPostForm({ ...postForm, imageFile: file });
                           }}
                         />
                         <p className="text-xs text-muted-foreground">
                           Selecione uma imagem para ilustrar o aviso (opcional)
                         </p>
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
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-primary">{post.title}</h3>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeletePost(post.id)}
                                className="text-destructive hover:text-destructive h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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
                      <div className="space-y-2">
                        <Label htmlFor="serviceLeader">Dirigente</Label>
                        <Input
                          id="serviceLeader"
                          value={serviceForm.leader}
                          onChange={(e) => setServiceForm({ ...serviceForm, leader: e.target.value })}
                          placeholder="ex: Pastor João, Pr. Maria..."
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
                              {service.leader && (
                                <p className="text-xs text-muted-foreground">Dirigente: {service.leader}</p>
                              )}
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

            <TabsContent value="pastor">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pastor Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      Informações do Pastor Titular
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      
                      if (!pastorForm.name.trim()) {
                        toast({
                          title: "Nome obrigatório",
                          description: "Por favor, insira o nome do pastor.",
                          variant: "destructive",
                        });
                        return;
                      }

                      setIsSubmitting(true);

                      try {
                        let imageUrl = null;

                        // Upload image if provided
                        if (pastorForm.imageFile) {
                          const fileExt = pastorForm.imageFile.name.split('.').pop();
                          const fileName = `pastor-${Math.random()}.${fileExt}`;
                          const filePath = `church-images/${fileName}`;

                          const { error: uploadError } = await supabase.storage
                            .from('church-images')
                            .upload(filePath, pastorForm.imageFile);

                          if (uploadError) throw uploadError;

                          const { data } = supabase.storage
                            .from('church-images')
                            .getPublicUrl(filePath);

                          imageUrl = data.publicUrl;
                        }

                        // Primeiro, desativar todos os registros anteriores
                        const { error: deactivateError } = await supabase
                          .from('pastor_info')
                          .update({ is_active: false })
                          .eq('is_active', true);

                        if (deactivateError) {
                          console.error('Erro ao desativar registros anteriores:', deactivateError);
                        }

                        // Insert new pastor info
                        const { error } = await supabase
                          .from('pastor_info')
                          .insert({
                            name: pastorForm.name,
                            image_url: imageUrl || (pastorInfo?.image_url || null),
                            image_position: pastorForm.imagePosition,
                            is_active: true,
                          });

                        if (error) throw error;

                        toast({
                          title: "Informações salvas!",
                          description: "As informações do pastor foram atualizadas com sucesso.",
                        });

                        setPastorForm({ name: "", imageFile: null, imagePosition: "center center" });
                        fetchPastorInfo();
                      } catch (error) {
                        console.error('Erro ao salvar informações do pastor:', error);
                        toast({
                          title: "Erro ao salvar",
                          description: "Ocorreu um erro ao salvar as informações. Tente novamente.",
                          variant: "destructive",
                        });
                      } finally {
                        setIsSubmitting(false);
                      }
                    }} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="pastorName">Nome do Pastor *</Label>
                        <Input
                          id="pastorName"
                          value={pastorForm.name}
                          onChange={(e) => setPastorForm({ ...pastorForm, name: e.target.value })}
                          placeholder="ex: Pr. João Silva"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pastorImage">Foto do Pastor</Label>
                        <Input
                          id="pastorImage"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setPastorForm({ ...pastorForm, imageFile: file });
                          }}
                        />
                        <p className="text-xs text-muted-foreground">
                          Selecione uma foto do pastor (opcional)
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="imagePosition">Posicionamento da Imagem</Label>
                        <Select 
                          value={pastorForm.imagePosition} 
                          onValueChange={(value) => setPastorForm({ ...pastorForm, imagePosition: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o posicionamento" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="center center">Centro</SelectItem>
                            <SelectItem value="top center">Topo Centro</SelectItem>
                            <SelectItem value="bottom center">Base Centro</SelectItem>
                            <SelectItem value="center left">Centro Esquerda</SelectItem>
                            <SelectItem value="center right">Centro Direita</SelectItem>
                            <SelectItem value="top left">Topo Esquerda</SelectItem>
                            <SelectItem value="top right">Topo Direita</SelectItem>
                            <SelectItem value="bottom left">Base Esquerda</SelectItem>
                            <SelectItem value="bottom right">Base Direita</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Ajuste como a foto será posicionada no círculo
                        </p>
                      </div>
                      <Button type="submit" disabled={isSubmitting} variant="hero" className="w-full">
                        {isSubmitting ? "Salvando..." : "Salvar Informações"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Current Pastor Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pastor Atual</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {pastorInfo ? (
                      <div className="text-center space-y-4">
                        {pastorInfo.image_url ? (
                          <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-primary/20">
                            <img 
                              src={pastorInfo.image_url} 
                              alt={`Foto do ${pastorInfo.name}`}
                              className="w-full h-full object-cover"
                              style={{ objectPosition: pastorInfo.image_position || 'center center' }}
                            />
                          </div>
                        ) : (
                          <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary to-church-blue-medium flex items-center justify-center border-4 border-primary/20">
                            <Users className="w-16 h-16 text-white" />
                          </div>
                        )}
                        
                        <div>
                          <h3 className="text-xl font-bold text-primary mb-2">
                            {pastorInfo.name}
                          </h3>
                          <p className="text-muted-foreground">
                            Pastor Titular
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Atualizado em {format(new Date(pastorInfo.created_at), "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              setPastorForm({ 
                                name: pastorInfo.name, 
                                imageFile: null,
                                imagePosition: pastorInfo.image_position || "center center"
                              });
                            }}
                            variant="outline"
                            className="flex-1"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                          <Button
                            onClick={async () => {
                              if (!confirm("Tem certeza que deseja excluir as informações do pastor?")) {
                                return;
                              }

                              try {
                                const { error } = await supabase
                                  .from('pastor_info')
                                  .update({ is_active: false })
                                  .eq('id', pastorInfo.id);

                                if (error) throw error;

                                toast({
                                  title: "Pastor excluído!",
                                  description: "As informações do pastor foram removidas com sucesso.",
                                });

                                fetchPastorInfo();
                              } catch (error) {
                                console.error('Erro ao excluir pastor:', error);
                                toast({
                                  title: "Erro ao excluir",
                                  description: "Ocorreu um erro ao excluir as informações. Tente novamente.",
                                  variant: "destructive",
                                });
                              }
                            }}
                            variant="destructive"
                            size="icon"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Nenhuma informação do pastor cadastrada ainda.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="lecture">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Inscrições Palestra de Casais ({lectureRegistrations.length})</CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {lectureEnabled ? "Ativa" : "Inativa"}
                      </span>
                      <Button 
                        onClick={handleToggleLectureFeature}
                        variant={lectureEnabled ? "destructive" : "default"}
                        size="sm"
                      >
                        {lectureEnabled ? "Desativar Área" : "Ativar Área"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {lectureRegistrations.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                        Nenhuma inscrição encontrada
                      </h3>
                      <p className="text-muted-foreground">
                        As inscrições aparecerão aqui quando os casais se cadastrarem.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {lectureRegistrations.map((registration) => (
                        <Card key={registration.id} className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                              <div>
                                <h4 className="font-semibold text-primary mb-2">Dados do Esposo</h4>
                                <div className="space-y-1 text-sm">
                                  <p><strong>Nome:</strong> {registration.husband_name}</p>
                                  <p><strong>Telefone:</strong> {registration.husband_phone}</p>
                                  <p><strong>CPF:</strong> {registration.husband_cpf}</p>
                                  {registration.husband_email && (
                                    <p><strong>Email:</strong> {registration.husband_email}</p>
                                  )}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold text-primary mb-2">Dados da Esposa</h4>
                                <div className="space-y-1 text-sm">
                                  <p><strong>Nome:</strong> {registration.wife_name}</p>
                                  <p><strong>Telefone:</strong> {registration.wife_phone}</p>
                                  <p><strong>CPF:</strong> {registration.wife_cpf}</p>
                                  {registration.wife_email && (
                                    <p><strong>Email:</strong> {registration.wife_email}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(registration.created_at), "dd/MM/yyyy", { locale: ptBR })}
                              </span>
                              <Button
                                onClick={() => handleDeleteLectureRegistration(registration.id)}
                                variant="destructive"
                                size="sm"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="images">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      Adicionar Nova Imagem
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const file = formData.get('image') as File;
                      const name = formData.get('name') as string;
                      if (file && name) {
                        handleImageUpload(file, name);
                        e.currentTarget.reset();
                      }
                    }} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="imageName">Nome da Imagem *</Label>
                        <Input
                          id="imageName"
                          name="name"
                          placeholder="ex: Fachada da Igreja, Interior..."
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="imageFile">Arquivo da Imagem *</Label>
                        <Input
                          id="imageFile"
                          name="image"
                          type="file"
                          accept="image/*"
                          required
                        />
                      </div>
                      <Button type="submit" disabled={uploadingImage} variant="hero" className="w-full">
                        {uploadingImage ? "Enviando..." : "Adicionar Imagem"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Images Gallery */}
                <Card>
                  <CardHeader>
                    <CardTitle>Imagens da Igreja ({churchImages.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {churchImages.length === 0 ? (
                      <div className="text-center py-8">
                        <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Nenhuma imagem adicionada ainda.</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {churchImages.map((image) => (
                          <div key={image.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex gap-4 flex-1">
                                <img 
                                  src={image.image_url} 
                                  alt={image.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                  <h3 className="font-semibold text-primary">{image.name}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {format(new Date(image.created_at), "dd/MM/yyyy", { locale: ptBR })}
                                  </p>
                                  {image.is_hero_image && (
                                    <span className="inline-flex items-center gap-1 text-xs bg-church-gold-light text-white px-2 py-1 rounded-full mt-1">
                                      <Star className="h-3 w-3" />
                                      Imagem Principal
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {!image.is_hero_image && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleSetHeroImage(image.id)}
                                    title="Definir como imagem principal"
                                  >
                                    <Star className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteImage(image.id)}
                                  className="text-destructive hover:text-destructive"
                                  title="Remover imagem"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reports">
              <div className="space-y-8">
                {/* Filter by Congregation */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Filtros de Relatório
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="congregation-filter">Selecionar Congregação</Label>
                        <Select value={selectedCongregation} onValueChange={setSelectedCongregation}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma congregação" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas as Congregações</SelectItem>
                            {Object.entries(congregationLabels).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* General Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2">
                        <Users className="h-8 w-8 text-primary" />
                        <div>
                          <p className="text-2xl font-bold">{stats.total}</p>
                          <p className="text-sm text-muted-foreground">Total de Membros</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2">
                        <User className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="text-2xl font-bold">{stats.male}</p>
                          <p className="text-sm text-muted-foreground">Homens</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2">
                        <User className="h-8 w-8 text-pink-500" />
                        <div>
                          <p className="text-2xl font-bold">{stats.female}</p>
                          <p className="text-sm text-muted-foreground">Mulheres</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-8 w-8 text-green-500" />
                        <div>
                          <p className="text-2xl font-bold">{stats.averageAge}</p>
                          <p className="text-sm text-muted-foreground">Idade Média</p>
                        </div>
                      </div>  
                    </CardContent>
                  </Card>
                </div>

                {/* Age Groups */}
                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição por Faixa Etária</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(stats.ageGroups).map(([range, count]) => (
                        <div key={range} className="text-center p-4 border rounded-lg">
                          <p className="text-2xl font-bold text-primary">{count}</p>
                          <p className="text-sm text-muted-foreground">{range} anos</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Congregation Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Estatísticas por Congregação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Congregação</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Homens</TableHead>
                            <TableHead>Mulheres</TableHead>
                            <TableHead>Idade Média</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {congregationStats.map((stat) => (
                            <TableRow key={stat.congregation}>
                              <TableCell className="font-medium">{stat.name}</TableCell>
                              <TableCell>{stat.total}</TableCell>
                              <TableCell>{stat.male}</TableCell>
                              <TableCell>{stat.female}</TableCell>
                              <TableCell>{stat.averageAge} anos</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                {/* Members List */}
                {selectedCongregation !== "all" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        Membros da {congregationLabels[selectedCongregation as keyof typeof congregationLabels]} ({filteredMembers.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {filteredMembers.length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">Nenhum membro encontrado para esta congregação.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Data de Nascimento</TableHead>
                                <TableHead>Gênero</TableHead>
                                <TableHead>Estado Civil</TableHead>
                                <TableHead>Data de Cadastro</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredMembers.map((member) => (
                                <TableRow key={member.id}>
                                  <TableCell className="font-medium">{member.full_name}</TableCell>
                                  <TableCell>
                                    {member.birth_date 
                                      ? format(new Date(member.birth_date + 'T12:00:00'), "dd/MM/yyyy", { locale: ptBR })
                                      : "Não informado"
                                    }
                                  </TableCell>
                                  <TableCell>{genderLabels[member.gender as keyof typeof genderLabels]}</TableCell>
                                  <TableCell>{civilStatusLabels[member.civil_status as keyof typeof civilStatusLabels]}</TableCell>
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
                )}
              </div>
            </TabsContent>

            <TabsContent value="church-info">
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Informações da Igreja
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChurchInfoUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="church_name">Nome da Igreja *</Label>
                      <Input
                        id="church_name"
                        value={churchInfo?.church_name || ''}
                        onChange={(e) => setChurchInfo(prev => prev ? { ...prev, church_name: e.target.value } : null)}
                        placeholder="Ex: AD Templo Central"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="church_description">Descrição *</Label>
                      <Textarea
                        id="church_description"
                        value={churchInfo?.church_description || ''}
                        onChange={(e) => setChurchInfo(prev => prev ? { ...prev, church_description: e.target.value } : null)}
                        placeholder="Ex: Assembleia de Deus Templo Central - Araporanga. Uma comunidade de fé, esperança e amor."
                        required
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Localização *</Label>
                      <Input
                        id="location"
                        value={churchInfo?.location || ''}
                        onChange={(e) => setChurchInfo(prev => prev ? { ...prev, location: e.target.value } : null)}
                        placeholder="Ex: Araporanga - CE"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone *</Label>
                      <Input
                        id="phone"
                        value={churchInfo?.phone || ''}
                        onChange={(e) => setChurchInfo(prev => prev ? { ...prev, phone: e.target.value } : null)}
                        placeholder="Ex: (85) 99999-9999"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={churchInfo?.email || ''}
                        onChange={(e) => setChurchInfo(prev => prev ? { ...prev, email: e.target.value } : null)}
                        placeholder="Ex: contato@igreja.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="copyright_text">Texto de Copyright *</Label>
                      <Input
                        id="copyright_text"
                        value={churchInfo?.copyright_text || ''}
                        onChange={(e) => setChurchInfo(prev => prev ? { ...prev, copyright_text: e.target.value } : null)}
                        placeholder="Ex: © 2024 Assembleia de Deus Templo Central - Araporanga. Todos os direitos reservados."
                        required
                      />
                    </div>
                    <Button type="submit" disabled={isSubmitting} variant="hero" className="w-full">
                      Salvar Informações
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="password">
              <Card className="max-w-md mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Alterar Senha
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Senha Atual *</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        placeholder="Digite sua senha atual"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nova Senha *</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        placeholder="Digite a nova senha"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Nova Senha *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        placeholder="Confirme a nova senha"
                        required
                      />
                    </div>
                    <Button type="submit" disabled={isSubmitting} variant="hero" className="w-full">
                      Alterar Senha
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
}