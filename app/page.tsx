"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [pontos, setPontos] = useState<any[]>([]);
  const [linhas, setLinhas] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroLinha, setFiltroLinha] = useState("TODOS");
  const [pontoAberto, setPontoAberto] = useState<any>(null);
  
  // ESTADOS DOS MODAIS
  const [mostrarSugestao, setMostrarSugestao] = useState(false);
  const [mostrarExtra, setMostrarExtra] = useState(false);
  
  // ESTADOS DOS FORMULÁRIOS
  const [extraMsg, setExtraMsg] = useState("");
  const [novaSugestao, setNovaSugestao] = useState({ titulo: "", linha: "", letra: "", link_spotify: "" });
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    async function inicializar() {
      const { data: pts } = await supabase.from("pontos").select("*").eq("aprovado", true).order("titulo");
      const { data: lns } = await supabase.from("linhas_trabalho").select("*").order("nome");
      if (pts) setPontos(pts);
      if (lns) setLinhas(lns);
    }
    inicializar();
  }, []);

  // FUNÇÃO ENVIAR MELHORIA
  const enviarExtra = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    const { error } = await supabase.from("sugestoes_extras").insert([{ mensagem: extraMsg }]);
    if (!error) {
      alert("Saravá! Sugestão enviada.");
      setExtraMsg("");
      setMostrarExtra(false);
    }
    setEnviando(false);
  };

  // FUNÇÃO ENVIAR NOVO PONTO
  const enviarSugestao = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    const { error } = await supabase.from("sugestoes_pontos").insert([novaSugestao]);
    if (!error) {
      alert("Ponto enviado para análise!");
      setNovaSugestao({ titulo: "", linha: "", letra: "", link_spotify: "" });
      setMostrarSugestao(false);
    }
    setEnviando(false);
  };

  const filtrados = pontos.filter(p => (
    p.titulo.toLowerCase().includes(busca.toLowerCase()) &&
    (filtroLinha === "TODOS" || p.linha === filtroLinha)
  ));

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans pb-10">
      
      {/* HEADER RESPONSIVO */}
      <header className="sticky top-0 z-[80] bg-[#020617]/95 backdrop-blur-xl border-b border-white/5 px-4 py-4 md:px-6 md:py-6">
         <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img src="/logo.png" className="w-12 h-12 md:w-16 md:h-16 object-contain" alt="Logo" />
                <div>
                  <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 leading-none mb-1">Curimba</h1>
                  <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-white leading-none">Digital</h2>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setMostrarExtra(true)} className="bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-[9px] font-black uppercase text-slate-400">Melhorias</button>
                <button onClick={() => setMostrarSugestao(true)} className="bg-indigo-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase text-white shadow-lg shadow-indigo-600/20">Indicar Ponto +</button>
              </div>
            </div>
            <div className="flex gap-2 h-11">
               <input placeholder="Procurar ponto..." value={busca} onChange={e => setBusca(e.target.value)} className="flex-1 bg-white/[0.04] border border-white/10 px-4 rounded-xl outline-none text-sm focus:border-indigo-500/50" />
               <select value={filtroLinha} onChange={e => setFiltroLinha(e.target.value)} className="bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 px-2 rounded-xl text-[9px] font-black uppercase outline-none">
                 <option value="TODOS">Todas</option>
                 {linhas.map(l => <option key={l.id} value={l.nome}>{l.nome}</option>)}
               </select>
            </div>
         </div>
      </header>

      {/* LISTAGEM */}
      <main className="max-w-3xl mx-auto px-4 mt-6 grid gap-2">
        {filtrados.map(p => (
          <button key={p.id} onClick={() => setPontoAberto(p)} className="group bg-white/[0.02] border border-white/5 p-4 rounded-2xl text-left hover:bg-white/[0.04] transition-all flex justify-between items-center">
            <div>
              <span className="text-indigo-500 text-[7px] font-black uppercase block mb-1">{p.linha}</span>
              <h3 className="font-bold text-slate-100 text-[15px]">{p.titulo}</h3>
            </div>
            <div className="flex gap-2.5">
              {p.link_youtube && <svg className="w-5 h-5 text-red-600 fill-current opacity-80" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 4-8 4z"/></svg>}
              {p.link_spotify && <svg className="w-5 h-5 text-green-500 fill-current opacity-80" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.508 17.302c-.219.359-.687.474-1.046.255-2.898-1.771-6.547-2.171-10.843-1.187-.412.095-.824-.162-.919-.573-.094-.412.163-.824.573-.919 4.707-1.074 8.745-.614 12.02 1.39.359.22.474.688.255 1.046l-.04.089zm1.47-3.253c-.276.449-.863.593-1.312.317-3.317-2.039-8.373-2.634-12.298-1.442-.505.153-1.036-.133-1.189-.638-.153-.505.133-1.036.638-1.189 4.49-1.362 10.063-.699 13.884 1.649.449.276.593.863.317 1.312l-.04.091zm.126-3.41c-3.98-2.362-10.539-2.578-14.331-1.425-.61.185-1.251-.167-1.436-.777-.185-.61.167-1.251.777-1.436 4.354-1.321 11.583-1.066 16.155 1.646.549.326.73 1.039.404 1.588-.326.549-1.039.73-1.588.404l-.001-.001z"/></svg>}
            </div>
          </button>
        ))}
      </main>

      {/* MODAL DE LEITURA */}
      {pontoAberto && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-[#0B1120] border-t sm:border border-white/10 rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/5 text-center relative">
              <button onClick={() => setPontoAberto(null)} className="absolute right-6 top-6 text-slate-500 text-xl">✕</button>
              <span className="text-indigo-500 text-[9px] font-black uppercase mb-1 block">{pontoAberto.linha}</span>
              <h2 className="text-lg font-black italic uppercase text-white">{pontoAberto.titulo}</h2>
            </div>
            <div className="p-8 overflow-y-auto flex-1 text-center bg-slate-950/20">
              <pre className="whitespace-pre-wrap font-serif text-lg italic leading-relaxed text-slate-100 pb-10">
                {pontoAberto.letra}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE MELHORIAS */}
      {mostrarExtra && (
        <div className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center p-4">
          <div className="bg-[#0B1120] border border-white/10 rounded-[2rem] w-full max-w-md p-8 flex flex-col gap-6">
             <div className="flex justify-between items-center"><h2 className="text-lg font-black uppercase italic text-white tracking-tighter">Sugestão</h2><button onClick={() => setMostrarExtra(false)} className="text-slate-500 text-2xl">✕</button></div>
             <textarea required placeholder="Como podemos melhorar?" value={extraMsg} onChange={e => setExtraMsg(e.target.value)} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white text-sm outline-none resize-none h-40" />
             <button onClick={enviarExtra} disabled={enviando} className="bg-indigo-600 py-4 rounded-xl text-white font-black uppercase text-[10px] tracking-widest">{enviando ? "ENVIANDO..." : "ENVIAR FEEDBACK"}</button>
          </div>
        </div>
      )}

      {/* MODAL DE INDICAR PONTO (RESTURADO AGORA!) */}
      {mostrarSugestao && (
        <div className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center p-4">
          <form onSubmit={enviarSugestao} className="bg-[#0B1120] border border-white/10 rounded-[2rem] w-full max-w-md p-8 flex flex-col gap-4">
            <div className="flex justify-between items-center"><h2 className="text-lg font-black uppercase italic text-white tracking-tighter">Indicar Ponto</h2><button type="button" onClick={() => setMostrarSugestao(false)} className="text-slate-500 text-2xl">✕</button></div>
            <input required placeholder="Título do Ponto" value={novaSugestao.titulo} onChange={e => setNovaSugestao({...novaSugestao, titulo: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white text-sm outline-none" />
            <select required value={novaSugestao.linha} onChange={e => setNovaSugestao({...novaSugestao, linha: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white text-[10px] font-black uppercase outline-none">
              <option value="">Selecione a Linha</option>
              {linhas.map(l => <option key={l.id} value={l.nome} className="bg-slate-900">{l.nome}</option>)}
            </select>
            <textarea required rows={5} placeholder="Letra do ponto..." value={novaSugestao.letra} onChange={e => setNovaSugestao({...novaSugestao, letra: e.target.value})} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white text-sm outline-none resize-none" />
            <button type="submit" disabled={enviando} className="bg-indigo-600 py-4 rounded-xl text-white font-black uppercase text-[10px] tracking-widest">{enviando ? "ENVIANDO..." : "ENVIAR PONTO"}</button>
          </form>
        </div>
      )}

    </div>
  );
}