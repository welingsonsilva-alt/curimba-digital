"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface DadosPonto {
  id?: string | number;
  titulo: string;
  linha: string;
  letra: string;
  link_youtube?: string;
  link_spotify?: string;
}

export default function FormularioPonto({ pontoInicial, onClose }: { pontoInicial: any, onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [linhas, setLinhas] = useState<any[]>([]);
  
  const [dados, setDados] = useState<DadosPonto>({
    id: pontoInicial?.id && !pontoInicial?.created_at ? pontoInicial.id : undefined,
    titulo: pontoInicial?.titulo || "",
    linha: pontoInicial?.linha || "",
    letra: pontoInicial?.letra || "",
    link_youtube: pontoInicial?.link_youtube || "",
    link_spotify: pontoInicial?.link_spotify || "",
  });

  useEffect(() => {
    async function carregarLinhas() {
      const { data } = await supabase.from("linhas_trabalho").select("*").order("nome");
      if (data) setLinhas(data);
    }
    carregarLinhas();
  }, []);

  async function salvarPonto(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (dados.id) {
        await supabase.from("pontos").update(dados).eq("id", dados.id);
      } else {
        const { error } = await supabase.from("pontos").insert([{ ...dados, aprovado: true }]);
        if (error) throw error;
        // Se era sugestão, deleta da fila
        if (pontoInicial?.id) {
           await supabase.from("sugestoes_pontos").delete().eq("id", pontoInicial.id);
        }
      }
      alert("Ponto oficializado no Curimba Digital!");
      onClose();
      window.location.reload();
    } catch (err: any) {
      alert("Erro ao salvar: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0B1120] border border-white/10 rounded-[40px] p-8 w-full max-w-2xl shadow-3xl my-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Configurar Fundamento</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white">✕</button>
        </div>
        
        <form onSubmit={salvarPonto} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-2">Título do Ponto</label>
              <input required value={dados.titulo} onChange={e => setDados({...dados, titulo: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-4 rounded-2xl text-white outline-none focus:border-indigo-500" />
              
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-2">Linha de Trabalho</label>
              <select required value={dados.linha} onChange={e => setDados({...dados, linha: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-4 rounded-2xl text-white outline-none appearance-none">
                <option value="">Selecione...</option>
                {linhas.map(l => <option key={l.id} value={l.nome}>{l.nome}</option>)}
              </select>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-2">Letra Completa</label>
              <textarea required rows={10} value={dados.letra} onChange={e => setDados({...dados, letra: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-4 rounded-2xl text-white italic font-serif text-sm" />
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-slate-500 font-bold uppercase text-[10px]">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl text-white font-black uppercase text-[10px] tracking-widest transition-all">
              {loading ? "PROCESSANDO..." : "SALVAR NO CURIMBA DIGITAL"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}