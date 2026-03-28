"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function FormSugerir({ onClose, linhas }: any) {
  const [dados, setDados] = useState({ titulo: "", linha: "", letra: "", sugerido_por: "" });
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    
    const { error } = await supabase.from("sugestoes_pontos").insert([dados]);
    
    if (!error) {
      alert("Saravá! Sua sugestão foi enviada com sucesso.");
      onClose();
    } else {
      alert("Erro ao enviar: " + error.message);
    }
    setEnviando(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-[50px] p-10 shadow-3xl animate-in zoom-in-95">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Sugerir Ponto</h2>
        <button onClick={onClose} className="text-slate-600 hover:text-white text-2xl">✕</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          required 
          placeholder="Título da Cantiga" 
          className="w-full bg-slate-950 p-5 rounded-2xl border border-slate-800 outline-none focus:border-indigo-500 text-white font-bold placeholder:opacity-20" 
          value={dados.titulo} 
          onChange={e => setDados({...dados, titulo: e.target.value})} 
        />
        
        <select 
          required 
          className="w-full bg-slate-950 p-5 rounded-2xl border border-slate-800 outline-none focus:border-indigo-500 text-white font-bold appearance-none cursor-pointer" 
          value={dados.linha} 
          onChange={e => setDados({...dados, linha: e.target.value})}
        >
          <option value="">Selecione a Linha de Trabalho...</option>
          {linhas.map((l: any) => (
            <option key={l.id} value={l.nome} className="bg-slate-900">{l.nome}</option>
          ))}
        </select>

        <textarea 
          required 
          rows={6} 
          placeholder="Escreva a letra aqui (use Enter para separar estrofes)..." 
          className="w-full bg-slate-950 p-6 rounded-[30px] border border-slate-800 outline-none focus:border-indigo-500 text-white font-serif italic text-lg leading-relaxed placeholder:opacity-20" 
          value={dados.letra} 
          onChange={e => setDados({...dados, letra: e.target.value})} 
        />

        <input 
          placeholder="Seu nome ou apelido (Opcional)" 
          className="w-full bg-slate-950 p-5 rounded-2xl border border-slate-800 outline-none focus:border-indigo-500 text-white font-bold placeholder:opacity-20" 
          value={dados.sugerido_por} 
          onChange={e => setDados({...dados, sugerido_por: e.target.value})} 
        />

        <button 
          type="submit" 
          disabled={enviando}
          className="w-full bg-indigo-600 text-white p-6 rounded-[28px] font-black tracking-[0.2em] hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-900/20 active:scale-95 disabled:opacity-50"
        >
          {enviando ? "ENVIANDO FUNDAMENTO..." : "ENVIAR SUGESTÃO"}
        </button>
      </form>
    </div>
  );
}