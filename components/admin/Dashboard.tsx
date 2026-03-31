"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import FormularioPonto from "@/components/admin/FormularioPonto";

export default function Dashboard() {
  const [pontos, setPontos] = useState<any[]>([]);
  const [acessosHoje, setAcessosHoje] = useState(0);
  const [dadosLista, setDadosLista] = useState<any[]>([]);
  const [linhaSelecionada, setLinhaSelecionada] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estado para controlar qual ponto abrir para visualização/edição
  const [pontoParaVer, setPontoParaVer] = useState<any>(null);

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  async function carregarEstatisticas() {
    const hoje = new Date().toISOString().split('T')[0];
    const { data: acesso } = await supabase.from("acessos").select("contador").eq("data", hoje).single();
    setAcessosHoje(acesso?.contador || 0);

    const { data: pts } = await supabase.from("pontos").select("*").order("titulo");
    
    if (pts) {
      setPontos(pts);
      const contagem: any = {};
      pts.forEach(p => {
        contagem[p.linha] = (contagem[p.linha] || 0) + 1;
      });
      
      const formatado = Object.keys(contagem).map(linha => ({
        nome: linha,
        total: contagem[linha]
      })).sort((a, b) => b.total - a.total);
      
      setDadosLista(formatado);
    }
    setLoading(false);
  }

  const pontosDaLinha = linhaSelecionada 
    ? pontos.filter(p => p.linha === linhaSelecionada) 
    : [];

  if (loading) return <div className="animate-pulse text-slate-500 font-black uppercase text-[10px]">Carregando Dashboard...</div>;

  return (
    <div className="space-y-10">
      
      {/* GRID DE CARDS SUPERIORES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 rounded-[32px] p-8 shadow-xl shadow-indigo-600/20">
          <span className="text-[10px] font-black uppercase opacity-60 tracking-widest">Total de Pontos</span>
          <h4 className="text-5xl font-black mt-2 tracking-tighter">{pontos.length}</h4>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-[32px] p-8">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Acessos Hoje</span>
          <h4 className="text-5xl font-black mt-2 tracking-tighter text-white">{acessosHoje}</h4>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[32px] p-8">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Linhas Ativas</span>
          <h4 className="text-5xl font-black mt-2 tracking-tighter text-indigo-400">{dadosLista.length}</h4>
        </div>
      </div>

      {/* LISTA DE PONTOS POR LINHA (INTERATIVA) */}
      <section className="bg-white/5 border border-white/10 rounded-[40px] p-10 shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Distribuição por Linha</h3>
          {linhaSelecionada && (
            <button 
              onClick={() => setLinhaSelecionada(null)}
              className="text-[9px] bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-full font-black uppercase transition-all border border-indigo-500/20"
            >
              Limpar Filtro
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {dadosLista.map((item) => (
            <button 
              key={item.nome}
              onClick={() => setLinhaSelecionada(item.name === linhaSelecionada ? null : item.nome)}
              className={`flex justify-between items-center p-5 rounded-[20px] border transition-all ${
                linhaSelecionada === item.name 
                ? 'bg-indigo-600 border-indigo-400 shadow-lg shadow-indigo-600/20 scale-[1.02]' 
                : 'bg-slate-900/50 border-white/5 hover:border-white/20'
              }`}
            >
              <span className="text-[11px] font-black uppercase tracking-tight">{item.nome}</span>
              <span className="bg-black/30 px-3 py-1 rounded-lg text-[10px] font-black">{item.total}</span>
            </button>
          ))}
        </div>
      </section>

      {/* RESULTADO DO FILTRO (PONTOS DA LINHA SELECIONADA) */}
      {linhaSelecionada && (
        <section className="animate-in fade-in slide-in-from-top-4 duration-500 pb-20">
          <div className="flex items-center gap-6 mb-8">
            <h3 className="text-xl font-black uppercase italic tracking-tighter text-indigo-500">
              {linhaSelecionada} <span className="text-white/10 text-xs ml-2">({pontosDaLinha.length} resultados)</span>
            </h3>
            <div className="h-px flex-1 bg-white/5"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pontosDaLinha.map((p) => (
              <button 
                key={p.id}
                onClick={() => setPontoParaVer(p)} // Ação de clique para abrir o modal
                className="bg-white/[0.03] border border-white/5 p-5 rounded-2xl flex justify-between items-center hover:bg-white/[0.07] hover:border-indigo-500/30 transition-all text-left group"
              >
                <span className="font-bold uppercase text-xs tracking-tight group-hover:text-indigo-400">{p.titulo}</span>
                <div className="flex gap-2">
                   {p.link_youtube && <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_red]"></div>}
                   {p.link_spotify && <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_green]"></div>}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* MODAL DE VISUALIZAÇÃO / EDIÇÃO */}
      {pontoParaVer && (
        <FormularioPonto 
          pontoInicial={pontoParaVer} 
          onClose={() => {
            setPontoParaVer(null);
            carregarEstatisticas(); // Atualiza dados se houver edição/exclusão
          }} 
        />
      )}
    </div>
  );
}