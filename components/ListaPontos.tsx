"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ListaPontos() {
  const [pontos, setPontos] = useState<any[]>([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    const buscar = async () => {
      const { data } = await supabase
        .from("pontos")
        .select("*")
        .eq("aprovado", true)
        .order("titulo", { ascending: true }); // Adicionei ordem alfabética para facilitar
      if (data) setPontos(data);
    };
    buscar();
  }, []);

  const filtrados = pontos.filter((p) =>
    p.titulo.toLowerCase().includes(busca.toLowerCase()) ||
    p.linha.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto p-4 min-h-screen pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black text-indigo-900 italic tracking-tighter">
          Kanzuá <span className="text-indigo-500">Digital</span>
        </h1>
        <Link 
          href="/sugerir" 
          className="bg-yellow-400 hover:bg-yellow-500 transition-colors px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-yellow-500/20"
        >
          Sugerir +
        </Link>
      </div>

      <input 
        className="w-full p-5 rounded-2xl shadow-sm mb-8 border-2 border-indigo-50 outline-none focus:border-indigo-200 transition-all text-gray-700" 
        placeholder="Pesquisar por título ou linha..." 
        onChange={e => setBusca(e.target.value)}
      />

      <div className="space-y-4">
        {filtrados.length === 0 && (
          <p className="text-center text-gray-400 py-10 font-medium">Nenhum ponto encontrado...</p>
        )}

        {filtrados.map(p => (
          <details key={p.id} className="group bg-white p-2 rounded-2xl shadow-sm border border-gray-100 transition-all">
            <summary className="list-none p-4 font-bold text-gray-800 cursor-pointer flex justify-between items-center group-open:border-b group-open:border-gray-50 group-open:mb-4">
              <div className="flex flex-col">
                <span className="text-lg leading-tight">{p.titulo}</span>
                <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-black mt-1">{p.linha}</span>
              </div>
              <span className="text-indigo-200 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            
            <div className="p-4 pt-0">
              {/* BOTÕES DE MÍDIA */}
              <div className="flex gap-2 mb-6">
                {p.link_youtube && (
                  <a 
                    href={p.link_youtube} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                  >
                    📺 YouTube
                  </a>
                )}
                
                {p.link_spotify && (
                  <a 
                    href={p.link_spotify} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-600 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all"
                  >
                    🎧 Spotify
                  </a>
                )}
              </div>

              {/* LETRA DO PONTO COM PROTEÇÃO DE TRADUÇÃO */}
              <pre 
                translate="no" 
                className="notranslate text-gray-600 italic font-serif leading-relaxed whitespace-pre-wrap text-lg bg-indigo-50/30 p-6 rounded-[24px] border border-indigo-50/50"
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