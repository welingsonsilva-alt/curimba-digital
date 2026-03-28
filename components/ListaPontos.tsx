"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ListaPontos() {
  const [pontos, setPontos] = useState<any[]>([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    const buscar = async () => {
      const { data } = await supabase.from("pontos").select("*").eq("aprovado", true);
      if (data) setPontos(data);
    };
    buscar();
  }, []);

  const filtrados = pontos.filter(p => p.titulo.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-900">Kanzuá Digital</h1>
        <Link href="/sugerir" className="bg-yellow-400 px-4 py-2 rounded-full font-bold text-sm">Sugerir +</Link>
      </div>
      <input 
        className="w-full p-4 rounded-xl shadow mb-6 border-2 border-indigo-50" 
        placeholder="Pesquisar ponto..." 
        onChange={e => setBusca(e.target.value)}
      />
      <div className="space-y-3">
        {filtrados.map(p => (
          <details key={p.id} className="bg-white p-4 rounded-xl shadow cursor-pointer">
            <summary className="font-bold text-gray-800">{p.titulo} <small className="text-indigo-400 ml-2">({p.linha})</small></summary>
            <pre className="mt-4 text-gray-600 italic font-serif leading-relaxed whitespace-pre-wrap">{p.letra}</pre>
          </details>
        ))}
      </div>
    </div>
  );
}