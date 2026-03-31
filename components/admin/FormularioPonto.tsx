"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function FormularioPonto({ pontoInicial, onClose }: { pontoInicial: any, onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [linhas, setLinhas] = useState<any[]>([]);
  
  const isSugestao = !!(pontoInicial?.criado_em || pontoInicial?.created_at);

  const [dados, setDados] = useState({
    id: pontoInicial?.id || null,
    titulo: pontoInicial?.titulo || "",
    linha: pontoInicial?.linha || "",
    letra: pontoInicial?.letra || "",
    link_youtube: pontoInicial?.link_youtube || "",
    link_spotify: pontoInicial?.link_spotify || "",
  });

  useEffect(() => {
    carregarLinhas();
  }, []);

  async function carregarLinhas() {
    const { data } = await supabase.from("linhas_trabalho").select("*").order("nome");
    if (data) setLinhas(data);
  }

  async function salvarPonto(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Buscamos o objeto da linha para pegar o UUID real
      const linhaEncontrada = linhas.find(l => l.nome === dados.linha);
      
      // 2. CORREÇÃO AQUI: Garantimos que se não achar o ID, passe null (sem aspas)
      const idLinhaReal = linhaEncontrada?.id || null;

      const corpoRequisicao = {
        titulo: dados.titulo.trim(),
        linha: dados.linha,
        letra: dados.letra.trim(),
        id_linha: idLinhaReal, // <--- Aqui estava o erro ("null" vs null)
        link_youtube: dados.link_youtube?.trim() || null,
        link_spotify: dados.link_spotify?.trim() || null,
        aprovado: true
      };

      if (!isSugestao && dados.id) {
        // UPDATE
        const { error } = await supabase.from("pontos").update(corpoRequisicao).eq("id", dados.id);
        if (error) throw error;
      } else {
        // INSERT
        const { error: insError } = await supabase.from("pontos").insert([corpoRequisicao]);
        if (insError) throw insError;
        
        if (pontoInicial?.id) {
          await supabase.from("sugestoes_pontos").delete().eq("id", pontoInicial.id);
        }
      }

      alert("✨ Ponto salvo com sucesso!");
      onClose();
      window.location.reload();

    } catch (err: any) {
      console.error("Erro no Supabase:", err);
      alert("Erro ao salvar: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  // ... (mantenha o restante do código do return igual ao anterior)
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0B1120] border border-white/10 rounded-[40px] p-8 w-full max-w-3xl shadow-3xl my-auto">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
          <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">
            {dados.id && !isSugestao ? "Editar Registro" : "Novo Fundamento"}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-2xl">✕</button>
        </div>
        
        <form onSubmit={salvarPonto} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-5">
            <input required placeholder="Título" value={dados.titulo} onChange={e => setDados({...dados, titulo: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-4 rounded-2xl text-white outline-none focus:border-indigo-500/50" />
            
            <select required value={dados.linha} onChange={e => setDados({...dados, linha: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-4 rounded-2xl text-white outline-none">
              <option value="">Selecione a Linha...</option>
              {linhas.map(l => <option key={l.id} value={l.nome}>{l.nome}</option>)}
            </select>

            <input placeholder="Link YouTube" value={dados.link_youtube} onChange={e => setDados({...dados, link_youtube: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-4 rounded-2xl text-white text-xs outline-none" />
            <input placeholder="Link Spotify" value={dados.link_spotify} onChange={e => setDados({...dados, link_spotify: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-4 rounded-2xl text-white text-xs outline-none" />
          </div>

          <textarea required placeholder="Letra do ponto..." value={dados.letra} onChange={e => setDados({...dados, letra: e.target.value})} className="flex-1 bg-slate-950 border border-white/5 p-6 rounded-[32px] text-slate-200 font-serif italic text-lg outline-none resize-none min-h-[300px]" />

          <div className="md:col-span-2 flex justify-end gap-4 mt-4 pt-6 border-t border-white/5">
            <button type="button" onClick={onClose} className="px-6 py-4 text-slate-500 font-black uppercase text-[10px]">Cancelar</button>
            <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 px-10 py-4 rounded-2xl text-white font-black uppercase text-[11px] shadow-indigo-600/20">
              {loading ? "Gravando..." : "Salvar Agora"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}