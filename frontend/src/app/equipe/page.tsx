"use client";

import { useState, useEffect } from "react";
import { UserPlus, Search, Trash2, Mail, Shield, UserCheck, MoreVertical } from "lucide-react";

interface Member {
  id: number;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
}

export default function EquipePage() {
  const [members, setMembers] = useState<Member[]>([
    { id: 1, full_name: "Ricardo Mendes", email: "ricardo.corretor@email.com", role: "broker", is_active: true },
    { id: 2, full_name: "Ana Paula Silva", email: "ana.vendas@email.com", role: "broker", is_active: true },
    { id: 3, full_name: "Carlos Augusto", email: "carlos.gestor@email.com", role: "manager", is_active: true },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState("");

  const filteredMembers = members.filter(m => 
    m.full_name.toLowerCase().includes(search.toLowerCase()) || 
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Gestão da Equipe</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Controle os acessos e permissões dos seus corretores</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 flex items-center gap-2 transition-all"
        >
          <UserPlus className="h-5 w-5" /> Adicionar Membro
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex-1 flex flex-col">
        {/* Filtros */}
        <div className="p-6 border-b border-slate-50 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou e-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-4 focus:ring-primary/10 transition-all"
            />
          </div>
          <select className="bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm outline-none font-bold text-gray-600">
            <option>Todos os Cargos</option>
            <option>Corretores</option>
            <option>Gerentes</option>
          </select>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Membro</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Cargo</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Performance</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-primary">
                        {member.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{member.full_name}</p>
                        <p className="text-xs text-gray-500 font-medium">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      member.role === 'manager' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      <Shield className="h-3 w-3" />
                      {member.role === 'manager' ? 'Gerente' : 'Corretor'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-600">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-600 animate-pulse"></div>
                      Ativo
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-full max-w-[100px] h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: member.id === 1 ? '75%' : '45%' }}></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Mockup para Adicionar */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-black text-gray-900 mb-2">Convidar Membro</h2>
            <p className="text-gray-500 text-sm font-medium mb-6">O novo membro receberá um e-mail para ativar sua conta.</p>
            
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowAddModal(false); }}>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Nome Completo</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all" placeholder="Ex: Roberto Carlos" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">E-mail Corporativo</label>
                <input type="email" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all" placeholder="roberto@empresa.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Cargo</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-3 outline-none font-bold text-gray-600">
                    <option>Corretor</option>
                    <option>Gerente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Equipe</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-3 outline-none font-bold text-gray-600">
                    <option>Vendas I</option>
                    <option>Vendas II</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 px-4 rounded-2xl font-bold text-gray-500 hover:bg-slate-50 transition-all">Cancelar</button>
                <button type="submit" className="flex-1 bg-primary text-white font-bold py-3 px-4 rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">Enviar Convite</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
