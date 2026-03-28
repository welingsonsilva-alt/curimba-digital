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

interface FormularioPontoProps {
  pontoInicial: any;
  onClose: () => void;
  linhas?: any[]; // Opcional, caso queira passar a lista de linhas do banco
}

export default function FormularioPonto({ pontoInicial, onClose }: FormularioPontoProps) {
  const [loading, setLoading] = useState(false);
  
  // CORREÇÃO DO ERRO DE TIPO: Definimos a interface DadosPonto para o State
  const [dados, setDados] = useState<DadosPonto>({
    // Se for ponto oficial (não tem criado_em), mantém o ID para dar UPDATE
    // Se for sugestão (tem criado_em), id fica undefined para dar INSERT como novo
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
        // ATUALIZAR PONTO EXISTENTE
        const { error } = await supabase
          .from("pontos")
          .update({
            titulo: dados.titulo,
            linha: dados.linha,
            letra: dados.letra,
            link_youtube: dados.link_youtube,
            link_spotify: dados.link_spotify,
          })
          .eq("id", dados.id);

        if (error) throw error;
        alert("Ponto atualizado com sucesso!");
      } else {
        // INSERIR NOVO PONTO (Ou converter sugestão em oficial)
        const { error } = await supabase.from("pontos").insert([
          {
            titulo: dados.titulo,
            linha: dados.linha,
            letra: dados.letra,
            link_youtube: dados.link_youtube,
            link_spotify: dados.link_spotify,
            aprovado: true,
          },
        ]);

        if (error) throw error;

        // Se viemos de uma sugestão, precisamos deletar ela da fila após salvar
        if (pontoInicial?.criado_em) {
          await supabase.from("sugestoes_pontos").delete().eq("id", pontoInicial.id);
        }

        alert("Ponto salvo na biblioteca oficial!");
      }
      onClose();
    } catch (err: any) {
      alert("Erro ao salvar: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[48px] p-10 w-full max-w-4xl shadow-3xl animate-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <img src="/logo.png" className="w-12 h-12 object-contain" alt="Logo" />
          <h2 className="text-2xl font-black uppercase italic tracking-tighter">
            {dados.id ? "Editar Registro" : "Novo Fundamento"}
          </h2>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white text-2xl font-black">✕</button>
      </div>

      <form onSubmit={salvarPonto} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-4">Título do Ponto</label>
            <input
              required
              value={dados.titulo}
              onChange={(e) => setDados({ ...dados, titulo: e.target.value })}
              placeholder="Ex: Deu um clarão no céu"
              className="bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition-all font-bold text-slate-200"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-4">Linha de Trabalho</label>
            <input
              required
              value={dados.linha}
              onChange={(e) => setDados({ ...dados, linha: e.target.value })}
              placeholder="Ex: Iansã"
              className="bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition-all font-bold text-slate-200"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Link YouTube (Opcional)</label>
            <input
              value={dados.link_youtube}
              onChange={(e) => setDados({ ...dados, link_youtube: e.target.value })}
              placeholder="https://youtube.com/..."
              className="bg-slate-950/50 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:border-red-500/30 transition-all text-slate-400 text-sm"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Link Spotify (Opcional)</label>
            <input
              value={dados.link_spotify}
              onChange={(e) => setDados({ ...dados, link_spotify: e.target.value })}
              placeholder="https://open.spotify.com/..."
              className="bg-slate-950/50 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:border-green-500/30 transition-all text-slate-400 text-sm"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-4">Letra Completa</label>
          <textarea
            required
            rows={12}
            value={dados.letra}
            onChange={(e) => setDados({ ...dados, letra: e.target.value })}
            className="bg-slate-950 border border-slate-800 rounded-[32px] p-8 outline-none focus:border-indigo-500 transition-all font-serif italic text-lg leading-relaxed text-slate-300 resize-none"
          />
        </div>

        <div className="md:col-span-2 flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase text-slate-500 hover:text-white transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50"
          >
            {loading ? "SALVANDO..." : dados.id ? "ATUALIZAR REGISTRO" : "CONFIRMAR FUNDAMENTO"}
          </button>
        </div>
      </form>
    </div>
  );
}
