"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ListaPontos({ onEdit }: { onEdit: (ponto: any) => void }) {
  const [pontos, setPontos] = useState<any[]>([]);
  const [linhas, setLinhas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroLinha, setFiltroLinha] = useState("TODOS");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setLoading(true);
    // 1. Carrega todos os pontos
    const { data: pts } = await supabase
      .from("pontos")
      .select("*")
      .order("titulo", { ascending: true });
    
    // 2. Carrega as linhas para os botões de filtro
    const { data: lns } = await supabase
      .from("linhas_trabalho")
      .select("nome")
      .order("nome");

    if (pts) setPontos(pts);
    if (lns) setLinhas(lns);
    setLoading(false);
  }

  // Lógica de Filtro Duplo (Busca por texto + Botão de Linha)
  const filtrados = pontos.filter(p => {
    const matchBusca = p.titulo.toLowerCase().includes(busca.toLowerCase());
    const matchLinha = filtroLinha === "TODOS" || p.linha === filtroLinha;
    return matchBusca && matchLinha;
  });

  if (loading) return <div className="animate-pulse text-[10px] font-black uppercase text-slate-600">Carregando Biblioteca...</div>;

  return (
    <div className="space-y-8">
      {/* HEADER DA BIBLIOTECA: BUSCA + FILTROS */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <input 
            placeholder="Pesquisar na biblioteca..." 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs outline-none focus:border-indigo-500/50 transition-all"
          />
        </div>

        {/* BOTÕES DE FILTRO POR LINHA */}
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setFiltroLinha("TODOS")}
            className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
              filtroLinha === "TODOS" 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
              : 'bg-white/5 text-slate-500 border border-white/5 hover:border-white/10'
            }`}
          >
            Todos
          </button>
          {linhas.map((l) => (
            <button 
              key={l.nome}
              onClick={() => setFiltroLinha(l.nome)}
              className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                filtroLinha === l.nome 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'bg-white/5 text-slate-500 border border-white/5 hover:border-white/10'
              }`}
            >
              {l.nome}
            </button>
          ))}
        </div>
      </div>

      {/* RESULTADO: CARDS COMPACTOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {filtrados.map((p) => (
          <button 
            key={p.id} 
            onClick={() => onEdit(p)}
            className="group bg-white/[0.03] border border-white/5 p-3 rounded-xl text-left hover:bg-white/[0.06] hover:border-indigo-500/40 transition-all flex justify-between items-center"
          >
            <div className="truncate pr-2">
              <span className="text-indigo-500 text-[7px] font-black uppercase tracking-widest block mb-0.5 opacity-60">
                {p.linha}
              </span>
              <h4 className="font-bold text-slate-200 text-[11px] uppercase truncate group-hover:text-white transition-colors">
                {p.titulo}
              </h4>
            </div>

            <div className="flex gap-1 flex-shrink-0">
              {p.link_youtube && <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_4px_red]"></div>}
              {p.link_spotify && <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_4px_green]"></div>}
            </div>
          </button>
        ))}
      </div>

      {filtrados.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[40px]">
          <p className="text-slate-600 italic text-xs uppercase font-black tracking-widest">Nenhum fundamento encontrado</p>
        </div>
      )}
    </div>
  );
}