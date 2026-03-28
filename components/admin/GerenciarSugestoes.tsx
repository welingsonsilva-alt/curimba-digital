"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface GerenciarSugestoesProps {
  onEdit: (sugestao: any) => void;
}

export default function GerenciarSugestoes({ onEdit }: GerenciarSugestoesProps) {
  const [sugestoes, setSugestoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarSugestoes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("sugestoes_pontos")
      .select("*")
      .order("criado_em", { ascending: false });

    if (!error) {
      setSugestoes(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    carregarSugestoes();
  }, []);

  const recusarSugestao = async (id: string) => {
    if (confirm("Deseja realmente recusar e excluir esta sugestão?")) {
      const { error } = await supabase.from("sugestoes_pontos").delete().eq("id", id);
      if (!error) {
        carregarSugestoes();
      }
    }
  };

  if (loading) {
    return (
      <div className="p-20 text-center animate-pulse">
        <p className="text-indigo-400 font-black tracking-[0.4em] text-xs uppercase text-center w-full">
          Buscando sugestões pendentes...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="space-y-2">
        <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Sugestões Pendentes</h2>
        <p className="text-slate-500 font-medium italic text-sm">Revise e edite as cantigas enviadas antes de publicar no acervo oficial.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {sugestoes.map((s) => (
          <div 
            key={s.id} 
            className="group bg-slate-900/40 p-6 rounded-[35px] border border-slate-800/40 hover:border-indigo-500/40 transition-all flex items-center justify-between gap-6 shadow-xl"
          >
            <div className="flex flex-col min-w-0">
              <span className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-1">
                {s.linha} • Enviado por: {s.sugerido_por || "Anônimo"}
              </span>
              <h3 className="text-xl font-black text-white tracking-tight uppercase italic truncate leading-tight">
                {s.titulo}
              </h3>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <button 
                onClick={() => onEdit(s)}
                className="bg-white text-black h-12 px-8 rounded-2xl font-black text-[10px] tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-xl active:scale-95"
              >
                REVISAR E EDITAR
              </button>
              <button 
                onClick={() => recusarSugestao(s.id)}
                className="w-12 h-12 flex items-center justify-center bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                title="Excluir Sugestão"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {sugestoes.length === 0 && (
        <div className="text-center py-32 border-2 border-dashed border-slate-800/50 rounded-[50px] opacity-30">
          <p className="text-[10px] font-black tracking-[0.5em] uppercase text-slate-500">Nenhuma sugestão na fila</p>
        </div>
      )}
    </div>
  );
}