"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function FormularioPonto({ pontoInicial, onClose }: { pontoInicial: any, onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [linhas, setLinhas] = useState<any[]>([]);
  
  // Define se estamos aprovando uma sugestão vinda da outra tabela
  const isSugestao = !!(pontoInicial?.criado_em || pontoInicial?.created_at);

  const [dados, setDados] = useState({
    id: isSugestao ? null : (pontoInicial?.id || null), // Se for sugestão, o ID é nulo para o ponto oficial
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
      await supabase.from(tabela).delete().eq("id", pontoInicial.id);
      onClose();
      window.location.reload();
    } catch (err) {
      alert("Erro ao excluir.");
    } finally {
      setLoading(false);
    }
  }

  async function salvarPonto(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return; 
    setLoading(true);

    try {
      const corpoRequisicao = {
        // Se NÃO for sugestão, passamos o ID para o Upsert saber que é uma edição
        ...( !isSugestao && dados.id ? { id: dados.id } : {} ),
        titulo: dados.titulo.trim(),
        linha: dados.linha,
        letra: dados.letra.trim(),
        link_youtube: dados.link_youtube?.trim() || null,
        link_spotify: dados.link_spotify?.trim() || null,
        aprovado: true
      };

      // UPSERT: A mágica que impede duplicação no banco
      const { error: upsertError } = await supabase
        .from("pontos")
        .upsert(corpoRequisicao, { onConflict: 'titulo, linha' });

      if (upsertError) throw upsertError;

      // Se era uma sugestão aprovada com sucesso, deletamos a origem
      if (isSugestao && pontoInicial?.id) {
        await supabase.from("sugestoes_pontos").delete().eq("id", pontoInicial.id);
      }

      onClose();
      window.location.reload();

    } catch (err: any) {
      console.error(err);
      alert("Erro: " + (err.message.includes("unique") ? "Este ponto já existe nesta linha!" : err.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
      <div className="bg-[#0B1120] border border-white/10 rounded-[40px] p-8 w-full max-w-3xl shadow-3xl">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
          <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">
            {isSugestao ? "Aprovar Ponto" : "Editar Ponto"}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white">✕</button>
        </div>
        
        <form onSubmit={salvarPonto} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <input required placeholder="Título" value={dados.titulo} onChange={e => setDados({...dados, titulo: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-4 rounded-2xl text-white outline-none" />
            <select required value={dados.linha} onChange={e => setDados({...dados, linha: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-4 rounded-2xl text-white outline-none">
              <option value="">Linha...</option>
              {linhas.map(l => <option key={l.id} value={l.nome}>{l.nome}</option>)}
            </select>
            <input placeholder="YouTube" value={dados.link_youtube} onChange={e => setDados({...dados, link_youtube: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-4 rounded-2xl text-white text-xs outline-none" />
            <input placeholder="Spotify" value={dados.link_spotify} onChange={e => setDados({...dados, link_spotify: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-4 rounded-2xl text-white text-xs outline-none" />
          </div>

          <textarea required placeholder="Letra..." value={dados.letra} onChange={e => setDados({...dados, letra: e.target.value})} className="flex-1 bg-slate-950 border border-white/5 p-6 rounded-[32px] text-slate-200 italic text-lg outline-none min-h-[250px]" />

          <div className="md:col-span-2 flex justify-between gap-4 mt-4 pt-6 border-t border-white/5">
            <button type="button" onClick={excluirRegistro} disabled={loading} className="text-red-500 font-black uppercase text-[10px] px-4">Excluir</button>
            <div className="flex gap-4">
              <button type="button" onClick={onClose} className="px-6 py-4 text-slate-500 font-black uppercase text-[10px]">Cancelar</button>
              <button type="submit" disabled={loading} className="bg-indigo-600 px-10 py-4 rounded-2xl text-white font-black uppercase text-[11px]">
                {loading ? "Gravando..." : "Salvar"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}