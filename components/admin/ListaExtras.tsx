"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ListaExtras() {
  const [extras, setExtras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const { data } = await supabase.from("sugestoes_extras").select("*").order("created_at", { ascending: false });
    if (data) setExtras(data);
    setLoading(false);
  }

  async function deletar(id: string) {
    if (!confirm("Remover esta sugestão de melhoria?")) return;
    const { error } = await supabase.from("sugestoes_extras").delete().eq("id", id);
    if (!error) setExtras(extras.filter(e => e.id !== id));
  }

  if (loading) return <p className="text-[10px] font-black uppercase text-slate-500">Buscando feedbacks...</p>;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-black uppercase italic mb-8">Sugestões de Melhoria</h3>
      {extras.map(e => (
        <div key={e.id} className="bg-white/5 border border-white/5 p-8 rounded-[32px] flex justify-between items-start group hover:border-indigo-500/30 transition-all">
          <div className="flex-1">
            <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest block mb-2">
              Recebido em: {new Date(e.created_at).toLocaleString('pt-BR')}
            </span>
            <p className="text-slate-200 text-lg italic font-serif leading-relaxed pr-10">
              "{e.mensagem}"
            </p>
          </div>
          <button 
            onClick={() => deletar(e.id)} 
            className="bg-red-500/10 text-red-500 p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
          >
            ✕
          </button>
        </div>
      ))}
      {extras.length === 0 && <p className="text-slate-500 italic">Nenhuma sugestão extra por enquanto.</p>}
    </div>
  );
}