"use client";

import { useState, useEffect } from "react";
import { MoreHorizontal, Plus, X, Loader2, Check } from "lucide-react";
import Link from "next/link";

const COLUMNS = [
  { id: "oportunidades", title: "Oportunidades", count: 12 },
  { id: "atendimento", title: "Em Atendimento", count: 8 },
  { id: "apresentacao", title: "Apresentação", count: 4 },
  { id: "reserva", title: "Reserva", count: 2 },
  { id: "proposta", title: "Proposta", count: 1 },
  { id: "contrato", title: "Contrato", count: 3 },
  { id: "concluida", title: "Venda Concluída", count: 15 },
];

interface Development {
  id: number;
  name: string;
}

interface Unit {
  id: number;
  number: string;
  block_id: number;
  status: string;
}

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedDevId, setSelectedDevId] = useState<number | "">("");
  const [selectedUnitIds, setSelectedUnitIds] = useState<number[]>([]);
  
  // Data states
  const [developments, setDevelopments] = useState<Development[]>([]);
  const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);
  const [fetchingData, setFetchingData] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      setFetchingData(true);
      fetch("/api/units/developments")
        .then(res => res.json())
        .then(data => {
          setDevelopments(data);
          setFetchingData(false);
        })
        .catch(err => {
          console.error("Erro ao carregar loteamentos:", err);
          setFetchingData(false);
        });
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (selectedDevId) {
      setFetchingData(true);
      fetch(`/api/units/developments/${selectedDevId}/mirror`)
        .then(res => res.json())
        .then(data => {
          // Filtrar apenas disponíveis por padrão para o interesse? 
          // Ou mostrar todos e deixar o usuário escolher?
          setAvailableUnits(data.filter((u: Unit) => u.status === "disponivel"));
          setFetchingData(false);
        })
        .catch(err => {
          console.error("Erro ao carregar lotes:", err);
          setFetchingData(false);
        });
    } else {
      setAvailableUnits([]);
    }
  }, [selectedDevId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const leadData = {
      full_name: fullName,
      phone,
      email,
      stage_id: 1, // Oportunidades
      unit_interests: selectedUnitIds,
    };

    try {
      const res = await fetch("/api/leads/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        // Reset form
        setFullName("");
        setPhone("");
        setEmail("");
        setSelectedDevId("");
        setSelectedUnitIds([]);
        // Idealmente aqui recarregaríamos o Kanban
      }
    } catch (err) {
      console.error("Erro ao salvar lead:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUnitSelection = (unitId: number) => {
    setSelectedUnitIds(prev => 
      prev.includes(unitId) ? prev.filter(id => id !== unitId) : [...prev, unitId]
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">CRM de Vendas</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie seus leads e o funil de loteamento (35 ativos)</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-gray-300 hover:bg-gray-100 h-10 py-2 px-4 bg-white text-gray-700 shadow-sm transition-colors">
            Filtrar
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium font-semibold bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4 shadow-sm transition-colors"
          >
            <Plus className="mr-2 h-4 w-4" /> Novo Lead
          </button>
        </div>
      </div>

      {/* Kanban Board Area */}
      <div className="flex h-full gap-6 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div key={col.id} className="flex h-full w-80 min-w-80 flex-col rounded-lg bg-gray-50/50 border border-gray-200">
            {/* Column Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
                {col.title}
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600">
                  {col.count}
                </span>
              </h3>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            {/* Column Cards Container */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
              <div className="group relative flex flex-col gap-2 rounded-md border border-gray-200 bg-white p-3 shadow-sm hover:border-primary/50 hover:shadow-md transition-all cursor-grab active:cursor-grabbing">
                <div className="flex items-start justify-between">
                  <span className="inline-flex items-center rounded-sm bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    Exemplo Base
                  </span>
                  <span className="text-xs text-gray-400">Agora</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors italic">Dados vindos da API em breve...</h4>
                </div>
              </div>
            </div>

            <div className="p-2 border-t border-gray-100">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex w-full items-center justify-center rounded py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100/50 hover:text-gray-700 transition-colors"
              >
                <Plus className="mr-1 h-4 w-4" /> Adicionar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* NEW LEAD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">Cadastrar Novo Lead</h2>
              <button onClick={() => setIsModalOpen(false)} className="rounded-full p-2 hover:bg-gray-100 transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  autoFocus
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                  placeholder="Nome do cliente"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Telefone</label>
                  <input 
                    type="text" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">E-mail</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                    placeholder="cliente@email.com"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Loteamento de Interesse</label>
                <select 
                  value={selectedDevId}
                  onChange={(e) => {
                    setSelectedDevId(Number(e.target.value));
                    setSelectedUnitIds([]);
                  }}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                >
                  <option value="">Selecione o empreendimento...</option>
                  {developments.map(dev => (
                    <option key={dev.id} value={dev.id}>{dev.name}</option>
                  ))}
                </select>
              </div>

              {selectedDevId && (
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Lotes Disponíveis (Clique para selecionar)</label>
                  {fetchingData ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : availableUnits.length === 0 ? (
                    <p className="text-xs text-gray-500 italic p-3 bg-gray-50 rounded-lg">Nenhum lote disponível encontrado para este loteamento.</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {availableUnits.map(unit => (
                        <button
                          key={unit.id}
                          type="button"
                          onClick={() => toggleUnitSelection(unit.id)}
                          className={`p-2 rounded-lg border text-xs font-bold transition-all flex items-center justify-between ${
                            selectedUnitIds.includes(unit.id) 
                              ? "bg-primary border-primary text-white shadow-md shadow-primary/20" 
                              : "bg-white border-gray-200 text-gray-600 hover:border-primary/50"
                          }`}
                        >
                          {unit.number}
                          {selectedUnitIds.includes(unit.id) && <Check className="h-3 w-3 ml-1" />}
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-gray-400 mt-2 font-medium italic">
                    {selectedUnitIds.length} lote(s) selecionado(s)
                  </p>
                </div>
              )}

              <div className="pt-6">
                <button 
                  type="submit"
                  disabled={loading || !fullName}
                  className="w-full bg-primary text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                  Cadastrar Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
