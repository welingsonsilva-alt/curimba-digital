"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function GerenciarLinhas() {
  const [linhas, setLinhas] = useState<any[]>([]);
  const [colunas, setColunas] = useState(["ORIXÁS", "EXU", "ENTIDADES"]);
  const [novaLinha, setNovaLinha] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarLinhas();
  }, []);

  async function carregarLinhas() {
    const { data } = await supabase.from("linhas_trabalho").select("*").order("nome");
    if (data) setLinhas(data);
    setLoading(false);
  }

  // Lógica de Arrastar (Start)
  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("linhaId", id);
  };

  // Lógica de Soltar (Drop)
  const onDrop = async (e: React.DragEvent, novaCategoria: string) => {
    const id = e.dataTransfer.getData("linhaId");
    
    // Atualiza visualmente primeiro (Otimismo)
    const novasLinhas = linhas.map(l => l.id === id ? { ...l, categoria: novaCategoria } : l);
    setLinhas(novasLinhas);

    // Salva no Banco
    const { error } = await supabase
      .from("linhas_trabalho")
      .update({ categoria: novaCategoria })
      .eq("id", id);
    
    if (error) carregarLinhas(); // Se der erro, volta ao estado original
  };

  const permitirDrop = (e: React.DragEvent) => e.preventDefault();

  async function adicionarLinha(categoria: string) {
    const nome = prompt("Nome da nova Linha de Trabalho:");
    if (!nome) return;
    const { error } = await supabase.from("linhas_trabalho").insert([{ 
      nome: nome.toUpperCase(), 
      categoria: categoria 
    }]);
    if (!error) carregarLinhas();
  }

  function adicionarColuna() {
    const nomeCol = prompt("Nome da nova Coluna:");
    if (nomeCol) setColunas([...colunas, nomeCol.toUpperCase()]);
  }

  if (loading) return <div className="animate-pulse text-[10px] font-black uppercase text-slate-600 text-center py-20">Organizando Altar...</div>;

  return (
    <div className="space-y-8">
      {/* HEADER DAS COLUNAS */}
      <div className="flex justify-between items-center px-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Hierarquia de Trabalho</h3>
        <button 
          onClick={adicionarColuna}
          className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
        >
          ＋ Nova Coluna
        </button>
      </div>

      {/* ÁREA DE KANBAN */}
      <div className="flex gap-4 overflow-x-auto pb-6 custom-scrollbar items-start">
        {colunas.map((col) => (
          <div 
            key={col}
            onDragOver={permitirDrop}
            onDrop={(e) => onDrop(e, col)}
            className="flex-shrink-0 w-72 bg-white/[0.02] border border-white/5 rounded-[32px] p-4 min-h-[400px] flex flex-col gap-3"
          >
            {/* Título da Coluna */}
            <div className="flex justify-between items-center px-2 mb-2">
              <span className="text-[10px] font-black text-indigo-500 tracking-widest">{col}</span>
              <span className="text-[9px] font-bold text-slate-700">
                {linhas.filter(l => l.categoria === col).length}
              </span>
            </div>

            {/* Cards da Coluna */}
            {linhas.filter(l => l.categoria === col).map((l) => (
              <div 
                key={l.id}
                draggable
                onDragStart={(e) => onDragStart(e, l.id)}
                className="bg-slate-900 border border-white/5 p-4 rounded-2xl cursor-grab active:cursor-grabbing hover:border-indigo-500/30 transition-all group flex justify-between items-center"
              >
                <span className="text-[10px] font-black uppercase tracking-tight text-slate-300">{l.nome}</span>
                <span className="opacity-0 group-hover:opacity-40 text-[8px]">⠿</span>
              </div>
            ))}

            {/* Botão de Adicionar na Coluna */}
            <button 
              onClick={() => adicionarLinha(col)}
              className="mt-2 w-full py-3 rounded-xl border border-dashed border-white/5 text-[9px] font-black uppercase text-slate-600 hover:text-slate-400 hover:border-white/10 transition-all"
            >
              ＋ Adicionar em {col}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}