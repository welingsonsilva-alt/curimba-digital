"use client";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface SidebarProps {
  abaAtiva: string;
  setAbaAtiva: (aba: string) => void;
  notificacoes: number;
}

export default function Sidebar({ abaAtiva, setAbaAtiva, notificacoes }: SidebarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const menus = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "pontos", label: "Biblioteca", icon: "📚" },
    { id: "linhas", label: "Linhas de Trabalho", icon: "🔱" },
    { id: "sugestoes", label: "Novas Sugestões", icon: "✨", badge: notificacoes },
    { id: "extras", label: "Sugestões Extras", icon: "📩" },
  ];

  return (
    <aside className="w-full h-full bg-[#050A18] border-r border-white/5 flex flex-col py-10 px-6">
      {/* LOGO E TÍTULO */}
      <div className="flex flex-col items-center mb-12">
        <img src="/logo.png" alt="Logo" className="w-20 h-20 mb-4 object-contain" />
        <h1 className="text-xl font-black uppercase italic tracking-tighter text-center">
          Curimba <span className="text-indigo-500">Digital</span>
        </h1>
        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em] mt-1">Admin Dashboard</p>
      </div>

      {/* NAVEGAÇÃO */}
      <nav className="flex-1 space-y-2">
        {menus.map((item) => (
          <button
            key={item.id}
            onClick={() => setAbaAtiva(item.id)}
            className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all group ${
              abaAtiva === item.id 
                ? "bg-white text-[#050A18] shadow-xl shadow-white/5" 
                : "text-slate-500 hover:text-white hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </div>

            {/* BADGE DE NOTIFICAÇÃO (PARA SUGESTÕES) */}
            {item.badge && item.badge > 0 && (
              <span className={`px-2 py-0.5 rounded-md text-[8px] font-black ${
                abaAtiva === item.id ? "bg-indigo-600 text-white" : "bg-indigo-600 text-white"
              }`}>
                {item.badge}
              </span>
            )}
          </button>
        ))}

        {/* BOTÃO NOVO REGISTRO (ESTILO DIFERENTE) */}
        <button
          onClick={() => setAbaAtiva("novo")}
          className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest mt-6 transition-all ${
            abaAtiva === "novo" 
              ? "bg-indigo-600 text-white" 
              : "text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/10"
          }`}
        >
          <span className="text-lg">＋</span> Novo Ponto
        </button>
      </nav>

      {/* RODAPÉ DO MENU */}
      <div className="pt-6 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-600 hover:text-red-500 transition-all"
        >
          <span className="text-lg">🚪</span> Sair do Sistema
        </button>
      </div>
    </aside>
  );
}