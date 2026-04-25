"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Check, Trash2, MapPin, User, Info, X } from 'lucide-react';

interface FormProps {
  pontoInicial: any;
  onClose: () => void;
}

export default function FormularioPonto({ pontoInicial, onClose }: FormProps) {
  const [loading, setLoading] = useState(false);
  const [linhas, setLinhas] = useState<any[]>([]);
  
  // Detecta se é uma sugestão (pode variar dependendo de como você recebe os dados)
  const isSugestao = pontoInicial?.aprovado !== true;

  const [dados, setDados] = useState({
    id: pontoInicial?.id || null, 
    titulo: pontoInicial?.titulo || "",
    linha: pontoInicial?.linha || "",
    letra: pontoInicial?.letra || "",
    link_youtube: pontoInicial?.link_youtube || "",
    link_spotify: pontoInicial?.link_spotify || "",
  });

  useEffect(() => {
    async function carregarLinhas() {
      const { data } = await supabase.from("linhas_trabalho").select("*").order("nome");
      if (data) setLinhas(data);
    }
    carregarLinhas();
  }, []);

  async function excluirRegistro() {
    if (!confirm("⚠️ Confirmar exclusão permanente?")) return;
    setLoading(true);
    try {
      const tabela = isSugestao ? "sugestoes_pontos" : "pontos";
      const { error } = await supabase.from(tabela).delete().eq("id", pontoInicial.id);
      if (error) throw error;

      onClose();
      window.location.reload();
    } catch (err: any) {
      alert("Erro ao excluir: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function salvarPonto(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return; 
    setLoading(true);

    try {
      const letraTrim = dados.letra.trim();
      const tituloTrim = dados.titulo.trim();

      // --- VALIDAÇÃO PELA LETRA (IMPEDE DUPLICADOS) ---
      if (isSugestao || !dados.id) {
        const { data: existente } = await supabase
          .from("pontos")
          .select("titulo, linha")
          .eq("letra", letraTrim)
          .maybeSingle();

        if (existente) {
          alert(`⚠️ Esta letra já existe no ponto: "${existente.titulo}" (${existente.linha})`);
          setLoading(false);
          return;
        }
      }

      const corpoRequisicao: any = {
        titulo: tituloTrim,
        linha: dados.linha,
        letra: letraTrim,
        link_youtube: dados.link_youtube?.trim() || null,
        link_spotify: dados.link_spotify?.trim() || null,
        aprovado: true
      };

      // Se for edição de ponto oficial, mantém o ID
      if (!isSugestao && dados.id) {
        corpoRequisicao.id = dados.id;
      }

      const { error: upsertError } = await supabase
        .from("pontos")
        .upsert(corpoRequisicao);

      if (upsertError) throw upsertError;

      // Se era sugestão, limpa a tabela de origem
      if (isSugestao && pontoInicial?.id) {
        await supabase.from("sugestoes_pontos").delete().eq("id", pontoInicial.id);
      }

      onClose();
      window.location.reload();

    } catch (err: any) {
      console.error(err);
      alert("Erro ao salvar: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className="bg-[#050A18] border border-white/5 rounded-[40px] p-8 w-full max-w-4xl shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* HEADER DO FORMULÁRIO */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
              {isSugestao ? "✨" : "📝"}
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">
                {isSugestao ? "Aprovar Sugestão" : "Editar Ponto"}
              </h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Gerenciamento de Biblioteca</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        
        <form onSubmit={salvarPonto} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* COLUNA ESQUERDA: DADOS */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Título do Ponto</label>
              <input required value={dados.titulo} onChange={e => setDados({...dados, titulo: e.target.value})} className="w-full bg-[#080E1E] border border-white/5 p-4 rounded-2xl text-white outline-none focus:border-indigo-500 transition-all font-bold" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Linha de Trabalho</label>
              <select required value={dados.linha} onChange={e => setDados({...dados, linha: e.target.value})} className="w-full bg-[#080E1E] border border-white/5 p-4 rounded-2xl text-white outline-none focus:border-indigo-500 transition-all font-bold">
                <option value="">Selecione a linha...</option>
                {linhas.map(l => <option key={l.id} value={l.nome}>{l.nome}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Link YouTube</label>
                  <input placeholder="URL do vídeo" value={dados.link_youtube} onChange={e => setDados({...dados, link_youtube: e.target.value})} className="w-full bg-[#080E1E] border border-white/5 p-4 rounded-2xl text-slate-400 text-xs outline-none" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Link Spotify</label>
                  <input placeholder="URL da música" value={dados.link_spotify} onChange={e => setDados({...dados, link_spotify: e.target.value})} className="w-full bg-[#080E1E] border border-white/5 p-4 rounded-2xl text-slate-400 text-xs outline-none" />
               </div>
            </div>
          </div>

          {/* COLUNA DIREITA: LETRA */}
          <div className="flex flex-col space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Letra Completa</label>
            <textarea 
              required 
              value={dados.letra} 
              onChange={e => setDados({...dados, letra: e.target.value})} 
              className="flex-1 min-h-[300px] bg-[#080E1E] border border-white/5 p-6 rounded-[32px] text-slate-200 italic text-lg outline-none focus:border-indigo-500 transition-all resize-none leading-relaxed" 
            />
          </div>

          {/* FOOTER: AÇÕES */}
          <div className="md:col-span-2 flex justify-between items-center mt-6 pt-6 border-t border-white/5">
            <button type="button" onClick={excluirRegistro} disabled={loading} className="flex items-center gap-2 text-red-500 font-black uppercase text-[10px] tracking-widest hover:bg-red-500/10 px-4 py-2 rounded-xl transition-all">
              <Trash2 size={14} /> Excluir Registro
            </button>
            
            <div className="flex gap-4">
              <button type="button" onClick={onClose} className="px-8 py-4 text-slate-500 font-black uppercase text-[10px] tracking-widest">
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="bg-white text-[#050A18] px-12 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-indigo-500 hover:text-white transition-all shadow-xl shadow-white/5">
                {loading ? "Gravando..." : (isSugestao ? "Aprovar Agora" : "Salvar Alterações")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}