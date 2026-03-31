"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [pontos, setPontos] = useState<any[]>([]);
  const [linhas, setLinhas] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroLinha, setFiltroLinha] = useState("TODOS");
  const [pontoAberto, setPontoAberto] = useState<any>(null);
  
  const [mostrarSugestao, setMostrarSugestao] = useState(false);
  const [mostrarExtra, setMostrarExtra] = useState(false);
  const [extraMsg, setExtraMsg] = useState("");
  const [novaSugestao, setNovaSugestao] = useState({ titulo: "", linha: "", letra: "", link_spotify: "" });
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
    }
    inicializar();
  }, []);

  const filtrados = pontos.filter(p => (
    p.titulo.toLowerCase().includes(busca.toLowerCase()) &&
    (filtroLinha === "TODOS" || p.linha === filtroLinha)
  ));

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans pb-10">
      
      {/* HEADER RESPONSIVO */}
      <header className="sticky top-0 z-[80] bg-[#020617]/95 backdrop-blur-xl border-b border-white/5 px-4 py-4 md:px-6 md:py-6">
         <div className="max-w-3xl mx-auto space-y-4 md:space-y-8">
            
            {/* Linha Superior: Logo + Botões */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
              <div className="flex items-center gap-3 md:gap-6">
                {/* Logo que se ajusta: w-12 no mobile, w-20 no desktop */}
                <img src="/logo.png" className="w-12 h-12 md:w-20 md:h-20 object-contain shadow-2xl" alt="Logo Orun" />
                <div>
                  <h1 className="text-[10px] md:text-sm font-black uppercase tracking-[0.3em] text-indigo-500 leading-none mb-1">Curimba</h1>
                  <h2 className="text-xl md:text-3xl font-black uppercase italic tracking-tighter text-white leading-none">Digital</h2>
                </div>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <button onClick={() => setMostrarExtra(true)} className="flex-1 sm:flex-none bg-white/5 border border-white/10 px-3 py-2.5 rounded-xl text-[9px] font-black uppercase text-slate-400">Melhorias</button>
                <button onClick={() => setMostrarSugestao(true)} className="flex-[2] sm:flex-none bg-indigo-600 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase text-white shadow-lg shadow-indigo-600/30">Indicar Ponto +</button>
              </div>
            </div>

            {/* Barra de Busca e Filtro */}
            <div className="flex gap-2 h-11 md:h-14">
               <input 
                 placeholder="Procurar fundamento..." 
                 value={busca} 
                 onChange={e => setBusca(e.target.value)} 
                 className="flex-1 bg-white/[0.04] border border-white/10 px-4 rounded-xl outline-none text-sm md:text-base focus:border-indigo-500/50" 
               />
               <select 
                 value={filtroLinha} 
                 onChange={e => setFiltroLinha(e.target.value)} 
                 className="bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 px-2 md:px-4 rounded-xl text-[9px] md:text-[11px] font-black uppercase outline-none"
               >
                 <option value="TODOS">Todas</option>
                 {linhas.map(l => <option key={l.id} value={l.nome} className="bg-[#020617]">{l.nome}</option>)}
               </select>
            </div>
         </div>
      </header>

      {/* LISTAGEM DE PONTOS */}
      <main className="max-w-3xl mx-auto px-4 mt-6 grid gap-2 md:gap-3">
        {filtrados.map(p => (
          <button key={p.id} onClick={() => setPontoAberto(p)} className="group bg-white/[0.02] border border-white/5 p-4 md:p-5 rounded-2xl md:rounded-3xl text-left hover:bg-white/[0.05] hover:border-indigo-500/40 transition-all flex justify-between items-center">
            <div className="max-w-[75%]">
              <span className="text-indigo-500 text-[7px] md:text-[8px] font-black uppercase block mb-1 opacity-80">{p.linha}</span>
              <h3 className="font-bold text-slate-100 text-sm md:text-lg tracking-tight truncate">{p.titulo}</h3>
            </div>
            <div className="flex gap-2 md:gap-3">
              {p.link_youtube && (
                <svg className="w-5 h-5 md:w-6 md:h-6 text-red-600 fill-current" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 4-8 4z"/></svg>
              )}
              {p.link_spotify && (
                <svg className="w-5 h-5 md:w-6 md:h-6 text-green-500 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.508 17.302c-.219.359-.687.474-1.046.255-2.898-1.771-6.547-2.171-10.843-1.187-.412.095-.824-.162-.919-.573-.094-.412.163-.824.573-.919 4.707-1.074 8.745-.614 12.02 1.39.359.22.474.688.255 1.046l-.04.089zm1.47-3.253c-.276.449-.863.593-1.312.317-3.317-2.039-8.373-2.634-12.298-1.442-.505.153-1.036-.133-1.189-.638-.153-.505.133-1.036.638-1.189 4.49-1.362 10.063-.699 13.884 1.649.449.276.593.863.317 1.312l-.04.091zm.126-3.41c-3.98-2.362-10.539-2.578-14.331-1.425-.61.185-1.251-.167-1.436-.777-.185-.61.167-1.251.777-1.436 4.354-1.321 11.583-1.066 16.155 1.646.549.326.73 1.039.404 1.588-.326.549-1.039.73-1.588.404l-.001-.001z"/></svg>
              )}
            </div>
          </button>
        ))}
      </main>

      {/* MODAL DE LEITURA (ESTILO MOBILE CARD) */}
      {pontoAberto && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-[#0B1120] border-t sm:border border-white/10 rounded-t-[2rem] sm:rounded-[2.5rem] w-full max-w-lg max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
            
            {/* Header do Modal */}
            <div className="p-6 md:p-8 border-b border-white/5 text-center relative">
              <button onClick={() => setPontoAberto(null)} className="absolute right-6 top-6 text-slate-500 text-xl">✕</button>
              <span className="text-indigo-500 text-[10px] font-black uppercase mb-1 block">{pontoAberto.linha}</span>
              <h2 className="text-lg md:text-2xl font-black italic uppercase text-white tracking-tighter">{pontoAberto.titulo}</h2>
            </div>

            {/* Conteúdo (Letra) */}
            <div className="p-8 md:p-12 overflow-y-auto flex-1 text-center bg-slate-950/20">
              <pre className="whitespace-pre-wrap font-serif text-lg md:text-xl italic leading-relaxed text-slate-100 pb-10">
                {pontoAberto.letra}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}