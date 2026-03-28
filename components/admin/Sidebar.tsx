"use client";

interface SidebarProps {
  abaAtiva: string;
  setAbaAtiva: (aba: string) => void;
  notificacoes: number;
}

export default function Sidebar({ abaAtiva, setAbaAtiva, notificacoes }: SidebarProps) {
  
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "pontos", label: "Biblioteca", icon: "📚" },
    { id: "linhas", label: "Linhas de Trabalho", icon: "🔱" },
    { id: "sugestoes", label: "Sugestões", icon: "✨", badge: true },
    { id: "novo", label: "Novo Registro", icon: "➕" },
  ];

  return (
    <aside className="h-full bg-slate-900/40 backdrop-blur-md rounded-[40px] border border-slate-800/50 p-6 flex flex-col justify-between shadow-2xl">
      
      {/* LOGO E TÍTULO ATUALIZADOS */}
      <div className="space-y-10">
        <div className="flex flex-col items-center text-center px-2 pt-4">
          {/* LOGO TAMANHO 24 (96px) */}
          <img 
            src="/logo.png" 
            alt="Logo Curimba Digital" 
            className="w-24 h-24 object-contain mb-4" 
          />
          <h1 className="text-xl font-black tracking-tighter text-white uppercase italic leading-none">
            Curimba <span className="text-indigo-500 font-black">Digital</span>
          </h1>
          <p className="text-[9px] font-black text-slate-600 tracking-[0.3em] uppercase mt-3">
            Painel de Gestão
          </p>
        </div>

        {/* NAVEGAÇÃO */}
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setAbaAtiva(item.id)}
              className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all duration-300 group ${
                abaAtiva === item.id
                  ? "bg-white text-black shadow-xl shadow-white/5 translate-x-2"
                  : "text-slate-500 hover:bg-slate-800/50 hover:text-slate-300"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`text-sm transition-transform group-hover:scale-125 ${abaAtiva === item.id ? "opacity-100" : "opacity-40"}`}>
                  {item.icon}
                </span>
                {item.label}
              </div>

              {/* CONTADOR DE NOTIFICAÇÕES (Sugestões) */}
              {item.badge && notificacoes > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black animate-pulse ${
                  abaAtiva === 'sugestoes' 
                  ? "bg-indigo-600 text-white" 
                  : "bg-indigo-500 text-white"
                }`}>
                  {notificacoes}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* RODAPÉ DA SIDEBAR */}
      <div className="px-4 pb-4 space-y-4">
        <div className="h-[1px] bg-slate-800 w-full" />
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-[10px] font-black text-white">
            AD
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-300 tracking-tight">Administrador</span>
            <button 
              onClick={() => window.location.href = '/'}
              className="text-[9px] font-bold text-slate-600 hover:text-indigo-400 text-left transition-colors"
            >
              Sair do Painel
            </button>
          </div>
        </div>
      </div>

    </aside>
  );
}