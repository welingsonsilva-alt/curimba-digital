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

export default function AdminPage() {
  const [abaAtiva, setAbaAtiva] = useState("dashboard");
  const [pontoParaEditar, setPontoParaEditar] = useState<any>(null);
  const [totalSugestoes, setTotalSugestoes] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 1. Função para buscar a contagem de sugestões pendentes
  const buscarContadorSugestoes = async () => {
    const { count, error } = await supabase
      .from("sugestoes_pontos")
      .select("*", { count: 'exact', head: true });
    
    if (!error) {
      setTotalSugestoes(count || 0);
    }
  };

  // 2. Proteção de Rota e Inicialização dos dados
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
      } else {
        await buscarContadorSugestoes();
        setLoading(false);
      }
    };

    checkAuth();

    const interval = setInterval(buscarContadorSugestoes, 60000);
    return () => clearInterval(interval);
  }, [router]);

  const abrirEdicao = (ponto: any) => {
    setPontoParaEditar(ponto);
    setAbaAtiva("editar");
  };

  // TELA DE CARREGAMENTO ATUALIZADA
  if (loading) {
    return (
      <div className="h-screen w-full bg-[#0B1120] flex flex-col items-center justify-center gap-6">
        {/* LOGO GRANDE NO LOADING */}
        <img 
          src="/logo.png" 
          alt="Curimba Digital" 
          className="w-32 h-32 object-contain animate-pulse" 
        />
        <div className="text-center">
          <p className="text-indigo-400 font-black tracking-[0.6em] text-[10px] uppercase">
            Iniciando Curimba Digital...
          </p>
          <p className="text-slate-600 text-[8px] font-bold uppercase tracking-widest mt-2">
            Painel Administrativo
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#0B1120] overflow-hidden p-4 font-sans">
      
      {/* SIDEBAR: Lembre-se de atualizar o componente Sidebar.tsx também! */}
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

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <main className="flex-1 h-full ml-4 bg-[#1E293B] rounded-[48px] shadow-3xl border border-slate-800/50 overflow-y-auto p-12 text-slate-100 relative">
        
        <div className="max-w-6xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* TÍTULO DA ABA ATIVA COM LOGO PEQUENA NO TOQUE DE PÁGINA */}
          <div className="flex items-center gap-4 mb-12 opacity-50">
             <img src="/logo.png" className="w-8 h-8 object-contain grayscale" />
             <span className="text-[10px] font-black tracking-[0.3em] uppercase">
               Curimba Digital / {abaAtiva}
             </span>
          </div>

          {abaAtiva === "dashboard" && <Dashboard />}
          {abaAtiva === "linhas" && <GerenciarLinhas />}
          {abaAtiva === "pontos" && <ListaPontos onEdit={abrirEdicao} />}
          {abaAtiva === "sugestoes" && <GerenciarSugestoes onEdit={abrirEdicao} />}
          
          {abaAtiva === "novo" && (
            <FormularioPonto 
              pontoInicial={null} 
              onClose={() => {
                setAbaAtiva("pontos");
                buscarContadorSugestoes();
              }} 
            />
          )}

          {abaAtiva === "editar" && (
            <FormularioPonto 
              pontoInicial={pontoParaEditar} 
              onClose={() => {
                const origem = pontoParaEditar?.criado_em ? "sugestoes" : "pontos";
                setAbaAtiva(origem);
                setPontoParaEditar(null);
                buscarContadorSugestoes();
              }} 
            />
          )}

        </div>
      </main>
    </div>
  );
}