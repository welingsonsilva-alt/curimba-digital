"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, sugestoes: 0, linhas: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarEstatisticas() {
      // Busca contagens exatas do Supabase
      const { count: total } = await supabase.from("pontos").select("*", { count: 'exact', head: true });
      const { count: sugestoes } = await supabase.from("sugestoes_pontos").select("*", { count: 'exact', head: true });
      const { count: linhas } = await supabase.from("linhas_trabalho").select("*", { count: 'exact', head: true });
      
      setStats({
        total: total || 0,
        sugestoes: sugestoes || 0,
        linhas: linhas || 0
      });
      setLoading(false);
    }
    carregarEstatisticas();
  }, []);

  const cards = [
    { label: "Pontos no Acervo", valor: stats.total, icon: "📚", cor: "text-blue-400" },
    { label: "Sugestões Pendentes", valor: stats.sugestoes, icon: "✨", cor: "text-amber-400" },
    { label: "Linhas de Trabalho", valor: stats.linhas, icon: "🔱", cor: "text-indigo-400" },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="space-y-1 border-l-4 border-indigo-600 pl-6">
        <h2 className="text-4xl font-black text-slate-100 tracking-tighter uppercase italic">Visão Geral</h2>
        <p className="text-slate-400 font-medium">Controle operacional do Kanzuá Digital.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {cards.map((card, i) => (
          <div key={i} className="bg-slate-900/40 p-10 rounded-[45px] border border-slate-800/50 shadow-2xl flex flex-col items-center text-center gap-4 transition-transform hover:scale-105">
            <span className="text-5xl mb-2">{card.icon}</span>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{card.label}</p>
            {loading ? (
              <div className="h-12 w-12 bg-slate-800 animate-pulse rounded-full" />
            ) : (
              <p className={`text-6xl font-black ${card.cor} tracking-tighter`}>{card.valor}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}