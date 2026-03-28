"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ListaPontos({ onEdit }: any) {
  const [pontos, setPontos] = useState<any[]>([]);
  const [linhas, setLinhas] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroLinha, setFiltroLinha] = useState("TODOS");

  useEffect(() => {
    async function carregarDados() {
      // Carrega os pontos
      const { data: pts } = await supabase.from("pontos").select("*").order("titulo");
      if (pts) setPontos(pts);

      // Carrega as linhas cadastradas no seu perfil para os botões de filtro
      const { data: lns } = await supabase.from("linhas_trabalho").select("*").order("nome");
      if (lns) setLinhas(lns);
    }
    carregarDados();
  }, []);

  // Lógica de Filtro Combinada (Busca + Botão de Linha)
  const filtrados = pontos.filter(p => {
    const matchesBusca = p.titulo.toLowerCase().includes(busca.toLowerCase()) || 
                         p.letra.toLowerCase().includes(busca.toLowerCase());
    const matchesLinha = filtroLinha === "TODOS" || p.linha === filtroLinha;
    return matchesBusca && matchesLinha;
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* CABEÇALHO E BUSCA */}
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-white tracking-tighter">Biblioteca</h2>
            <p className="text-slate-500 font-medium italic">Gerencie o acervo de cantigas do terreiro.</p>
          </div>
          
          <div className="bg-slate-900/60 px-6 py-4 rounded-[24px] border border-slate-800 focus-within:border-indigo-500/50 transition-all w-full max-w-sm shadow-inner">
            <input 
              placeholder="Pesquisar na letra ou título..."
              className="bg-transparent outline-none font-bold text-sm w-full text-slate-200 placeholder:text-slate-700"
              onChange={e => setBusca(e.target.value)}
            />
          </div>
        </div>

        {/* FILTROS POR LINHA (BOTÕES DINÂMICOS) */}
        <div className="flex flex-wrap gap-3 pb-4">
          <button
            onClick={() => setFiltroLinha("TODOS")}
            className={`px-6 py-3 rounded-2xl font-black text-[10px] tracking-widest transition-all ${
              filtroLinha === "TODOS" 
              ? "bg-white text-black shadow-lg shadow-white/5" 
              : "bg-slate-800/40 text-slate-500 hover:bg-slate-800"
            }`}
          >
            TODOS
          </button>
          
          {linhas.map(linha => (
            <button
              key={linha.id}
              onClick={() => setFiltroLinha(linha.nome)}
              className={`px-6 py-3 rounded-2xl font-black text-[10px] tracking-widest transition-all uppercase ${
                filtroLinha === linha.nome 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40" 
                : "bg-slate-800/40 text-slate-500 hover:bg-slate-700/60 hover:text-slate-300"
              }`}
            >
              {linha.nome}
            </button>
          ))}
        </div>
      </div>

      {/* GRID DE CARDS COM ÍCONES DE MÍDIA */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filtrados.map(p => (
          <div key={p.id} className="group bg-slate-900/40 p-8 rounded-[40px] border border-slate-800/50 flex justify-between items-start hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all duration-500 shadow-xl">
            
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">{p.linha}</span>
                <h4 className="font-black text-slate-100 text-2xl tracking-tight leading-tight uppercase underline decoration-indigo-500/20 underline-offset-8">
                  {p.titulo}
                </h4>
              </div>

              {/* Ícones de Mídia nos Cards */}
              <div className="flex gap-4 pt-2">
                {p.link_youtube && (
                  <a href={p.link_youtube} target="_blank" className="flex items-center gap-2 text-[10px] font-black text-red-500 bg-red-500/10 px-3 py-1.5 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                    <span>🎬 YOUTUBE</span>
                  </a>
                )}
                {p.link_spotify && (
                  <a href={p.link_spotify} target="_blank" className="flex items-center gap-2 text-[10px] font-black text-[#1DB954] bg-[#1DB954]/10 px-3 py-1.5 rounded-xl hover:bg-[#1DB954] hover:text-white transition-all">
                    <span>🎧 SPOTIFY</span>
                  </a>
                )}
                {!p.link_youtube && !p.link_spotify && (
                  <span className="text-[9px] font-black text-slate-600 italic tracking-widest">SEM MÍDIA ANEXADA</span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-3">
              <button 
                onClick={() => onEdit(p)}
                className="bg-white text-black px-6 py-3 rounded-2xl font-black text-[10px] tracking-widest hover:scale-105 transition-all shadow-xl active:scale-95"
              >
                EDITAR
              </button>
              {p.aprovado ? (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[9px] font-black text-emerald-500 tracking-tighter">PÚBLICO</span>
                </div>
              ) : (
                <span className="text-[9px] font-black text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full tracking-tighter">RASCO</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtrados.length === 0 && (
        <div className="text-center py-20 bg-slate-900/20 rounded-[40px] border border-dashed border-slate-800">
          <p className="text-slate-600 font-black tracking-widest uppercase text-xs">Nenhum ponto encontrado nesta categoria</p>
        </div>
      )}
    </div>
  );
}