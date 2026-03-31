"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [pontos, setPontos] = useState<any[]>([]);
  const [linhas, setLinhas] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroLinha, setFiltroLinha] = useState("TODOS");
  const [pontoAberto, setPontoAberto] = useState<any>(null);
  
  // Estados para o Formulário de Sugestão
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
      alert("Saravá! Sugestão enviada para análise do administrador.");
      setNovaSugestao({ titulo: "", linha: "", letra: "" });
      setMostrarSugestao(false);
    } catch (err: any) {
      alert("Erro ao enviar: " + err.message);
    } finally {
      setEnviando(false);
    }
  };

  const compartilharZap = (p: any) => {
    const texto = `*${p.titulo}* (%23CurimbaDigital)%0A%0A${p.letra}%0A%0Ahttps://curimba-digital.vercel.app`;
    window.open(`https://api.whatsapp.com/send?text=${texto}`, "_blank");
  };

  const filtrados = pontos.filter(p => {
    const matchBusca = p.titulo.toLowerCase().includes(busca.toLowerCase());
    const matchLinha = filtroLinha === "TODOS" || p.linha === filtroLinha;
    return matchBusca && matchLinha;
  });

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 font-sans pb-32">
      <header className="sticky top-0 z-[80] bg-[#0B1120]/90 backdrop-blur-xl border-b border-white/5 p-6 text-center">
         <h1 className="text-xl font-black uppercase italic tracking-tighter">Curimba <span className="text-indigo-500">Digital</span></h1>
         <div className="max-w-xl mx-auto mt-6 flex flex-col gap-2">
            <input placeholder="Buscar fundamento..." value={busca} onChange={e => setBusca(e.target.value)} className="bg-slate-900 border border-white/5 p-4 rounded-2xl outline-none focus:border-indigo-500 text-sm" />
            <select value={filtroLinha} onChange={e => setFiltroLinha(e.target.value)} className="bg-slate-900 border border-white/5 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none">
              <option value="TODOS">Todas as Linhas</option>
              {linhas.map(l => <option key={l.id} value={l.nome}>{l.nome}</option>)}
            </select>
         </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 mt-8 grid gap-3">
        {filtrados.map(p => (
          <button key={p.id} onClick={() => setPontoAberto(p)} className="bg-slate-900/50 border border-white/5 p-5 rounded-3xl text-left hover:border-indigo-500/50 transition-all group">
            <span className="text-indigo-400 text-[8px] font-black uppercase tracking-widest block mb-1">{p.linha}</span>
            <h3 className="font-black uppercase italic text-white tracking-tighter group-hover:text-indigo-400">{p.titulo}</h3>
          </button>
        ))}
      </main>

      {/* BOTÃO FLUTUANTE PARA INDICAR PONTO */}
      <button 
        onClick={() => setMostrarSugestao(true)}
        className="fixed bottom-8 right-8 z-[90] bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-indigo-600/40 flex items-center gap-3 transition-all active:scale-95"
      >
        <span className="text-lg">+</span> Indicar Ponto
      </button>

      {/* MODAL DE LEITURA */}
      {pontoAberto && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
          <div className="bg-[#0B1120] border border-white/10 rounded-[40px] w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-8 border-b border-white/5 text-center relative">
              <button onClick={() => setPontoAberto(null)} className="absolute right-8 top-8 text-slate-500 text-2xl">✕</button>
              <span className="text-indigo-500 text-[10px] font-black uppercase tracking-widest mb-2 block">{pontoAberto.linha}</span>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white px-6">{pontoAberto.titulo}</h2>
            </div>
            <div className="p-10 overflow-y-auto flex-1 text-center font-serif text-xl italic leading-relaxed text-slate-200">
              <pre className="whitespace-pre-wrap">{pontoAberto.letra}</pre>
            </div>
            <div className="p-8 border-t border-white/5 flex flex-col gap-3 bg-slate-900/60">
              <div className="grid grid-cols-2 gap-3">
                {pontoAberto.link_youtube && <a href={pontoAberto.link_youtube} target="_blank" className="bg-red-600/10 text-red-500 border border-red-500/20 py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest text-center">YouTube</a>}
                {pontoAberto.link_spotify && <a href={pontoAberto.link_spotify} target="_blank" className="bg-green-600/10 text-green-500 border border-green-500/20 py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest text-center">Spotify</a>}
              </div>
              <button onClick={() => compartilharZap(pontoAberto)} className="bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">Compartilhar Letra</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ENVIAR SUGESTÃO */}
      {mostrarSugestao && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm">
          <form onSubmit={enviarSugestao} className="bg-[#0B1120] border border-white/10 rounded-[40px] w-full max-w-lg p-8 shadow-3xl flex flex-col gap-5">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-black uppercase italic text-white tracking-tighter">Indicar Fundamento</h2>
              <button type="button" onClick={() => setMostrarSugestao(false)} className="text-slate-500 text-2xl">✕</button>
            </div>
            
            <input required placeholder="Nome do Ponto" value={novaSugestao.titulo} onChange={e => setNovaSugestao({...novaSugestao, titulo: e.target.value})} className="bg-slate-900 border border-white/5 p-4 rounded-2xl text-white outline-none focus:border-indigo-500" />
            
            <select required value={novaSugestao.linha} onChange={e => setNovaSugestao({...novaSugestao, linha: e.target.value})} className="bg-slate-900 border border-white/5 p-4 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest outline-none">
              <option value="">Selecione a Linha...</option>
              {linhas.map(l => <option key={l.id} value={l.nome}>{l.nome}</option>)}
            </select>

            <textarea required rows={6} placeholder="Escreva a letra aqui..." value={novaSugestao.letra} onChange={e => setNovaSugestao({...novaSugestao, letra: e.target.value})} className="bg-slate-900 border border-white/5 p-6 rounded-3xl text-white italic outline-none focus:border-indigo-500" />

            <button type="submit" disabled={enviando} className="bg-indigo-600 py-5 rounded-2xl text-white font-black uppercase text-[11px] tracking-widest mt-2 transition-all active:scale-95 disabled:opacity-50">
              {enviando ? "ENVIANDO..." : "ENVIAR PARA O TERREIRO"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}