"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function FormularioPonto({ pontoInicial, onClose }: { pontoInicial: any, onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [linhas, setLinhas] = useState<any[]>([]);
  
  const isEdicao = pontoInicial?.id && !pontoInicial?.created_at;

  const [dados, setDados] = useState({
    id: pontoInicial?.id || null,
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

  async function excluirPonto() {
    if (!confirm("⚠️ Deseja realmente apagar este fundamento?")) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("pontos").delete().eq("id", dados.id);
      if (error) throw error;
      onClose();
      window.location.reload();
    } catch (err: any) {
      alert("Erro ao excluir: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function salvarPonto(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const corpoRequisicao = {
        titulo: dados.titulo.trim(),
        linha: dados.linha,
        letra: dados.letra.trim(),
        link_youtube: dados.link_youtube?.trim() || null,
        link_spotify: dados.link_spotify?.trim() || null,
        aprovado: true
      };

      if (isEdicao) {
        const { error } = await supabase.from("pontos").update(corpoRequisicao).eq("id", dados.id);
        if (error) throw error;
      } else {
        const { error: insError } = await supabase.from("pontos").insert([corpoRequisicao]);
        if (insError) throw insError;
        if (pontoInicial?.id) {
          await supabase.from("sugestoes_pontos").delete().eq("id", pontoInicial.id);
        }
      }
      onClose();
      window.location.reload();
    } catch (err: any) {
      alert("Erro: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0B1120] border border-white/10 rounded-[40px] p-8 w-full max-w-3xl shadow-3xl my-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
          <div>
            <span className="text-indigo-500 text-[10px] font-black uppercase tracking-[0.2em]">Painel de Controle</span>
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">
              {isEdicao ? "Editar Fundamento" : "Aprovar Nova Sugestão"}
            </h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-slate-500 hover:text-white transition-colors">✕</button>
        </div>
        
        <form onSubmit={salvarPonto} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* COLUNA ESQUERDA: METADADOS */}
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-2 tracking-widest">Nome do Ponto</label>
              <input required value={dados.titulo} onChange={e => setDados({...dados, titulo: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-4 rounded-2xl text-white outline-none focus:border-indigo-500/50 transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-2 tracking-widest">Linha de Trabalho</label>
              <select required value={dados.linha} onChange={e => setDados({...dados, linha: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-4 rounded-2xl text-white outline-none focus:border-indigo-500/50 appearance-none cursor-pointer">
                <option value="">Selecione...</option>
                {linhas.map(l => <option key={l.id} value={l.nome} className="bg-slate-900">{l.nome}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 pt-2">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-red-500/50">YT</span>
                <input placeholder="Link do YouTube" value={dados.link_youtube} onChange={e => setDados({...dados, link_youtube: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-4 pl-12 rounded-2xl text-white text-xs outline-none focus:border-red-500/30" />
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-green-500/50">SP</span>
                <input placeholder="Link do Spotify" value={dados.link_spotify} onChange={e => setDados({...dados, link_spotify: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-4 pl-12 rounded-2xl text-white text-xs outline-none focus:border-green-500/30" />
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: LETRA */}
          <div className="flex flex-col space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-2 tracking-widest">Letra Completa</label>
            <textarea required value={dados.letra} onChange={e => setDados({...dados, letra: e.target.value})} className="flex-1 bg-slate-950 border border-white/5 p-6 rounded-[32px] text-slate-200 font-serif italic text-lg outline-none focus:border-indigo-500/50 resize-none min-h-[300px]" />
          </div>

          {/* FOOTER: BOTÕES */}
          <div className="md:col-span-2 flex items-center justify-between mt-4 pt-6 border-t border-white/5">
            <div>
              {isEdicao && (
                <button type="button" onClick={excluirPonto} disabled={loading} className="text-red-500/50 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-colors px-4 py-2">
                  Excluir Registro
                </button>
              )}
            </div>
            
            <div className="flex gap-4">
              <button type="button" onClick={onClose} className="px-6 py-4 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors">Cancelar</button>
              <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 px-10 py-4 rounded-2xl text-white font-black uppercase text-[11px] tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95">
                {loading ? "Processando..." : isEdicao ? "Salvar Alterações" : "Aprovar e Publicar"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}