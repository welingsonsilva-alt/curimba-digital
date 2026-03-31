"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image"; // Importante para otimização no Next.js

export default function Home() {
  const [pontos, setPontos] = useState<any[]>([]);
  const [linhas, setLinhas] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroLinha, setFiltroLinha] = useState("TODOS");
  const [pontoAberto, setPontoAberto] = useState<any>(null);
  
  const [mostrarSugestao, setMostrarSugestao] = useState(false);
  const [novaSugestao, setNovaSugestao] = useState({ titulo: "", linha: "", letra: "" });
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    async function carregar() {
      const { data: pts } = await supabase.from("pontos").select("*").eq("aprovado", true).order("titulo");
      const { data: lns } = await supabase.from("linhas_trabalho").select("*").order("nome");
      if (pts) setPontos(pts);
      if (lns) setLinhas(lns);
    }
    carregar();
  }, []);

  const enviarSugestao = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    try {
      const { error } = await supabase.from("sugestoes_pontos").insert([novaSugestao]);
      if (error) throw error;
      alert("Saravá! Sugestão enviada com sucesso.");
      setNovaSugestao({ titulo: "", linha: "", letra: "" });
      setMostrarSugestao(false);
    } catch (err: any) {
      alert("Erro ao enviar: " + err.message);
    } finally {
      setEnviando(false);
    }
  };

  const filtrados = pontos.filter(p => {
    const matchBusca = p.titulo.toLowerCase().includes(busca.toLowerCase());
    const matchLinha = filtroLinha === "TODOS" || p.linha === filtroLinha;
    return matchBusca && matchLinha;
  });

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans pb-10">
      {/* HEADER INTEGRADO COM LOGO REAL */}
      <header className="sticky top-0 z-[80] bg-[#020617]/90 backdrop-blur-2xl border-b border-white/5 px-6 py-5">
         <div className="max-w-3xl mx-auto space-y-6">
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                {/* LOGO DO SITE CARREGADA DE /PUBLIC */}
                <div className="relative w-24 h-24 flex-shrink-0">
                  <img 
                    src="/logo.png" 
                    alt="Logo Curimba Digital" 
                    className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(79,70,229,0.3)]"
                  />
                </div>
                <div>
                  <h1 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-500">Curimba</h1>
                  <h2 className="text-xl font-black uppercase italic tracking-tighter text-white leading-none">Digital</h2>
                </div>
              </div>

              <button 
                onClick={() => setMostrarSugestao(true)}
                className="bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/20 hover:border-indigo-500 px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.15em] text-white transition-all active:scale-95 flex items-center gap-2"
              >
                <span>Indicar Ponto</span>
                <span className="opacity-50 text-xs">+</span>
              </button>
            </div>
            
            {/* SEARCH & FILTER AREA */}
            <div className="flex gap-2 h-12">
               <div className="relative flex-1">
                  <input 
                    placeholder="Qual fundamento você busca?" 
                    value={busca} 
                    onChange={e => setBusca(e.target.value)} 
                    className="w-full h-full bg-white/[0.03] border border-white/10 px-5 rounded-2xl outline-none focus:border-indigo-500/40 text-sm transition-all placeholder:text-slate-600" 
                  />
               </div>
               
               <select 
                 value={filtroLinha} 
                 onChange={e => setFiltroLinha(e.target.value)}
                 className="bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer appearance-none min-w-[110px] text-center"
               >
                 <option value="TODOS" className="bg-[#020617] text-white">Todas</option>
                 {linhas.map(l => (
                   <option key={l.id} value={l.nome} className="bg-[#020617] text-white">
                     {l.nome}
                   </option>
                 ))}
               </select>
            </div>
         </div>
      </header>

      {/* LISTA DE PONTOS */}
      <main className="max-w-3xl mx-auto px-6 mt-6 grid gap-2">
        {filtrados.map(p => (
          <button 
            key={p.id} 
            onClick={() => setPontoAberto(p)} 
            className="group bg-white/[0.02] border border-white/5 p-4 rounded-2xl text-left hover:bg-white/[0.04] hover:border-indigo-500/30 transition-all flex justify-between items-center"
          >
            <div>
              <span className="text-indigo-500 text-[7px] font-black uppercase tracking-[0.2em] block mb-0.5 opacity-70">{p.linha}</span>
              <h3 className="font-bold text-slate-100 text-[15px] tracking-tight group-hover:text-indigo-400 transition-colors">{p.titulo}</h3>
            </div>
            
            <div className="flex gap-2">
              {p.link_youtube && (
                <div className="w-7 h-7 flex items-center justify-center bg-red-500/10 rounded-lg border border-red-500/10">
                   <span className="text-[7px] font-black text-red-500">YT</span>
                </div>
              )}
              {p.link_spotify && (
                <div className="w-7 h-7 flex items-center justify-center bg-green-500/10 rounded-lg border border-green-500/10">
                   <span className="text-[7px] font-black text-green-500">SP</span>
                </div>
              )}
            </div>
          </button>
        ))}
      </main>

      {/* MODAL DE LEITURA (PREMIUM) */}
      {pontoAberto && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="bg-[#0B1120] border border-white/10 rounded-[2.5rem] w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-8 border-b border-white/5 text-center relative">
              <button onClick={() => setPontoAberto(null)} className="absolute right-8 top-8 text-slate-500 hover:text-white text-xl">✕</button>
              <span className="text-indigo-500 text-[10px] font-black uppercase tracking-widest mb-1 block">{pontoAberto.linha}</span>
              <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">{pontoAberto.titulo}</h2>
            </div>
            <div className="p-10 overflow-y-auto flex-1 text-center">
              <pre className="whitespace-pre-wrap font-serif text-lg italic leading-relaxed text-slate-200">
                {pontoAberto.letra}
              </pre>
            </div>
            <div className="p-8 border-t border-white/5 bg-slate-950/50 flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  {pontoAberto.link_youtube && <a href={pontoAberto.link_youtube} target="_blank" className="bg-red-600/10 text-red-500 border border-red-500/20 py-3.5 rounded-xl font-black text-[9px] uppercase tracking-widest text-center hover:bg-red-600/20">YouTube</a>}
                  {pontoAberto.link_spotify && <a href={pontoAberto.link_spotify} target="_blank" className="bg-green-600/10 text-green-500 border border-green-500/20 py-3.5 rounded-xl font-black text-[9px] uppercase tracking-widest text-center hover:bg-green-600/20">Spotify</a>}
                </div>
                <button 
                  onClick={() => {
                    const texto = `*${pontoAberto.titulo}* (%23CurimbaDigital)%0A%0A${pontoAberto.letra}%0A%0Ahttps://curimba-digital.vercel.app`;
                    window.open(`https://api.whatsapp.com/send?text=${texto}`, "_blank");
                  }} 
                  className="bg-indigo-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                >
                  Compartilhar no WhatsApp
                </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE SUGESTÃO */}
      {mostrarSugestao && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={enviarSugestao} className="bg-[#0B1120] border border-white/10 rounded-[2.5rem] w-full max-w-md p-8 shadow-3xl flex flex-col gap-5">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-black uppercase italic text-white tracking-tighter">Colaborar</h2>
              <button type="button" onClick={() => setMostrarSugestao(false)} className="text-slate-500 text-2xl">✕</button>
            </div>
            <input required placeholder="Título do fundamento" value={novaSugestao.titulo} onChange={e => setNovaSugestao({...novaSugestao, titulo: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white text-sm outline-none focus:border-indigo-500/50 transition-all" />
            <select required value={novaSugestao.linha} onChange={e => setNovaSugestao({...novaSugestao, linha: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white text-[10px] font-black uppercase tracking-widest">
              <option value="">Qual a Linha?</option>
              {linhas.map(l => <option key={l.id} value={l.nome} className="bg-slate-900">{l.nome}</option>)}
            </select>
            <textarea required rows={5} placeholder="Letra do ponto..." value={novaSugestao.letra} onChange={e => setNovaSugestao({...novaSugestao, letra: e.target.value})} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white italic text-sm outline-none focus:border-indigo-500/50 resize-none transition-all" />
            <button type="submit" disabled={enviando} className="bg-indigo-600 py-4 rounded-xl text-white font-black uppercase text-[10px] tracking-widest disabled:opacity-50 transition-all active:scale-95">
              {enviando ? "ENVIANDO..." : "ENVIAR PARA ANÁLISE"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}