"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// ESTA INTERFACE É O QUE RESOLVE O ERRO DO VERCEL:
interface DashboardProps {
  acessos: number;
}

export default function Dashboard({ acessos }: DashboardProps) {
  const [totalPontos, setTotalPontos] = useState(0);
  const [totalSugestoes, setTotalSugestoes] = useState(0);
  const [distribuicao, setDistribuicao] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      // 1. Total de Pontos Aprovados
      const { count: ptsCount } = await supabase
        .from("pontos")
        .select("*", { count: 'exact', head: true })
        .eq("aprovado", true);
      
      setTotalPontos(ptsCount || 0);

      // 2. Total de Sugestões Pendentes
      const { count: sugCount } = await supabase
        .from("sugestoes_pontos")
        .select("*", { count: 'exact', head: true });
      
      setTotalSugestoes(sugCount || 0);

      // 3. Distribuição por Linha
      const { data: pts } = await supabase
        .from("pontos")
        .select("linha")
        .eq("aprovado", true);

      if (pts) {
        const contagem: any = {};
        pts.forEach(p => {
          contagem[p.linha] = (contagem[p.linha] || 0) + 1;
        });
        
        const listaFormatada = Object.keys(contagem).map(linha => ({
          nome: linha,
          total: contagem[linha]
        })).sort((a, b) => b.total - a.total);
        
        setDistribuicao(listaFormatada);
      }
      setLoading(false);
    }

    carregarDados();
  }, []);

  if (loading) return <div className="text-[10px] font-black uppercase text-slate-500 animate-pulse">Sincronizando Dados Orun...</div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* INDICADORES DE TOPO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Total */}
        <div className="bg-white/5 border border-white/5 rounded-[32px] p-8 flex justify-between items-start group hover:border-indigo-500/20 transition-all">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Total na Biblioteca</span>
            <h4 className="text-4xl font-black mt-2 tracking-tighter text-white">{totalPontos}</h4>
          </div>
          <div className="bg-indigo-600/10 p-3 rounded-xl text-indigo-400">📚</div>
        </div>
        
        {/* Card Acessos (DADO QUE VEM VIA PROPS) */}
        <div className="bg-white/5 border border-white/5 rounded-[32px] p-8 flex justify-between items-start group hover:border-indigo-500/20 transition-all">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Acessos Hoje (Únicos)</span>
            <h4 className="text-4xl font-black mt-2 tracking-tighter text-white">{acessos}</h4>
          </div>
          <div className="bg-indigo-600/10 p-3 rounded-xl text-indigo-400">👥</div>
        </div>

        {/* Card Sugestões */}
        <div className="bg-white/5 border border-white/5 rounded-[32px] p-8 flex justify-between items-start group hover:border-indigo-500/20 transition-all">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Novas Sugestões</span>
            <h4 className={`text-4xl font-black mt-2 tracking-tighter ${totalSugestoes > 0 ? 'text-indigo-400' : 'text-white'}`}>
              {totalSugestoes}
            </h4>
          </div>
          <div className="bg-indigo-600/10 p-3 rounded-xl text-indigo-400">✨</div>
        </div>
      </div>

      {/* LISTAGEM DE DISTRIBUIÇÃO */}
      <section className="bg-white/[0.02] border border-white/5 rounded-[40px] p-10">
        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500 mb-8">Distribuição por Linha</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
          {distribuicao.map((item) => (
            <div key={item.nome} className="flex justify-between items-center py-3 border-b border-white/5 group">
              <span className="text-xs font-bold uppercase text-slate-300 group-hover:text-white transition-colors">{item.nome}</span>
              <div className="flex items-center gap-4">
                <div className="h-1 w-24 bg-white/5 rounded-full overflow-hidden hidden sm:block">
                  <div 
                    className="h-full bg-indigo-600" 
                    style={{ width: `${(item.total / totalPontos) * 100}%` }}
                  ></div>
                </div>
                <span className="text-[11px] font-black text-indigo-400 min-w-[30px] text-right">{item.total}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER DO DASHBOARD */}
      <div className="flex justify-center opacity-20">
        <img src="/logo.png" className="w-10 h-10 grayscale" />
      </div>

    </div>
  );
}