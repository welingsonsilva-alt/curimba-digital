"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [pontos, setPontos] = useState<any[]>([]);
  const [linhas, setLinhas] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroLinha, setFiltroLinha] = useState("TODOS");
  const [pontoAberto, setPontoAberto] = useState<any>(null);
  
  // Modais de Sugestão
  const [mostrarSugestao, setMostrarSugestao] = useState(false);
  const [mostrarExtra, setMostrarExtra] = useState(false);
  const [novaSugestao, setNovaSugestao] = useState({ titulo: "", linha: "", letra: "" });
  const [extraMsg, setExtraMsg] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    async function inicializar() {
      const { data: pts } = await supabase.from("pontos").select("*").eq("aprovado", true).order("titulo");
      const { data: lns } = await supabase.from("linhas_trabalho").select("*").order("nome");
      
      if (pts) {
        setPontos(pts);
        const params = new URLSearchParams(window.location.search);
        const idPonto = params.get('p');
        if (idPonto) {
          const encontrado = pts.find(p => p.id === idPonto);
          if (encontrado) setPontoAberto(encontrado);
        }
      }
      if (lns) setLinhas(lns);

      // Contador de Acessos (Trava 1h)
      const AGORA = new Date().getTime();
      const UMA_HORA = 60 * 60 * 1000;
      const ultimaVisita = localStorage.getItem("ultima_visita_curimba");
      if (!ultimaVisita || (AGORA - parseInt(ultimaVisita)) > UMA_HORA) {
        const hoje = new Date().toLocaleDateString('en-CA');
        await supabase.rpc('incrementar_acesso', { dia_atual: hoje });
        localStorage.setItem("ultima_visita_curimba", AGORA.toString());
      }
    }
    inicializar();
  }, []);

  const enviarExtra = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    const { error } = await supabase.from("sugestoes_extras").insert([{ mensagem: extraMsg }]);
    if (!error) {
      alert("Saravá! Sua sugestão de melhoria foi enviada.");
      setExtraMsg("");
      setMostrarExtra(false);
    }
    setEnviando(false);
  };

  const filtrados = pontos.filter(p => (
    p.titulo.toLowerCase().includes(busca.toLowerCase()) &&
    (filtroLinha === "TODOS" || p.linha === filtroLinha)
  ));

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans pb-10">
      <header className="sticky top-0 z-[80] bg-[#020617]/90 backdrop-blur-2xl border-b border-white/5 px-6 py-5">
         <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <img src="/logo.png" className="w-12 h-12 object-contain" />
                <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">Curimba <span className="text-indigo-500">Digital</span></h2>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setMostrarExtra(true)} className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl text-[9px] font-black uppercase text-slate-400 hover:text-white transition-all">Sugerir Melhoria</button>
                <button onClick={() => setMostrarSugestao(true)} className="bg-indigo-600 px-5 py-3 rounded-2xl text-[9px] font-black uppercase text-white shadow-lg shadow-indigo-600/20">Novo Ponto +</button>
              </div>
            </div>
            <div className="flex gap-2 h-12">
               <input placeholder="Pesquisar..." value={busca} onChange={e => setBusca(e.target.value)} className="flex-1 bg-white/[0.03] border border-white/10 px-5 rounded-2xl outline-none text-sm" />
               <select value={filtroLinha} onChange={e => setFiltroLinha(e.target.value)} className="bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 px-4 rounded-2xl text-[10px] font-black uppercase outline-none">
                 <option value="TODOS">Todas as Linhas</option>
                 {linhas.map(l => <option key={l.id} value={l.nome} className="bg-[#020617]">{l.nome}</option>)}
               </select>
            </div>
         </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 mt-6 grid gap-2">
        {filtrados.map(p => (
          <button key={p.id} onClick={() => setPontoAberto(p)} className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl text-left hover:bg-white/[0.04] flex justify-between items-center transition-all">
            <div>
              <span className="text-indigo-500 text-[7px] font-black uppercase block mb-0.5">{p.linha}</span>
              <h3 className="font-bold text-[15px]">{p.titulo}</h3>
            </div>
            <div className="flex gap-2">
              {p.link_youtube && <div className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-[0_0_5px_red]"></div>}
              {p.link_spotify && <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_green]"></div>}
            </div>
          </button>
        ))}
      </main>

      {/* MODAL SUGESTÃO EXTRA */}
      {mostrarExtra && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={enviarExtra} className="bg-[#0B1120] border border-white/10 rounded-[2.5rem] w-full max-w-md p-8 flex flex-col gap-5">
             <h2 className="text-lg font-black uppercase italic text-white">Como podemos melhorar?</h2>
             <textarea required placeholder="Sua sugestão ou crítica..." value={extraMsg} onChange={e => setExtraMsg(e.target.value)} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white text-sm outline-none resize-none h-40" />
             <div className="flex gap-3">
               <button type="button" onClick={() => setMostrarExtra(false)} className="flex-1 text-[10px] font-black uppercase text-slate-500">Cancelar</button>
               <button type="submit" disabled={enviando} className="flex-[2] bg-indigo-600 py-4 rounded-xl text-white font-black uppercase text-[10px]">{enviando ? "Enviando..." : "Enviar Feedback"}</button>
             </div>
          </form>
        </div>
      )}

      {/* ... (Modais de PontoAberto e IndicarPonto seguem a mesma lógica anterior) */}
    </div>
  );
}