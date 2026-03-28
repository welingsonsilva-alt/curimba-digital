"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import FormSugerir from "@/components/FormSugerir";

export default function Home() {
  const [pontos, setPontos] = useState<any[]>([]);
  const [linhas, setLinhas] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroLinha, setFiltroLinha] = useState("TODOS");
  const [loading, setLoading] = useState(true);
  const [pontoAberto, setPontoAberto] = useState<any>(null);
  const [modalSugestao, setModalSugestao] = useState(false);

  useEffect(() => {
    async function carregarDados() {
      const { data: pts } = await supabase.from("pontos").select("*").eq("aprovado", true).order("titulo");
      const { data: lns } = await supabase.from("linhas_trabalho").select("*").order("nome");
      
      if (pts) setPontos(pts);
      if (lns) setLinhas(lns);
      setLoading(false);
    }
    carregarDados();
  }, []);

  const filtrados = pontos.filter(p => {
    const matchesBusca = p.titulo.toLowerCase().includes(busca.toLowerCase());
    const matchesLinha = filtroLinha === "TODOS" || p.linha === filtroLinha;
    return matchesBusca && matchesLinha;
  });

  const imprimirPonto = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 font-sans selection:bg-indigo-500/30 pb-20">
      
      {/* HEADER E BUSCA FIXA */}
      <header className="bg-[#0B1120]/95 backdrop-blur-2xl border-b border-slate-800/50 px-6 py-10 sticky top-0 z-50 print:hidden">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="flex justify-between items-center">
            {/* CONTAINER DO LOGO E NOME */}
            <div className="flex items-center gap-4">
              {/* Certifique-se de salvar sua imagem na pasta /public com o nome logo.png ou mude o src abaixo */}
              <img 
                src="/logo.png" 
                alt="Logo Curimba Digital" 
                className="w-24 h-24 object-contain"
              />
              <h1 className="text-3xl font-black tracking-tighter uppercase italic">
                Curimba <span className="text-indigo-500">Digital</span>
              </h1>
            </div>

            <button 
              onClick={() => setModalSugestao(true)}
              className="bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 px-6 py-3 rounded-2xl font-black text-[10px] tracking-widest hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
            >
              + SUGERIR PONTO
            </button>
          </div>

          {/* BARRA DE PESQUISA */}
          <div className="bg-slate-900/60 p-5 rounded-[32px] border border-slate-800 flex items-center gap-4 focus-within:border-indigo-500/50 transition-all shadow-2xl">
            <span className="ml-2 opacity-30 text-2xl">🔍</span>
            <input 
              placeholder="Qual fundamento você procura?"
              className="bg-transparent outline-none font-bold text-xl w-full text-slate-200 placeholder:text-slate-700"
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          {/* GRADE DE FILTROS */}
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            <button
              onClick={() => setFiltroLinha("TODOS")}
              className={`px-5 py-2.5 rounded-xl font-black text-[9px] tracking-[0.2em] transition-all border uppercase ${
                filtroLinha === "TODOS" ? "bg-white text-black border-white" : "bg-slate-900/40 text-slate-500 border-slate-800"
              }`}
            >
              TODOS
            </button>
            {linhas.map((l) => (
              <button
                key={l.id}
                onClick={() => setFiltroLinha(l.nome)}
                className={`px-5 py-2.5 rounded-xl font-black text-[9px] tracking-[0.2em] transition-all border uppercase ${
                  filtroLinha === l.nome ? "bg-indigo-600 text-white border-indigo-500 shadow-lg" : "bg-slate-900/40 text-slate-500 border-slate-800"
                }`}
              >
                {l.nome}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* LISTAGEM EM 2 COLUNAS */}
      <main className="max-w-6xl mx-auto p-6 mt-8 print:hidden">
        {loading ? (
          <div className="text-center py-24 animate-pulse opacity-20 font-black uppercase text-xs tracking-widest">Iniciando Curimba...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtrados.map((p) => (
              <div key={p.id} className="group bg-slate-900/30 rounded-[35px] p-6 border border-slate-800/40 hover:border-indigo-500/40 transition-all flex items-center justify-between gap-4">
                <div className="flex flex-col min-w-0">
                  <span className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-1 truncate">{p.linha}</span>
                  <h3 className="text-lg font-black text-white tracking-tight uppercase italic leading-tight truncate">{p.titulo}</h3>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex gap-1.5">
                    {p.link_youtube && <a href={p.link_youtube} target="_blank" className="w-10 h-10 flex items-center justify-center bg-red-500/10 text-red-500 rounded-xl text-lg hover:bg-red-500 hover:text-white transition-all">🎬</a>}
                    {p.link_spotify && <a href={p.link_spotify} target="_blank" className="w-10 h-10 flex items-center justify-center bg-[#1DB954]/10 text-[#1DB954] rounded-xl text-lg hover:bg-[#1DB954] hover:text-white transition-all">🎧</a>}
                  </div>
                  <button onClick={() => setPontoAberto(p)} className="bg-white text-black h-10 px-6 rounded-xl font-black text-[9px] tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all active:scale-95 whitespace-nowrap">LER LETRA</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL DE LETRA */}
      {pontoAberto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0B1120]/98 backdrop-blur-2xl animate-in fade-in duration-300 print:static print:bg-white print:p-0">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[60px] p-12 shadow-3xl max-h-[90vh] overflow-y-auto relative print:shadow-none print:border-none print:bg-white print:text-black print:max-h-full">
            <div className="flex justify-between sticky top-0 z-10 print:hidden">
              <button onClick={imprimirPonto} className="bg-slate-800 text-white px-5 py-2.5 rounded-xl text-[9px] font-black tracking-widest hover:bg-white hover:text-black transition-all">🖨️ IMPRIMIR</button>
              <button onClick={() => setPontoAberto(null)} className="text-slate-500 hover:text-white text-3xl font-black">✕</button>
            </div>
            <div className="text-center space-y-8 pt-4">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] print:text-slate-400">{pontoAberto.linha}</span>
              <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none print:text-black">{pontoAberto.titulo}</h2>
              <div className="w-24 h-1 bg-indigo-600 mx-auto rounded-full opacity-40 print:hidden"></div>
              
              <div className="font-serif italic text-2xl md:text-3xl text-slate-300 leading-relaxed whitespace-pre-wrap px-2 md:px-8 text-center print:text-black">
                {pontoAberto.letra}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE SUGESTÃO */}
      {modalSugestao && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#0B1120]/95 backdrop-blur-md animate-in zoom-in-95 duration-300">
           <FormSugerir 
              onClose={() => setModalSugestao(false)} 
              linhas={linhas} 
           />
        </div>
      )}

      <footer className="p-20 text-center opacity-10 font-black text-[9px] tracking-[0.5em] uppercase print:hidden">
        CURIMBA DIGITAL 2026
      </footer>
    </div>
  );
}