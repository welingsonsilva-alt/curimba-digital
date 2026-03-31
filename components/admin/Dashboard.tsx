"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import FormularioPonto from "@/components/admin/FormularioPonto";

interface DashboardProps {
  acessos: number;
}

export default function Dashboard({ acessos }: DashboardProps) {
  const [pontos, setPontos] = useState<any[]>([]);
  const [totalSugestoes, setTotalSugestoes] = useState(0);
  const [distribuicao, setDistribuicao] = useState<any[]>([]);
  const [linhaSelecionada, setLinhaSelecionada] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pontoParaEditar, setPontoParaEditar] = useState<any>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    // 1. Carrega todos os pontos aprovados para a lógica de filtro
    const { data: pts } = await supabase
      .from("pontos")
      .select("*")
      .eq("aprovado", true)
      .order("titulo");

    // 2. Total de Sugestões Pendentes
    const { count: sugCount } = await supabase
      .from("sugestoes_pontos")
      .select("*", { count: 'exact', head: true });
    
    setTotalSugestoes(sugCount || 0);

    if (pts) {
      setPontos(pts);
      const contagem: any = {};
      pts.forEach(p => {
        contagem[p.linha] = (contagem[p.linha] || 0) + 1;
      });
      
      const listaFormatada = Object.keys(contagem).map(linha => ({
        nome: linha,
        total: contagem[linha]
      })).sort((a, b) => b.total - a.total);
      
      setDistribuicao(listaFormatada);
    }
    setLoading(false);
  }

  // Filtra os pontos com base na linha clicada
  const pontosDaLinha = linhaSelecionada 
    ? pontos.filter(p => p.linha === linhaSelecionada) 
    : [];

  if (loading) return <div className="text-[10px] font-black uppercase text-slate-500 animate-pulse">Sincronizando Painel Orun...</div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* 1. INDICADORES DE TOPO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/5 rounded-[32px] p-8 flex justify-between items-start group hover:border-indigo-500/20 transition-all">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Total Biblioteca</span>
            <h4 className="text-4xl font-black mt-2 tracking-tighter text-white">{pontos.length}</h4>
          </div>
          <div className="bg-indigo-600/10 p-3 rounded-xl text-indigo-400">📚</div>
        </div>
        
        <div className="bg-white/5 border border-white/5 rounded-[32px] p-8 flex justify-between items-start group hover:border-indigo-500/20 transition-all">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Acessos Hoje</span>
            <h4 className="text-4xl font-black mt-2 tracking-tighter text-white">{acessos}</h4>
          </div>
          <div className="bg-indigo-600/10 p-3 rounded-xl text-indigo-400">👥</div>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-[32px] p-8 flex justify-between items-start group hover:border-indigo-500/20 transition-all">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Novas Sugestões</span>
            <h4 className={`text-4xl font-black mt-2 tracking-tighter ${totalSugestoes > 0 ? 'text-indigo-400' : 'text-white'}`}>
              {totalSugestoes}
            </h4>
          </div>
          <div className="bg-indigo-600/10 p-3 rounded-xl text-indigo-400">✨</div>
        </div>
      </div>

      {/* 2. DISTRIBUIÇÃO POR LINHA (CLICÁVEL) */}
      <section className="bg-white/[0.02] border border-white/5 rounded-[40px] p-10">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">Distribuição por Linha</h3>
          {linhaSelecionada && (
            <button 
              onClick={() => setLinhaSelecionada(null)}
              className="text-[9px] font-black uppercase bg-indigo-600/10 text-indigo-400 px-4 py-2 rounded-lg border border-indigo-500/20 hover:bg-indigo-600 hover:text-white transition-all"
            >
              Limpar Filtro ✕
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
          {distribuicao.map((item) => (
            <button 
              key={item.nome} 
              onClick={() => setLinhaSelecionada(item.nome === linhaSelecionada ? null : item.nome)}
              className={`flex justify-between items-center py-3 px-4 rounded-2xl transition-all group border ${
                linhaSelecionada === item.nome ? 'bg-indigo-600/10 border-indigo-500/30' : 'border-transparent hover:bg-white/5'
              }`}
            >
              <span className={`text-xs font-bold uppercase ${linhaSelecionada === item.nome ? 'text-white' : 'text-slate-300'}`}>
                {item.nome}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-[11px] font-black text-indigo-400">{item.total}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 3. PONTOS FILTRADOS (ESTILO CARDS) */}
      {linhaSelecionada && (
        <section className="animate-in fade-in slide-in-from-top-4 duration-500">
          <h3 className="text-lg font-black uppercase italic tracking-tighter text-white mb-6">
            Pontos de <span className="text-indigo-500">{linhaSelecionada}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pontosDaLinha.map((p) => (
              <button 
                key={p.id}
                onClick={() => setPontoParaEditar(p)}
                className="bg-white/5 border border-white/5 p-6 rounded-[32px] text-left hover:border-indigo-500/40 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-bold uppercase text-[13px] text-slate-100 group-hover:text-indigo-400">{p.titulo}</h4>
                  <div className="flex gap-1.5">
                    {p.link_youtube && <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_red]"></div>}
                    {p.link_spotify && <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_green]"></div>}
                  </div>
                </div>
                <span className="text-[9px] font-black uppercase text-slate-500 group-hover:text-white">Editar fundamento →</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* MODAL DE EDIÇÃO */}
      {pontoParaEditar && (
        <FormularioPonto 
          pontoInicial={pontoParaEditar} 
          onClose={() => {
            setPontoParaEditar(null);
            carregarDados();
          }} 
        />
      )}

      <div className="flex justify-center opacity-20 pt-10">
        <img src="/logo.png" className="w-10 h-10 grayscale" />
      </div>

    </div>
  );
}