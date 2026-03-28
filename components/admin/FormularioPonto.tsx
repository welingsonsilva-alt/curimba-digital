"use client";

import { useState } from "react";
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
  
  // Se tiver 'criado_em', tratamos como SUGESTÃO (id vira undefined para gerar um novo no oficial)
  const [dados, setDados] = useState<DadosPonto>({
    id: pontoInicial?.id && !pontoInicial?.criado_em ? pontoInicial.id : undefined,
    titulo: pontoInicial?.titulo || "",
    linha: pontoInicial?.linha || "",
    letra: pontoInicial?.letra || "",
    link_youtube: pontoInicial?.link_youtube || "",
    link_spotify: pontoInicial?.link_spotify || "",
  });

  async function salvarPonto(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (dados.id) {
        // UPDATE em ponto já existente
        const { error } = await supabase.from("pontos").update({
          titulo: dados.titulo, linha: dados.linha, letra: dados.letra,
          link_youtube: dados.link_youtube, link_spotify: dados.link_spotify
        }).eq("id", dados.id);
        if (error) throw error;
      } else {
        // INSERT de novo ponto (ou aprovação de sugestão)
        const { error } = await supabase.from("pontos").insert([{
          titulo: dados.titulo, linha: dados.linha, letra: dados.letra,
          link_youtube: dados.link_youtube, link_spotify: dados.link_spotify, aprovado: true
        }]);
        if (error) throw error;

        // Se veio de uma sugestão, deleta ela da fila após salvar
        if (pontoInicial?.criado_em) {
          await supabase.from("sugestoes_pontos").delete().eq("id", pontoInicial.id);
        }
      }
      alert("Sucesso no Curimba Digital!");
      onClose();
      window.location.reload(); // Atualiza a lista
    } catch (err: any) {
      alert("Erro: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0B1120] border border-slate-800 rounded-[32px] p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-black text-white uppercase italic mb-6">Configurar Ponto</h2>
        <form onSubmit={salvarPonto} className="space-y-4">
          <input required value={dados.titulo} onChange={e => setDados({...dados, titulo: e.target.value})} placeholder="Título" className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-white" />
          <input required value={dados.linha} onChange={e => setDados({...dados, linha: e.target.value})} placeholder="Linha (Ex: Iansã)" className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-white" />
          <textarea required rows={8} value={dados.letra} onChange={e => setDados({...dados, letra: e.target.value})} placeholder="Letra do ponto..." className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-white italic font-serif" />
          <div className="flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-slate-500 font-bold uppercase text-[10px]">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 py-4 rounded-xl text-white font-black uppercase text-[10px] tracking-widest">
              {loading ? "SALVANDO..." : "CONFIRMAR PONTO"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}