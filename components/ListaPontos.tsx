"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ListaPontos() {
  const [pontos, setPontos] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buscar = async () => {
      setLoading(true);
      // Selecionando explicitamente todas as colunas necessárias
      const { data, error } = await supabase
        .from("pontos")
        .select("id, titulo, linha, letra, link_youtube, link_spotify, aprovado")
        .eq("aprovado", true)
        .order("titulo", { ascending: true });
      
      if (error) {
        console.error("Erro ao buscar pontos:", error.message);
      } else {
        console.log("Pontos carregados com sucesso:", data);
        setPontos(data || []);
      }
      setLoading(false);
    };
    buscar();
  }, []);

  const filtrados = pontos.filter((p) =>
    p.titulo.toLowerCase().includes(busca.toLowerCase()) ||
    p.linha.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto p-4 min-h-screen bg-slate-50 pb-20">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 mt-6">
        <h1 className="text-3xl font-black text-indigo-900 italic tracking-tighter">
          Kanzuá <span className="text-indigo-500">Digital</span>
        </h1>
        <Link 
          href="/sugerir" 
          className="bg-yellow-400 hover:bg-yellow-500 transition-all px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg shadow-yellow-500/20"
        >
          Sugerir +
        </Link>
      </div>

      {/* BUSCA */}
      <input 
        className="w-full p-5 rounded-2xl shadow-sm mb-8 border-2 border-indigo-100 outline-none focus:border-indigo-400 transition-all bg-white text-gray-700" 
        placeholder="Pesquisar ponto ou linha..." 
        onChange={e => setBusca(e.target.value)}
      />

      {/* LISTAGEM */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-slate-400 animate-pulse font-bold uppercase text-xs tracking-widest">Carregando Biblioteca...</p>
        ) : filtrados.length === 0 ? (
          <p className="text-center text-slate-400 py-10 font-medium">Nenhum ponto encontrado.</p>
        ) : (
          filtrados.map(p => (
            <details key={p.id} className="group bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden transition-all">
              <summary className="list-none p-6 font-bold text-gray-800 cursor-pointer flex justify-between items-center hover:bg-slate-50/50">
                <div className="flex flex-col">
                  <span className="text-lg leading-tight">{p.titulo}</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-indigo-500 font-black mt-1">{p.linha}</span>
                </div>
                <div className="text-indigo-200 group-open:rotate-180 transition-transform duration-300">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </summary>
              
              <div className="p-6 pt-0 border-t border-slate-50">
                {/* ÁREA DE BOTÕES DE MÍDIA */}
                <div className="py-6 flex flex-wrap gap-3">
                  
                  {/* DEBUG VISUAL: Remova estas linhas após confirmar que funciona */}
                  {(!p.link_youtube && !p.link_spotify) && (
                    <p className="text-[10px] text-slate-300 italic font-medium w-full text-center border border-dashed border-slate-100 py-2 rounded-lg">
                      Sem links de áudio/vídeo cadastrados.
                    </p>
                  )}

                  {/* BOTÃO YOUTUBE */}
                  {p.link_youtube && (
                    <a 
                      href={p.link_youtube} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 min-w-[140px] flex items-center justify-center gap-3 bg-[#FF0000] text-white px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-red-600/20"
                    >
                      <span className="text-sm">📺</span> YouTube
                    </a>
                  )}
                  
                  {/* BOTÃO SPOTIFY */}
                  {p.link_spotify && (
                    <a 
                      href={p.link_spotify} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 min-w-[140px] flex items-center justify-center gap-3 bg-[#1DB954] text-white px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-green-600/20"
                    >
                      <span className="text-sm">🎧</span> Spotify
                    </a>
                  )}
                </div>

                {/* LETRA DO PONTO */}
                <div className="relative">
                  <div className="absolute top-4 right-6 text-[10px] font-bold text-slate-300 uppercase tracking-widest">Letra</div>
                  <pre 
                    translate="no" 
                    className="notranslate text-gray-700 italic font-serif leading-relaxed whitespace-pre-wrap text-lg bg-slate-50/50 p-8 rounded-[32px] border border-slate-100"
                  >
                    {p.letra}
                  </pre>
                </div>
              </div>
            </details>
          ))
        )}
      </div>
    </div>
  );
}