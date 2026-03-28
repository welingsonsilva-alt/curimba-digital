"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

// ESTA INTERFACE É O QUE LIBERA O ID NA VERCEL
interface DadosPonto {
  id?: string | number;
  titulo: string;
  linha: string;
  letra: string;
  link_youtube?: string;
  link_spotify?: string;
}

export default function FormularioPonto({ pontoInicial, onClose }: { pontoInicial: any, onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  
  // APLICAÇÃO DA INTERFACE <DadosPonto>
  const [dados, setDados] = useState<DadosPonto>({
    // AQUI: 'undefined' em inglês e 'id' sem erro de tipo
    id: pontoInicial?.id && !pontoInicial?.criado_em ? pontoInicial.id : undefined,
    titulo: pontoInicial?.titulo || "",
    linha: pontoInicial?.linha || "",
    letra: pontoInicial?.letra || "",
    link_youtube: pontoInicial?.link_youtube || "",
    link_spotify: pontoInicial?.link_spotify || "",
  });

  // ... restante do código de salvar (mantenha o que já funciona)
  return (
    <div>{/* Seu JSX aqui */}</div>
  );
}