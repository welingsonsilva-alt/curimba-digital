"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface DadosPonto {
  id?: string;
  titulo: string;
  linha: string;
  letra: string;
  link_youtube?: string;
  link_spotify?: string;
}

export default function FormularioPonto({ pontoInicial, onClose }: { pontoInicial: any, onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [linhas, setLinhas] = useState<any[]>([]);
  
  // Estado inicial: Se houver 'criado_em', é uma SUGESTÃO. 
  // O ID da sugestão NÃO deve ser usado como ID do ponto oficial.
  const [dados, setDados] = useState<DadosPonto>({
    id: pontoInicial?.id && !pontoInicial?.criado_em ? pontoInicial.id : undefined,
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

  async function salvarPonto(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Busca o UUID da linha para satisfazer a Constraint do seu banco
      const linhaObjeto = linhas.find(l => l.nome === dados.linha);
      
      // 2. Monta o objeto EXATO conforme o seu CREATE TABLE
      const corpoDaRequisicao: any = {
        titulo: dados.titulo.trim(),
        linha: dados.linha,
        letra: dados.letra.trim(),
        id_linha: linhaObjeto?.id || null, // UUID da linha de trabalho
        link_youtube: dados.link_youtube?.trim() || null,
        link_spotify: dados.link_spotify?.trim() || null,
        aprovado: true,
        link_whatsapp: null // Coluna existente no seu banco
      };

      console.log("LOG: Tentando enviar dados:", corpoDaRequisicao);

      let resultado;

      if (dados.id) {
        // MODO EDIÇÃO (Update)
        resultado = await supabase
          .from("pontos")
          .update(corpoDaRequisicao)
          .eq("id", dados.id)
          .select();
      } else {
        // MODO SUGESTÃO / NOVO (Insert)
        // Omitimos o campo 'id' para o Postgres usar gen_random_uuid()
        resultado = await supabase
          .from("pontos")
          .insert([corpoDaRequisicao])
          .select();
      }

      console.log("LOG: Resposta bruta do Supabase:", resultado);

      if (resultado.error) {
        throw new Error(resultado.error.message);
      }

      // 3. Verificação de segurança: O banco retornou o objeto criado?
      if (resultado.data && resultado.data.length > 0) {
        
        // Se foi um sucesso e era uma sugestão, deletamos da fila
        if (!dados.id && pontoInicial?.id) {
          console.log("LOG: Deletando sugestão aprovada...");
          await supabase.from("sugestoes_pontos").delete().eq("id", pontoInicial.id);
        }

        alert("✨ Fundamento gravado com sucesso no banco!");
        onClose();
        window.location.reload();
      } else {
        // Se cair aqui, o RLS (Segurança) está bloqueando no Supabase Cloud
        alert("O banco aceitou, mas não salvou. Verifique se o RLS está desativado no painel do Supabase!");
      }

    } catch (err: any) {
      console.error("ERRO CAPTURADO:", err);
      alert("ERRO AO GRAVAR: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0B1120] border border-white/10 rounded-[40px] p-8 w-full max-w-3xl shadow-3xl my-8">
        
        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
          <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">
            {dados.id ? "Editar Ponto Oficial" : "Aprovar Sugestão Pública"}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-2xl">✕</button>
        </div>
        
        <form onSubmit={salvarPonto} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-2">Título</label>
              <input required value={dados.titulo} onChange={e => setDados({...dados, titulo: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-4 rounded-2xl text-white outline-none focus:border-indigo-500" />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-2">Linha</label>
              <select required value={dados.linha} onChange={e => setDados({...dados, linha: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-4 rounded-2xl text-white outline-none cursor-pointer">
                <option value="">Selecione...</option>
                {linhas.map(l => <option key={l.id} value={l.nome}>{l.nome}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <input placeholder="Link YouTube" value={dados.link_youtube} onChange={e => setDados({...dados, link_youtube: e.target.value})} className="bg-slate-950 border border-white/5 p-4 rounded-2xl text-white text-sm outline-none focus:border-red-500/30" />
              <input placeholder="Link Spotify" value={dados.link_spotify} onChange={e => setDados({...dados, link_spotify: e.target.value})} className="bg-slate-950 border border-white/5 p-4 rounded-2xl text-white text-sm outline-none focus:border-green-500/30" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-2">Letra</label>
            <textarea required rows={12} value={dados.letra} onChange={e => setDados({...dados, letra: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-6 rounded-3xl text-slate-200 italic font-serif text-lg outline-none focus:border-indigo-500" />
          </div>

          <div className="md:col-span-2 flex gap-4 mt-4 border-t border-white/5 pt-8">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-slate-500 font-bold uppercase text-[10px]">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-[2] bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl text-white font-black uppercase text-[11px] tracking-widest shadow-xl transition-all">
              {loading ? "PROCESSANDO NO BANCO..." : "CONFIRMAR E SALVAR"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}