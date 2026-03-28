"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// 1. A INTERFACE QUE "LIBERA" O ID PARA O TYPESCRIPT
interface DadosPonto {
  id?: string | number; 
  titulo: string;
  linha: string;
  letra: string;
  link_youtube?: string;
  link_spotify?: string;
  aprovado: boolean;
}

interface FormularioPontoProps {
  pontoInicial: any;
  onClose: () => void;
  linhas?: any[]; // Lista de linhas para o dropdown
}

export default function FormularioPonto({ pontoInicial, onClose, linhas = [] }: FormularioPontoProps) {
  const [loading, setLoading] = useState(false);
  
  // Identifica se é uma sugestão pendente (sem campo 'aprovado') ou edição de ponto oficial
  const isSugestao = !!(pontoInicial?.id && !('aprovado' in pontoInicial));

  // 2. APLICAMOS A INTERFACE NO useState (useState<DadosPonto>)
  const [dados, setDados] = useState<DadosPonto>({
    id: (pontoInicial?.id && !isSugestao) ? pontoInicial.id : undefined,
    titulo: pontoInicial?.titulo || "",
    linha: pontoInicial?.linha || "",
    letra: pontoInicial?.letra || "",
    link_youtube: pontoInicial?.link_youtube || "",
    link_spotify: pontoInicial?.link_spotify || "",
    aprovado: pontoInicial?.aprovado ?? true,
  });

  // Efeito para resetar o formulário quando o ponto selecionado mudar
  useEffect(() => {
    const currentIsSugestao = !!(pontoInicial?.id && !('aprovado' in pontoInicial));
    setDados({
      id: (pontoInicial?.id && !currentIsSugestao) ? pontoInicial.id : undefined,
      titulo: pontoInicial?.titulo || "",
      linha: pontoInicial?.linha || "",
      letra: pontoInicial?.letra || "",
      link_youtube: pontoInicial?.link_youtube || "",
      link_spotify: pontoInicial?.link_spotify || "",
      aprovado: pontoInicial?.aprovado ?? true,
    });
  }, [pontoInicial]);

  async function salvarPonto(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Preparamos os dados, limpando strings vazias para null
      const payload = {
        titulo: dados.titulo,
        linha: dados.linha,
        letra: dados.letra,
        link_youtube: dados.link_youtube || null,
        link_spotify: dados.link_spotify || null,
        aprovado: dados.aprovado,
      };

      if (dados.id) {
        const { error } = await supabase
          .from("pontos")
          .update(payload)
          .eq("id", dados.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("pontos").insert([payload]);
        if (error) throw error;

        // Se era uma sugestão, removemos da fila após converter em ponto oficial
        if (isSugestao) {
          const { error: delError } = await supabase.from("sugestoes_pontos").delete().eq("id", pontoInicial.id);
          if (delError) throw delError;
        }
      }
      
      alert("Salvo no Curimba Digital!");
      // Uma boa prática é recarregar a página ou disparar um evento de refresh no pai
      onClose(); 
    } catch (err: any) {
      alert("Erro: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[48px] p-10 w-full max-w-4xl shadow-3xl overflow-y-auto max-h-[90vh]">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <img src="/logo.png" className="w-12 h-12 object-contain" alt="Logo" />
          <h2 className="text-2xl font-black uppercase italic tracking-tighter">
            {isSugestao ? "Revisar Sugestão" : (dados.id ? "Editar Registro" : "Novo Fundamento")}
          </h2>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white text-2xl font-black">✕</button>
      </div>

      <form onSubmit={salvarPonto} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-4">Título</label>
            <input
              required
              value={dados.titulo}
              onChange={(e) => setDados({ ...dados, titulo: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition-all font-bold text-slate-200"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-4">Linha</label>
            <select
              required
              value={dados.linha}
              onChange={(e) => setDados({ ...dados, linha: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition-all font-bold text-slate-200 appearance-none"
            >
              <option value="">Selecione uma Linha...</option>
              {linhas.map((l) => (
                <option key={l.id} value={l.nome}>{l.nome}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-4">Link YouTube</label>
            <input
              value={dados.link_youtube}
              onChange={(e) => setDados({ ...dados, link_youtube: e.target.value })}
              placeholder="URL do vídeo (opcional)"
              className="bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition-all font-bold text-slate-200"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-4">Link Spotify</label>
            <input
              value={dados.link_spotify}
              onChange={(e) => setDados({ ...dados, link_spotify: e.target.value })}
              placeholder="URL da faixa (opcional)"
              className="bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition-all font-bold text-slate-200"
            />
          </div>
          <div className="flex items-center gap-4 px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl">
            <input
              type="checkbox"
              id="aprovado"
              checked={dados.aprovado}
              onChange={(e) => setDados({ ...dados, aprovado: e.target.checked })}
              className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="aprovado" className="text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer select-none">
              Publicar Ponto (Visível no Site)
            </label>
          </div>
        </div>
        <div className="flex flex-col gap-2 h-full">
          <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-4">Letra</label>
          <textarea
            required
            rows={10}
            value={dados.letra}
            onChange={(e) => setDados({ ...dados, letra: e.target.value })}
            className="bg-slate-950 border border-slate-800 rounded-[32px] p-8 outline-none focus:border-indigo-500 transition-all font-serif italic text-lg leading-relaxed text-slate-300 flex-1 min-h-[300px]"
          />
        </div>
        <div className="md:col-span-2 flex justify-end gap-4 mt-6">
          <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase shadow-xl disabled:opacity-50">
            {loading ? "SALVANDO..." : "SALVAR NO CURIMBA DIGITAL"}
          </button>
        </div>
      </form>
    </div>
  );
}