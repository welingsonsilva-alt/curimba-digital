"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ListaPontos() {
  const [pontos, setPontos] = useState<any[]>([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    const buscar = async () => {
      // Garante que estamos pegando todas as colunas, inclusive os links
      const { data, error } = await supabase
        .from("pontos")
        .select("id, titulo, linha, letra, link_youtube, link_spotify")
        .eq("aprovado", true)
        .order("titulo", { ascending: true });
      
      if (error) console.error("Erro Supabase:", error);
      if (data) setPontos(data);
    };
    buscar();
  }, []);

  const filtrados = pontos.filter((p) =>
    p.titulo.toLowerCase().includes(busca.toLowerCase()) ||
    p.linha.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto p-4 min-h-screen bg-slate-50">
      <div className="flex justify-between items-center mb-8 mt-4">
        <h1 className="text-3xl font-black text-indigo-900 italic tracking-tighter">
          Kanzuá <span className="text-indigo-500">Digital</span>
        </h1>
        <Link 
          href="/sugerir" 
          className="bg-yellow-400 hover:bg-yellow-500 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-all"
        >
          Sugerir +
        </Link>
      </div>

      <input 
        className="w-full p-5 rounded-2xl shadow-sm mb-8 border-2 border-indigo-100 outline-none focus:border-indigo-400 transition-all bg-white" 
        placeholder="Pesquisar ponto ou linha..." 
        onChange={e => setBusca(e.target.value)}
      />

      <div className="space-y-4">
        {filtrados.map(p => (
          <details key={p.id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <summary className="list-none p-6 font-bold text-gray-800 cursor-pointer flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-lg">{p.titulo}</span>
                <span className="text-[10px] uppercase tracking-widest text-indigo-500 font-black">{p.linha}</span>
              </div>
              <span className="text-indigo-300 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            
            <div className="p-6 pt-0 border-t border-gray-50">
              {/* ÁREA DE BOTÕES - APARECEM SE HOUVER LINK NO BANCO */}
              <div className="flex flex-wrap gap-3 my-4">
                {p.link_youtube && (
                  <a 
                    href={p.link_youtube} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-[#FF0000] text-white px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                  >
                    📺 YouTube
                  </a>
                )}
                
                {p.link_spotify && (
                  <a 
                    href={p.link_spotify} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-[#1DB954] text-white px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                  >
                    🎧 Spotify
                  </a>
                )}
              </div>

              {/* LETRA COM PROTEÇÃO DE TRADUÇÃO */}
              <pre 
                translate="no" 
                className="notranslate text-gray-700 italic font-serif leading-relaxed whitespace-pre-wrap text-lg bg-slate-50 p-6 rounded-2xl border border-slate-100"
              >
                {p.letra}
              </pre>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}