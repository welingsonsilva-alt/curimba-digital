"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ListaPontos({ onEdit }: { onEdit: (ponto: any) => void }) {
  const [pontos, setPontos] = useState<any[]>([]);
  const [linhas, setLinhas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ESTADOS DE FILTRO
  const [busca, setBusca] = useState("");
  const [filtroLinha, setFiltroLinha] = useState("TODOS");
  const [filtroMidia, setFiltroMidia] = useState<"TODOS" | "SEM_YOUTUBE" | "SEM_SPOTIFY">("TODOS");

  useEffect(() => {
    async function carregarDados() {
      const { data: pts } = await supabase.from("pontos").select("*").eq("aprovado", true).order("titulo");
      const { data: lns } = await supabase.from("linhas_trabalho").select("*").order("nome");
      
      if (pts) setPontos(pts);
      if (lns) setLinhas(lns);
      setLoading(false);
    }
    carregarDados();
  }, []);

  // LÓGICA DE FILTRAGEM TRIPLA (BUSCA + LINHA + MÍDIA)
  const filtrados = pontos.filter(p => {
    const matchBusca = p.titulo.toLowerCase().includes(busca.toLowerCase());
    const matchLinha = filtroLinha === "TODOS" || p.linha === filtroLinha;
    
    let matchMidia = true;
    if (filtroMidia === "SEM_YOUTUBE") {
      matchMidia = !p.link_youtube || p.link_youtube.trim() === "";
    } else if (filtroMidia === "SEM_SPOTIFY") {
      matchMidia = !p.link_spotify || p.link_spotify.trim() === "";
    }

    return matchBusca && matchLinha && matchMidia;
  });

  if (loading) return <div className="text-[10px] font-black uppercase text-slate-500">Carregando Biblioteca...</div>;

  return (
    <div className="space-y-8">
      {/* 1. HEADER E BUSCA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">Biblioteca Oficial</h2>
        <input 
          placeholder="Pesquisar ponto..." 
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl text-sm outline-none focus:border-indigo-500/50 w-full md:w-80"
        />
      </div>

      {/* 2. BARRA DE FERRAMENTAS (FILTROS) */}
      <div className="flex flex-wrap items-center gap-4 bg-black/20 p-2 rounded-[24px] border border-white/5">
        
        {/* Filtro por Linha */}
        <select 
          value={filtroLinha} 
          onChange={e => setFiltroLinha(e.target.value)}
          className="bg-white/5 border border-white/10 text-slate-300 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-indigo-500"
        >
          <option value="TODOS">Todas as Linhas</option>
          {linhas.map(l => <option key={l.id} value={l.nome} className="bg-slate-900">{l.nome}</option>)}
        </select>

        <div className="h-8 w-[1px] bg-white/10 hidden md:block"></div>

        {/* Filtros de Mídia Faltante */}
        <div className="flex gap-2">
          <button 
            onClick={() => setFiltroMidia("TODOS")}
            className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
              filtroMidia === "TODOS" ? "bg-white text-slate-900" : "text-slate-500 hover:text-white"
            }`}
          >
            Todos
          </button>
          
          <button 
            onClick={() => setFiltroMidia("SEM_YOUTUBE")}
            className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
              filtroMidia === "SEM_YOUTUBE" ? "bg-red-600 text-white border-red-500" : "text-red-500 border-red-500/20 hover:bg-red-600/10"
            }`}
          >
            Sem YouTube
          </button>

          <button 
            onClick={() => setFiltroMidia("SEM_SPOTIFY")}
            className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
              filtroMidia === "SEM_SPOTIFY" ? "bg-green-600 text-white border-green-500" : "text-green-500 border-green-500/20 hover:bg-green-600/10"
            }`}
          >
            Sem Spotify
          </button>
        </div>
      </div>

      {/* 3. GRID DE PONTOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtrados.map(p => (
          <div key={p.id} className="bg-white/[0.03] border border-white/5 p-6 rounded-[32px] group hover:border-indigo-500/30 transition-all flex flex-col justify-between min-h-[160px]">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-indigo-500 text-[8px] font-black uppercase tracking-widest">{p.linha}</span>
                
                {/* DOTS: Apenas brilham se o link EXISTIR */}
                <div className="flex gap-2">
                  {p.link_youtube && p.link_youtube.trim() !== "" && (
                    <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                  )}
                  {p.link_spotify && p.link_spotify.trim() !== "" && (
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                  )}
                </div>
              </div>

              <h4 className="font-bold text-slate-100 text-[14px] leading-tight uppercase group-hover:text-white transition-colors">
                {p.titulo}
              </h4>
            </div>

            <button 
              onClick={() => onEdit(p)}
              className="mt-6 text-[10px] font-black uppercase text-slate-500 group-hover:text-indigo-400 transition-all flex items-center gap-2"
            >
              Editar Fundamento →
            </button>
          </div>
        ))}
      </div>

      {/* MENSAGEM VAZIA */}
      {filtrados.length === 0 && (
        <div className="py-20 text-center border border-dashed border-white/10 rounded-[40px] opacity-40">
          <p className="italic text-sm">Nenhum fundamento encontrado para essa combinação de filtros.</p>
        </div>
      )}
    </div>
  );
}