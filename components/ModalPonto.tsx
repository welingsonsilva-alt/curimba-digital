"use client";

export default function ModalPonto({ ponto, onClose }: any) {
  if (!ponto) return null;

  // Função técnica para abrir o link em nova aba
  const abrirLink = (url: string) => {
    if (!url) return;
    const target = url.startsWith("http") ? url : "https://" + url;
    window.open(target, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col p-6 overflow-y-auto items-center">
      {/* Botão de Fechar */}
      <button 
        onClick={onClose} 
        className="fixed top-8 right-8 text-zinc-500 hover:text-white text-3xl transition-colors cursor-pointer bg-transparent border-none"
      >
        ✕
      </button>

      <div className="mt-12 max-w-2xl w-full text-center">
        {/* Cabeçalho do Modal (Linha e Título) */}
        <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mb-3">
          {ponto.linha}
        </p>
        <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-10 leading-tight">
          {ponto.titulo}
        </h2>

        {/* --- BOTÕES DE MÍDIA (ADICIONADOS) --- */}
        <div className="flex justify-center gap-10 mb-16">
          {ponto.link_youtube && (
            <button 
              onClick={() => abrirLink(ponto.link_youtube)} 
              className="flex flex-col items-center gap-3 group bg-transparent border-none cursor-pointer"
            >
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(220,38,38,0.3)] group-hover:scale-110 transition-transform">
                📺
              </div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest group-hover:text-white">YouTube</span>
            </button>
          )}

          {ponto.link_spotify && (
            <button 
              onClick={() => abrirLink(ponto.link_spotify)} 
              className="flex flex-col items-center gap-3 group bg-transparent border-none cursor-pointer"
            >
              <div className="w-16 h-16 bg-[#1DB954] rounded-full flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(29,185,84,0.3)] group-hover:scale-110 transition-transform">
                🎧
              </div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest group-hover:text-white">Spotify</span>
            </button>
          )}
        </div>

        {/* Letra do Ponto */}
        <pre translate="no" className="notranslate text-zinc-200 italic font-serif text-2xl md:text-3xl leading-relaxed whitespace-pre-wrap pb-40">
          {ponto.letra}
        </pre>
      </div>
    </div>
  );
}