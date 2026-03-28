"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function GerenciarLinhas() {
  const [linhas, setLinhas] = useState<any[]>([]);
  const [nome, setNome] = useState("");

  const carregar = async () => {
    const { data } = await supabase.from("linhas_trabalho").select("*").order("nome");
    if (data) setLinhas(data);
  };

  useEffect(() => { carregar(); }, []);

  const add = async () => {
    if (!nome) return;
    await supabase.from("linhas_trabalho").insert([{ nome }]);
    setNome("");
    carregar();
  };

  const del = async (id: string) => {
    if (confirm("Deseja remover esta linha?")) {
      await supabase.from("linhas_trabalho").delete().eq("id", id);
      carregar();
    }
  };

  return (
    <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="bg-slate-900/40 rounded-[50px] p-12 border border-slate-800/50 shadow-2xl">
        <h2 className="text-3xl font-black text-white mb-2 tracking-tighter">Linhas de Trabalho</h2>
        <p className="text-slate-500 text-sm mb-10 font-medium">Padronize as categorias do seu terreiro.</p>
        
        <div className="flex gap-4 mb-12 p-2 bg-slate-950/50 rounded-[30px] border border-slate-800 focus-within:border-indigo-500 transition-all">
          <input 
            value={nome} onChange={e => setNome(e.target.value)}
            placeholder="Ex: Baianos, Boiadeiros..."
            className="flex-1 p-4 bg-transparent outline-none font-bold text-slate-200 ml-4 placeholder:text-slate-700"
          />
          <button onClick={add} className="bg-indigo-600 text-white px-10 py-4 rounded-[22px] font-black text-xs hover:bg-indigo-500 shadow-xl shadow-indigo-900/20 transition-all active:scale-95">
            CADASTRAR
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {linhas.map(l => (
            <div key={l.id} className="flex justify-between items-center p-6 bg-slate-800/20 border border-slate-700/30 rounded-3xl hover:bg-slate-800/40 hover:border-slate-600 transition-all group">
              <span className="font-bold text-slate-300 group-hover:text-white transition-colors">{l.nome}</span>
              <button onClick={() => del(l.id)} className="text-slate-600 hover:text-red-400 font-bold text-xs opacity-0 group-hover:opacity-100 transition-all">
                REMOVER
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}