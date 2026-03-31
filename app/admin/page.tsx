"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// Importação dos Componentes Administrativos
import Sidebar from "@/components/admin/Sidebar";
import Dashboard from "@/components/admin/Dashboard";
import GerenciarLinhas from "@/components/admin/GerenciarLinhas";
import ListaPontos from "@/components/admin/ListaPontos";
import FormularioPonto from "@/components/admin/FormularioPonto";
import GerenciarSugestoes from "@/components/admin/GerenciarSugestoes";
import ListaExtras from "@/components/admin/ListaExtras"; 

export default function AdminPage() {
  const [abaAtiva, setAbaAtiva] = useState("dashboard");
  const [pontoParaEditar, setPontoParaEditar] = useState<any>(null);
  const [totalSugestoes, setTotalSugestoes] = useState(0);
  const [acessosHoje, setAcessosHoje] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 1. Função para carregar contadores e dados iniciais
  const carregarDadosAdmin = async () => {
    try {
      const hoje = new Date().toLocaleDateString('en-CA');
      
      // Busca contagem de sugestões de PONTOS (Letras)
      const { count } = await supabase
        .from("sugestoes_pontos")
        .select("*", { count: 'exact', head: true });
      
      setTotalSugestoes(count || 0);

      // Busca valor atual do contador de acessos
      const { data: acesso } = await supabase
        .from("acessos")
        .select("contador")
        .eq("data", hoje)
        .single();
      
      if (acesso) setAcessosHoje(acesso.contador);

    } catch (err) {
      console.error("Erro ao carregar dados admin:", err);
    }
  };

  // 2. Proteção de Rota
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
      } else {
        await carregarDadosAdmin();
        setLoading(false);
      }
    };

    checkAuth();
    // Atualiza contadores a cada 1 minuto
    const interval = setInterval(carregarDadosAdmin, 60000);
    return () => clearInterval(interval);
  }, [router]);

  // Função para abrir o modal de edição (Biblioteca ou Sugestões)
  const abrirEdicao = (ponto: any) => {
    setPontoParaEditar(ponto);
    setAbaAtiva("editar");
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#0B1120] flex flex-col items-center justify-center gap-6">
        <img src="/logo.png" className="w-32 h-32 object-contain animate-pulse" />
        <p className="text-indigo-400 font-black tracking-[0.6em] text-[10px] uppercase">Iniciando Curimba Digital...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#0B1120] overflow-hidden p-4 font-sans text-slate-100">
      
      {/* SIDEBAR FIXA */}
      <div className="w-72 h-full flex-shrink-0">
        <Sidebar 
          abaAtiva={abaAtiva} 
          setAbaAtiva={(aba: string) => {
            setAbaAtiva(aba);
            setPontoParaEditar(null);
          }} 
          notificacoes={totalSugestoes} 
        />
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 h-full ml-4 bg-[#1E293B] rounded-[48px] shadow-3xl border border-white/5 overflow-y-auto p-12 relative">
        <div className="max-w-6xl mx-auto pb-24">
          
          {/* INDICADOR DE CAMINHO */}
          <div className="flex items-center gap-4 mb-12 opacity-30">
             <img src="/logo.png" className="w-6 h-6 grayscale" />
             <span className="text-[10px] font-black tracking-[0.3em] uppercase">
               Curimba Digital / {abaAtiva}
             </span>
          </div>

          {/* RENDERIZAÇÃO DAS ABAS */}
          {abaAtiva === "dashboard" && <Dashboard acessos={acessosHoje} />}
          
          {abaAtiva === "linhas" && <GerenciarLinhas />}
          
          {abaAtiva === "pontos" && <ListaPontos onEdit={abrirEdicao} />}
          
          {abaAtiva === "sugestoes" && <GerenciarSugestoes onEdit={abrirEdicao} />}
          
          {abaAtiva === "extras" && <ListaExtras />}

          {/* FORMULÁRIO DE CADASTRO (NOVO) */}
          {abaAtiva === "novo" && (
            <FormularioPonto 
              pontoInicial={null} 
              onClose={() => {
                setAbaAtiva("pontos");
                carregarDadosAdmin();
              }} 
            />
          )}

          {/* FORMULÁRIO DE EDIÇÃO (EXISTENTE OU SUGESTÃO) */}
          {abaAtiva === "editar" && (
            <FormularioPonto 
              pontoInicial={pontoParaEditar} 
              onClose={() => {
                // Se o ponto tinha data de criação, ele era uma sugestão, então volta para a aba sugestões
                const eraSugestao = !!(pontoParaEditar?.criado_em || pontoParaEditar?.created_at);
                setAbaAtiva(eraSugestao ? "sugestoes" : "pontos");
                setPontoParaEditar(null);
                carregarDadosAdmin();
              }} 
            />
          )}

        </div>
      </main>
    </div>
  );
}