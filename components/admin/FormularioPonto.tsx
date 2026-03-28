"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function FormularioPonto({ pontoInicial, onClose }: any) {
  const [dados, setDados] = useState({ 
    titulo: "", 
    linha: "", 
    letra: "", 
    aprovado: false,
    link_youtube: "",
    link_spotify: "" 
  });
  const [linhas, setLinhas] = useState<any[]>([]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (pontoInicial) {
      setDados({
        // Se for edição de ponto existente, mantém o ID. 
        // Se for SUGESTÃO (tem criado_em), deixamos o id como undefined para criar um NOVO ponto.
        id: pontoInicial.criado_em ? undefined : pontoInicial.id,
        titulo: pontoInicial.titulo || "",
        linha: pontoInicial.linha || "",
        letra: pontoInicial.letra || "",
        aprovado: pontoInicial.aprovado || false,
        link_youtube: pontoInicial.link_youtube || "",
        link_spotify: pontoInicial.link_spotify || "",
      });
    }
  }, [pontoInicial]);

  useEffect(() => {
    async function carregarLinhas() {
      const { data } = await supabase.from("linhas_trabalho").select("*").order("nome");
      if (data) setLinhas(data);
    }
    carregarLinhas();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);

    // 1. CRIAMOS UM OBJETO LIMPO: Enviamos apenas o que a tabela 'pontos' aceita
    const payload: any = {
      titulo: dados.titulo,
      linha: dados.linha,
      letra: dados.letra,
      aprovado: dados.aprovado,
      link_youtube: dados.link_youtube,
      link_spotify: dados.link_spotify
    };

    // Se tiver ID (caso de edição de ponto já existente), adicionamos ao payload
    if ((dados as any).id) {
      payload.id = (dados as any).id;
    }

    // Salva na tabela oficial 'pontos'
    const { error } = await supabase.from("pontos").upsert([payload]);
    
    if (!error) {
      // 2. Se o ponto original era uma sugestão, deletamos da fila após salvar o oficial
      if (pontoInicial?.criado_em) {
        await supabase.from("sugestoes_pontos").delete().eq("id", pontoInicial.id);
      }
      
      alert("Axé! O fundamento foi guardado no acervo oficial.");
      onClose();
    } else {
      alert("Erro ao salvar: " + error.message);
    }
    setSalvando(false);
  };

  return (
    <div className="bg-slate-900/40 rounded-[50px] shadow-2xl border border-slate-800/50 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="bg-slate-950/30 px-10 py-8 border-b border-slate-800/50 flex justify-between items-center">
        <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">
          {pontoInicial?.criado_em ? "✨ Revisar Sugestão" : pontoInicial?.id ? "✏️ Editar Ponto" : "✨ Novo Registro"}
        </h2>
        <button onClick={onClose} className="text-slate-500 hover:text-white font-bold transition-colors">Fechar ✕</button>
      </div>

      <form onSubmit={handleSubmit} className="p-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Título da Cantiga</label>
            <input 
              value={dados.titulo}
              onChange={e => setDados({...dados, titulo: e.target.value})}
              className="w-full p-5 bg-slate-950/50 border-2 border-transparent focus:border-indigo-500 rounded-3xl outline-none font-bold text-slate-100 transition-all uppercase"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Linha de Trabalho</label>
            <select 
              value={dados.linha}
              onChange={e => setDados({...dados, linha: e.target.value})}
              className="w-full p-5 bg-slate-950/50 border-2 border-transparent focus:border-indigo-500 rounded-3xl outline-none font-bold text-slate-100 appearance-none cursor-pointer"
              required
            >
              <option value="" className="bg-slate-900">Selecione...</option>
              {linhas.map(l => <option key={l.id} value={l.nome} className="bg-slate-900">{l.nome}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-red-500/50 uppercase tracking-[0.3em] ml-1">🎬 Link YouTube</label>
            <input 
              value={dados.link_youtube}
              onChange={e => setDados({...dados, link_youtube: e.target.value})}
              className="w-full p-5 bg-slate-950/50 border-2 border-transparent focus:border-red-500/50 rounded-3xl outline-none font-bold text-slate-100 transition-all text-sm"
              placeholder="https://youtube.com/..."
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-[#1DB954]/50 uppercase tracking-[0.3em] ml-1">🎧 Link Spotify</label>
            <input 
              value={dados.link_spotify}
              onChange={e => setDados({...dados, link_spotify: e.target.value})}
              className="w-full p-5 bg-slate-950/50 border-2 border-transparent focus:border-[#1DB954]/50 rounded-3xl outline-none font-bold text-slate-100 transition-all text-sm"
              placeholder="Link do álbum ou faixa..."
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Letra</label>
          <textarea 
            rows={10}
            value={dados.letra}
            onChange={e => setDados({...dados, letra: e.target.value})}
            className="w-full p-8 bg-slate-950/50 rounded-[40px] border-2 border-transparent focus:border-indigo-500 outline-none font-serif italic text-lg text-slate-200 leading-relaxed shadow-inner"
            required
          />
        </div>

        <div className="flex items-center gap-4 p-6 bg-indigo-500/5 rounded-3xl border border-indigo-500/10">
           <input 
             type="checkbox" 
             id="aprovado-check"
             checked={dados.aprovado}
             onChange={e => setDados({...dados, aprovado: e.target.checked})}
             className="w-6 h-6 rounded-lg accent-indigo-600 cursor-pointer"
           />
           <label htmlFor="aprovado-check" className="text-sm font-black text-indigo-300 uppercase tracking-widest cursor-pointer select-none">
             Publicar no site
           </label>
        </div>

        <button 
          disabled={salvando}
          type="submit" 
          className="w-full bg-indigo-600 text-white p-6 rounded-[28px] font-black text-lg shadow-xl hover:bg-indigo-500 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {salvando ? "PROCESSANDO..." : "SALVAR E PUBLICAR"}
        </button>
      </form>
    </div>
  );
}