"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ChevronRight, LayoutDashboard, Building2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulação de autenticação (Login ou Cadastro)
    setTimeout(() => {
      // Como solicitado: No início, todas as contas são Incorporadoras (admin)
      localStorage.setItem("user_role", "admin");
      router.push("/");
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-3xl bg-primary text-white mb-6 shadow-2xl shadow-primary/30">
             <LayoutDashboard className="h-9 w-9" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">CRM Loteamento</h1>
          <p className="text-slate-500 mt-2 font-semibold">Painel da Incorporadora</p>
        </div>

        {/* Card de Autenticação */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary/50 via-primary to-primary/50"></div>
          
          <div className="mb-8">
            <h2 className="text-2xl font-black text-gray-900 mb-2">
              {isRegister ? "Criar conta corporativa" : "Bem-vindo de volta"}
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              {isRegister 
                ? "Registre sua incorporadora para começar a gerir seus lotes." 
                : "Acesse sua conta para gerenciar leads e vendas."}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {isRegister && (
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nome da Empresa</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: Incorporadora Silva"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-gray-900 focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">E-mail Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@incorporadora.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-gray-900 focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-gray-900 focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-primary text-white font-black py-4.5 rounded-2xl shadow-xl shadow-primary/30 hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group text-lg mt-8"
            >
              {isLoading ? (
                <div className="h-6 w-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {isRegister ? "Criar Minha Empresa" : "Entrar no Painel"}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <button 
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm font-bold text-slate-500 hover:text-primary transition-colors"
            >
              {isRegister 
                ? "Já tem uma conta? Faça login aqui" 
                : "Não tem uma conta? Registre sua incorporadora"}
            </button>
          </div>
        </div>

        {/* Footer Support */}
        <div className="text-center mt-12 flex items-center justify-center gap-6">
           <button className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">Suporte</button>
           <div className="h-1 w-1 bg-slate-300 rounded-full"></div>
           <button className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">Termos de Uso</button>
        </div>
      </div>
    </div>
  );
}
