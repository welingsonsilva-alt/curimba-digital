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
        // Atualiza ponto existente
        const { error } = await supabase.from("pontos").update(dados).eq("id", dados.id);
        if (error) throw error;
      } else {
        // Insere novo ponto (ou aprova sugestão)
        const { error } = await supabase.from("pontos").insert([{ ...dados, aprovado: true }]);
        if (error) throw error;
        
        // Se veio de uma sugestão, removemos da fila
        if (pontoInicial?.id && pontoInicial?.created_at) {
           await supabase.from("sugestoes_pontos").delete().eq("id", pontoInicial.id);
        }
      }
      alert("Fundamento salvo com sucesso!");
      onClose();
      window.location.reload();
    } catch (err: any) {
      alert("Erro ao processar: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0B1120] border border-white/10 rounded-[40px] p-8 w-full max-w-3xl shadow-3xl my-8">
        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
             <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Editor de Fundamento</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕</button>
        </div>
        
        <form onSubmit={salvarPonto} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* COLUNA DA ESQUERDA: INFORMAÇÕES */}
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-2">Título</label>
              <input required value={dados.titulo} onChange={e => setDados({...dados, titulo: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-4 rounded-2xl text-white outline-none focus:border-indigo-500" placeholder="Ex: Ponto de Iansã" />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-2">Linha de Trabalho</label>
              <select required value={dados.linha} onChange={e => setDados({...dados, linha: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-4 rounded-2xl text-white outline-none cursor-pointer">
                <option value="">Selecione a linha...</option>
                {linhas.map(l => <option key={l.id} value={l.nome}>{l.nome}</option>)}
              </select>
            </div>

            {/* NOVOS CAMPOS: LINKS DE ÁUDIO */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-2">Link YouTube</label>
              <input value={dados.link_youtube} onChange={e => setDados({...dados, link_youtube: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-4 rounded-2xl text-white outline-none focus:border-red-500/50 text-sm" placeholder="https://youtube.com/..." />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-green-500 uppercase tracking-widest ml-2">Link Spotify</label>
              <input value={dados.link_spotify} onChange={e => setDados({...dados, link_spotify: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-4 rounded-2xl text-white outline-none focus:border-green-500/50 text-sm" placeholder="https://open.spotify.com/..." />
            </div>
          </div>

          {/* COLUNA DA DIREITA: LETRA */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-2">Letra do Ponto</label>
            <textarea required rows={14} value={dados.letra} onChange={e => setDados({...dados, letra: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-6 rounded-3xl text-slate-200 italic font-serif text-lg leading-relaxed resize-none outline-none focus:border-indigo-500" placeholder="Escreva a letra aqui..." />
          </div>

          {/* BOTÕES DE AÇÃO */}
          <div className="md:col-span-2 flex gap-4 mt-4 border-t border-white/5 pt-8">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-slate-500 font-bold uppercase text-[10px] tracking-widest">Descartar</button>
            <button type="submit" disabled={loading} className="flex-[2] bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl text-white font-black uppercase text-[11px] tracking-widest shadow-xl shadow-indigo-600/10 transition-all">
              {loading ? "SALVANDO..." : "SALVAR NO CURIMBA DIGITAL"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}