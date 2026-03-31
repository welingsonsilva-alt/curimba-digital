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
  const [mostrarExtra, setMostrarExtra] = useState(false); // ESTADO RESTAURADO
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

      // Contador de Acessos (1h de trava)
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

  const enviarSugestao = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await supabase.from("sugestoes_pontos").insert([novaSugestao]);
      alert("Saravá! Sugestão enviada.");
      setNovaSugestao({ titulo: "", linha: "", letra: "", link_spotify: "" });
      setMostrarSugestao(false);
    } catch (err) { alert("Erro ao enviar."); } 
    finally { setEnviando(false); }
  };

  // FUNÇÃO RESTAURADA: Envio de Melhorias
  const enviarExtra = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    const { error } = await supabase.from("sugestoes_extras").insert([{ mensagem: extraMsg }]);
    if (!error) {
      alert("Sugestão de melhoria enviada!");
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
                <img src="/logo.png" className="w-26 h-26 object-contain" />
                <div>
                  <h1 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-500 mb-1">Curimba</h1>
                  <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">Digital</h2>
                </div>
              </div>
              <div className="flex gap-2">
                {/* BOTÃO RESTAURADO */}
                <button onClick={() => setMostrarExtra(true)} className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl text-[9px] font-black uppercase text-slate-400 hover:text-white transition-all">Sugerir Melhoria</button>
                <button onClick={() => setMostrarSugestao(true)} className="bg-indigo-600 px-5 py-3 rounded-2xl text-[9px] font-black uppercase text-white shadow-lg shadow-indigo-600/20">Novo Ponto</button>
              </div>
            </div>
            <div className="flex gap-2 h-12">
               <input placeholder="O que vamos cantar hoje?" value={busca} onChange={e => setBusca(e.target.value)} className="flex-1 bg-white/[0.03] border border-white/10 px-5 rounded-2xl outline-none text-sm focus:border-indigo-500/40" />
               <select value={filtroLinha} onChange={e => setFiltroLinha(e.target.value)} className="bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 px-4 rounded-2xl text-[10px] font-black uppercase outline-none">
                 <option value="TODOS">Todas</option>
                 {linhas.map(l => <option key={l.id} value={l.nome} className="bg-[#020617]">{l.nome}</option>)}
               </select>
            </div>
         </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 mt-6 grid gap-2">
        {filtrados.map(p => (
          <button key={p.id} onClick={() => setPontoAberto(p)} className="group bg-white/[0.02] border border-white/5 p-4 rounded-2xl text-left hover:bg-white/[0.04] hover:border-indigo-500/30 transition-all flex justify-between items-center">
            <div>
              <span className="text-indigo-500 text-[7px] font-black uppercase block mb-0.5 opacity-70">{p.linha}</span>
              <h3 className="font-bold text-slate-100 text-[15px]">{p.titulo}</h3>
            </div>
            
            {/* ÍCONES SVG RESTAURADOS (FUNCIONAM NO APK) */}
            <div className="flex gap-2.5">
              {p.link_youtube && (
                <svg className="w-5 h-5 text-red-600 fill-current opacity-80" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 4-8 4z"/></svg>
              )}
              {p.link_spotify && (
                <svg className="w-5 h-5 text-green-500 fill-current opacity-80" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.508 17.302c-.219.359-.687.474-1.046.255-2.898-1.771-6.547-2.171-10.843-1.187-.412.095-.824-.162-.919-.573-.094-.412.163-.824.573-.919 4.707-1.074 8.745-.614 12.02 1.39.359.22.474.688.255 1.046l-.04.089zm1.47-3.253c-.276.449-.863.593-1.312.317-3.317-2.039-8.373-2.634-12.298-1.442-.505.153-1.036-.133-1.189-.638-.153-.505.133-1.036.638-1.189 4.49-1.362 10.063-.699 13.884 1.649.449.276.593.863.317 1.312l-.04.091zm.126-3.41c-3.98-2.362-10.539-2.578-14.331-1.425-.61.185-1.251-.167-1.436-.777-.185-.61.167-1.251.777-1.436 4.354-1.321 11.583-1.066 16.155 1.646.549.326.73 1.039.404 1.588-.326.549-1.039.73-1.588.404l-.001-.001z"/></svg>
              )}
            </div>
          </button>
        ))}
      </main>

      {/* MODAL DE LEITURA (RESTURADO COM COMPATIBILIDADE APK) */}
      {pontoAberto && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="bg-[#0B1120] border border-white/10 rounded-[2.5rem] w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-8 border-b border-white/5 text-center relative">
              <button onClick={() => { setPontoAberto(null); window.history.pushState({}, "", "/"); }} className="absolute right-8 top-8 text-slate-500 text-xl hover:text-white transition-colors">✕</button>
              <span className="text-indigo-500 text-[10px] font-black uppercase tracking-widest mb-1 block">{pontoAberto.linha}</span>
              <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">{pontoAberto.titulo}</h2>
            </div>
            <div className="p-10 overflow-y-auto flex-1 text-center bg-slate-950/10">
              <pre className="whitespace-pre-wrap font-serif text-lg italic leading-relaxed text-slate-200">
                {pontoAberto.letra}
              </pre>
            </div>
            <div className="p-8 border-t border-white/5 bg-slate-950/50 flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  {pontoAberto.link_youtube && (
                    <a 
                      href={pontoAberto.link_youtube} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-red-600/10 text-red-500 border border-red-500/20 py-3.5 rounded-xl font-black text-[9px] uppercase tracking-widest text-center flex items-center justify-center gap-2"
                    >
                      YouTube
                    </a>
                  )}
                  {pontoAberto.link_spotify && (
                    <a 
                      href={pontoAberto.link_spotify} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-green-600/10 text-green-500 border border-green-500/20 py-3.5 rounded-xl font-black text-[9px] uppercase tracking-widest text-center flex items-center justify-center gap-2"
                    >
                      Spotify
                    </a>
                  )}
                </div>
                <button 
                  onClick={() => {
                    const linkPonto = `${window.location.origin}?p=${pontoAberto.id}`;
                    const texto = `*${pontoAberto.titulo}*%0A%0A${pontoAberto.letra}%0A%0AConfira: ${linkPonto}`;
                    window.open(`https://api.whatsapp.com/send?text=${texto}`, "_blank");
                  }} 
                  className="bg-indigo-600 text-white py-4 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                >
                  Compartilhar no WhatsApp
                </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE SUGESTÃO EXTRA (RESTAURADO) */}
      {mostrarExtra && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
          <form onSubmit={enviarExtra} className="bg-[#0B1120] border border-white/10 rounded-[2.5rem] w-full max-w-md p-8 flex flex-col gap-5 shadow-3xl">
             <h2 className="text-lg font-black uppercase italic text-white tracking-tighter">Sugerir Melhoria</h2>
             <textarea required placeholder="Sua sugestão ou crítica..." value={extraMsg} onChange={e => setExtraMsg(e.target.value)} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white text-sm outline-none resize-none h-40 focus:border-indigo-500/40" />
             <div className="flex gap-3">
               <button type="button" onClick={() => setMostrarExtra(false)} className="flex-1 text-[10px] font-black uppercase text-slate-500">Cancelar</button>
               <button type="submit" disabled={enviando} className="flex-[2] bg-indigo-600 py-4 rounded-xl text-white font-black uppercase text-[10px]">{enviando ? "Enviando..." : "Enviar Feedback"}</button>
             </div>
          </form>
        </div>
      )}

      {/* MODAL INDICAR PONTO (RESTURADO) */}
      {mostrarSugestao && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={enviarSugestao} className="bg-[#0B1120] border border-white/10 rounded-[2.5rem] w-full max-w-md p-8 shadow-3xl flex flex-col gap-5">
            <div className="flex justify-between items-center"><h2 className="text-lg font-black uppercase italic text-white tracking-tighter">Novo Ponto</h2><button type="button" onClick={() => setMostrarSugestao(false)} className="text-slate-500 text-2xl">✕</button></div>
            <input required placeholder="Título" value={novaSugestao.titulo} onChange={e => setNovaSugestao({...novaSugestao, titulo: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-indigo-500/50" />
            <select required value={novaSugestao.linha} onChange={e => setNovaSugestao({...novaSugestao, linha: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white text-[10px] font-black uppercase">
              <option value="">Qual a Linha?</option>
              {linhas.map(l => <option key={l.id} value={l.nome} className="bg-slate-900">{l.nome}</option>)}
            </select>
            <textarea required rows={5} placeholder="Letra do ponto..." value={novaSugestao.letra} onChange={e => setNovaSugestao({...novaSugestao, letra: e.target.value})} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white italic text-sm outline-none focus:border-indigo-500/50 resize-none" />
            <button type="submit" disabled={enviando} className="bg-indigo-600 py-4 rounded-xl text-white font-black uppercase text-[10px] tracking-widest">{enviando ? "ENVIANDO..." : "ENVIAR PARA ANÁLISE"}</button>
          </form>
        </div>
      )}
    </div>
  );
}
