"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function PainelAdmin() {
  const [aba, setAba] = useState<"stats" | "revisar" | "todos" | "novo" | "linhas">("stats");
  const [pontos, setPontos] = useState<any[]>([]);
  const [linhas, setLinhas] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState<any>(null);
  const [novaLinha, setNovaLinha] = useState("");
  const router = useRouter();

  useEffect(() => {
    const verificarAcesso = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push("/login");
      else carregarTudo();
    };
    verificarAcesso();
  }, [router]);

  const carregarTudo = async () => {
    setCarregando(true);
    const { data: p } = await supabase.from("pontos").select("*, linhas_trabalho(nome)").order("titulo");
    const { data: l } = await supabase.from("linhas_trabalho").select("*").order("nome");
    if (p) setPontos(p);
    if (l) setLinhas(l);
    setCarregando(false);
  };

  // Funções para Linhas de Trabalho
  const adicionarLinha = async () => {
    if (!novaLinha) return;
    await supabase.from("linhas_trabalho").insert([{ nome: novaLinha }]);
    setNovaLinha("");
    carregarTudo();
  };

  const excluirLinha = async (id: string) => {
    if (confirm("Isso pode afetar os pontos vinculados. Confirmar?")) {
      await supabase.from("linhas_trabalho").delete().eq("id", id);
      carregarTudo();
    }
  };

  // Funções para Pontos
  const salvarPonto = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("pontos").upsert([editando]);
    if (!error) {
      alert("Salvo com sucesso!");
      setEditando(null);
      setAba("todos");
      carregarTudo();
    }
  };

  if (carregando) return <div className="flex items-center justify-center min-h-screen text-indigo-600 font-bold">Iniciando Sistema...</div>;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar Lateral - Menu Profissional */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 hidden md:flex flex-col">
        <div className="mb-10 text-center">
          <h1 className="text-xl font-black text-indigo-900 tracking-tighter uppercase">Kanzuá Digital</h1>
          <span className="text-[10px] font-bold text-slate-400">PAINEL DE CONTROLE</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          {[
            { id: "stats", label: "Dashboard", icon: "📊" },
            { id: "revisar", label: "Pendentes", icon: "⏳" },
            { id: "todos", label: "Biblioteca", icon: "📚" },
            { id: "linhas", label: "Linhas de Trabalho", icon: "🔱" },
            { id: "novo", label: "Cadastrar Ponto", icon: "✨" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setAba(item.id as any); setEditando(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${aba === item.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>

        <button onClick={() => supabase.auth.signOut().then(() => router.push("/login"))} className="mt-auto text-slate-400 hover:text-red-500 font-bold text-xs flex items-center gap-2">
           🚪 SAIR DO SISTEMA
        </button>
      </aside>

      {/* Área de Conteúdo Principal */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto">
        
        {/* DASHBOARD */}
        {aba === "stats" && (
          <section className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-3xl font-black text-slate-800">Resumo do Axé</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                <p className="text-xs font-black text-slate-400 uppercase mb-2">Total de Pontos</p>
                <p className="text-5xl font-black text-indigo-600">{pontos.length}</p>
              </div>
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                <p className="text-xs font-black text-slate-400 uppercase mb-2">Aguardando Revisão</p>
                <p className="text-5xl font-black text-amber-500">{pontos.filter(p => !p.aprovado).length}</p>
              </div>
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                <p className="text-xs font-black text-slate-400 uppercase mb-2">Linhas Cadastradas</p>
                <p className="text-5xl font-black text-slate-800">{linhas.length}</p>
              </div>
            </div>
          </section>
        )}

        {/* GERENCIAR LINHAS DE TRABALHO */}
        {aba === "linhas" && (
          <section className="max-w-2xl bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
            <h2 className="text-2xl font-black mb-6">Administrar Linhas</h2>
            <div className="flex gap-2 mb-8">
              <input 
                value={novaLinha} 
                onChange={(e) => setNovaLinha(e.target.value)}
                placeholder="Ex: Marinheiros" 
                className="flex-1 p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 ring-indigo-500 font-bold"
              />
              <button onClick={adicionarLinha} className="bg-indigo-600 text-white px-8 rounded-2xl font-bold">Adicionar</button>
            </div>
            <div className="space-y-2">
              {linhas.map(l => (
                <div key={l.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl group">
                  <span className="font-bold text-slate-700">{l.nome}</span>
                  <button onClick={() => excluirLinha(l.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">Remover</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FORMULÁRIO COM DROPDOWN (Página de Cadastro/Edição) */}
        {(aba === "novo" || editando) && (
          <form onSubmit={salvarPonto} className="max-w-3xl bg-white p-8 rounded-[32px] shadow-xl border border-slate-100 space-y-6">
            <h2 className="text-2xl font-black">{editando?.id ? "✏️ Editar Registro" : "✨ Novo Registro"}</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Título do Ponto</label>
                <input 
                  value={editando?.titulo || ""}
                  onChange={e => setEditando({...editando, titulo: e.target.value})}
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none border border-transparent focus:border-indigo-500 transition-all font-bold" 
                  required
                />
              </div>

              {/* SELEÇÃO DE LINHA (MENU DROPDOWN) */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Linha de Trabalho</label>
                <select 
                  value={editando?.linha || ""}
                  onChange={e => setEditando({...editando, linha: e.target.value})}
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none border border-transparent focus:border-indigo-500 font-bold appearance-none"
                  required
                >
                  <option value="">Selecione uma Linha...</option>
                  {linhas.map(l => (
                    <option key={l.id} value={l.nome}>{l.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Letra Completa</label>
                <textarea 
                  rows={8}
                  value={editando?.letra || ""}
                  onChange={e => setEditando({...editando, letra: e.target.value})}
                  className="w-full p-6 bg-slate-50 rounded-[24px] outline-none font-serif italic text-lg leading-relaxed" 
                  required
                />
            </div>

            <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
               <input 
                 type="checkbox" 
                 checked={editando?.aprovado || false}
                 onChange={e => setEditando({...editando, aprovado: e.target.checked})}
                 className="w-6 h-6 rounded-lg"
               />
               <span className="text-sm font-black text-indigo-900 uppercase">Publicar Ponto (Aparecer no Site)</span>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" className="flex-1 bg-indigo-600 text-white p-5 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700">GRAVAR DADOS</button>
              <button type="button" onClick={() => { setEditando(null); setAba("todos"); }} className="px-10 bg-slate-100 text-slate-500 rounded-2xl font-black">CANCELAR</button>
            </div>
          </form>
        )}

        {/* LISTA DE PONTOS (BIBLIOTECA) */}
        {(aba === "revisar" || aba === "todos") && !editando && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {pontos.filter(p => aba === "revisar" ? !p.aprovado : true).map(p => (
              <div key={p.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex justify-between items-center hover:shadow-md transition-shadow">
                <div>
                  <h4 className="font-black text-slate-800">{p.titulo}</h4>
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{p.linha}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditando(p)} className="p-3 bg-slate-50 rounded-xl hover:bg-indigo-50 text-indigo-600 font-bold text-xs transition-colors">EDITAR</button>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}