"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { 
  Calculator, 
  ChevronRight, 
  FileText, 
  Download, 
  CheckCircle2, 
  Plus, 
  Info,
  DollarSign,
  Building,
  Loader2,
  Trash2,
  Calendar,
  Save
} from "lucide-react";

interface Unit {
  id: number;
  number: string;
  price: number;
  area_m2: number;
  block: { name: string; development: { name: string } };
}

interface ProposalInstallment {
  payment_type: "entrada" | "mensal" | "reforco" | "balao";
  count: number;
  amount_per_installment: number;
  total_group_amount: number;
  start_date: string;
}

export default function LeadDetailsPage() {
  const params = useParams();
  const leadId = params.id;
  
  const [activeTab, setActiveTab] = useState("detalhes");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lead, setLead] = useState<any>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [proposalId, setProposalId] = useState<number | null>(null);

  // Estados do Simulador
  const [installments, setInstallments] = useState<ProposalInstallment[]>([
    { payment_type: "entrada", count: 1, amount_per_installment: 0, total_group_amount: 0, start_date: new Date().toISOString().split('T')[0] },
    { payment_type: "mensal", count: 12, amount_per_installment: 0, total_group_amount: 0, start_date: new Date().toISOString().split('T')[0] }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/leads/${leadId}`);
        const data = await res.json();
        setLead(data);
        if (data.unit_interests && data.unit_interests.length > 0) {
          setSelectedUnit(data.unit_interests[0]);
          // Inicializar valor da entrada com 10% do valor da unidade
          const initialPrice = data.unit_interests[0].price;
          setInstallments([
            { payment_type: "entrada", count: 1, amount_per_installment: initialPrice * 0.1, total_group_amount: initialPrice * 0.1, start_date: new Date().toISOString().split('T')[0] },
            { payment_type: "mensal", count: 120, amount_per_installment: (initialPrice * 0.9) / 120, total_group_amount: initialPrice * 0.9, start_date: new Date().toISOString().split('T')[0] }
          ]);
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (leadId) fetchData();
  }, [leadId]);

  const updateInstallment = (index: number, field: keyof ProposalInstallment, value: any) => {
    const newItems = [...installments];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === "count" || field === "amount_per_installment") {
      newItems[index].total_group_amount = Number(newItems[index].count) * Number(newItems[index].amount_per_installment);
    }
    
    setInstallments(newItems);
  };

  const addInstallment = () => {
    setInstallments([...installments, { 
      payment_type: "mensal", 
      count: 1, 
      amount_per_installment: 0, 
      total_group_amount: 0, 
      start_date: new Date().toISOString().split('T')[0] 
    }]);
  };

  const removeInstallment = (index: number) => {
    setInstallments(installments.filter((_, i) => i !== index));
  };

  const totals = useMemo(() => {
    const totalSimulated = installments.reduce((acc, curr) => acc + curr.total_group_amount, 0);
    const unitPrice = selectedUnit?.price || 0;
    const difference = totalSimulated - unitPrice;
    return { totalSimulated, unitPrice, difference };
  }, [installments, selectedUnit]);

  const handleSaveProposal = async () => {
    if (!selectedUnit) return;
    setIsSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/proposals/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: Number(leadId),
          unit_id: selectedUnit.id,
          total_amount: totals.totalSimulated,
          installments: installments
        })
      });
      const data = await res.json();
      setProposalId(data.id);
      setActiveTab("documentos");
      alert("Proposta salva com sucesso!");
    } catch (error) {
      alert("Erro ao salvar proposta");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
            {lead?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{lead?.full_name}</h1>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                lead?.temperature === 'quente' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                Lead {lead?.temperature}
              </span>
            </div>
            <p className="text-sm text-gray-500">ID: {lead?.id} • {lead?.origin}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {["detalhes", "simulador", "documentos", "historico"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {activeTab === "detalhes" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Info className="h-5 w-5 text-primary" /> Informações do Contato</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className="text-xs font-bold text-gray-400 uppercase">E-mail</label><p className="text-sm">{lead?.email}</p></div>
                  <div><label className="text-xs font-bold text-gray-400 uppercase">Telefone</label><p className="text-sm">{lead?.phone}</p></div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Building className="h-5 w-5 text-primary" /> Unidades de Interesse</h3>
                <div className="space-y-3">
                  {lead?.unit_interests?.map((u: Unit) => (
                    <div key={u.id} className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedUnit?.id === u.id ? 'bg-primary/5 border-primary shadow-sm' : 'bg-gray-50 border-gray-100 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedUnit(u)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-white border border-gray-200 rounded flex items-center justify-center font-bold text-gray-700">{u.number}</div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{u.block?.development?.name} - {u.block?.name}</p>
                          <p className="text-xs text-gray-500">{u.area_m2}m² • R$ {u.price.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                        </div>
                      </div>
                      {selectedUnit?.id === u.id && <CheckCircle2 className="h-5 w-5 text-primary" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "simulador" && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-gray-900">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex justify-between items-center">
                   <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900"><Calculator className="h-5 w-5 text-primary" /> Simulador de Venda</h3>
                   <div className="text-right">
                     <p className="text-xs text-gray-500 uppercase font-bold tracking-tight">Valor de Tabela</p>
                     <p className="text-xl font-black text-primary">R$ {selectedUnit?.price ? selectedUnit.price.toLocaleString('pt-BR', {minimumFractionDigits: 2}) : '0,00'}</p>
                   </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white">
                    <h4 className="text-sm font-bold text-gray-700">Composição do Fluxo</h4>
                    <button onClick={addInstallment} className="flex items-center gap-1 text-xs font-bold text-primary hover:bg-primary/10 px-2 py-1 rounded transition-all">
                      <Plus className="h-3 w-3" /> ADICIONAR GRUPO
                    </button>
                  </div>

                  {installments.map((inst, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 items-end bg-gray-50/50 p-4 rounded-xl border border-gray-100 group">
                      <div className="col-span-3">
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Tipo</label>
                        <select 
                          value={inst.payment_type}
                          onChange={(e) => updateInstallment(index, "payment_type", e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-lg px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="entrada">Entrada</option>
                          <option value="mensal">Mensais</option>
                          <option value="reforco">Reforço/Interm.</option>
                          <option value="balao">Balão/Chaves</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Qtd</label>
                        <input 
                          type="number"
                          value={inst.count}
                          onChange={(e) => updateInstallment(index, "count", e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-lg px-2 py-2 text-sm outline-none"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Valor Unitário</label>
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">R$</span>
                          <input 
                            type="number"
                            value={inst.amount_per_installment}
                            onChange={(e) => updateInstallment(index, "amount_per_installment", e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg pl-6 pr-2 py-2 text-sm outline-none"
                          />
                        </div>
                      </div>
                      <div className="col-span-3">
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Subtotal</label>
                        <p className="text-sm font-bold py-2">R$ {inst.total_group_amount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                      </div>
                      <div className="col-span-1 pb-1">
                        <button onClick={() => removeInstallment(index)} className="text-gray-300 hover:text-red-500 p-2 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Resumo Rodapé Simulador */}
                <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Simulado:</span>
                      <span className="font-bold text-gray-900">R$ {totals.totalSimulated.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Saldo Diferença:</span>
                      <span className={`font-bold ${totals.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        R$ {totals.difference.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleSaveProposal}
                      disabled={isSaving || !selectedUnit}
                      className="flex-1 bg-gray-900 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                      SALVAR PROPOSTA
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "documentos" && (
             <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Documentos e Propostas</h3>
                {proposalId ? (
                  <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                      <div>
                        <p className="font-bold text-green-900">Proposta #{proposalId} Gerada</p>
                        <p className="text-xs text-green-700">Aguardando aprovação do gestor.</p>
                      </div>
                    </div>
                    <a 
                      href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/proposals/${proposalId}/pdf`}
                      target="_blank"
                      className="bg-white border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-green-100 transition-all"
                    >
                      <Download className="h-4 w-4" /> VER PDF
                    </a>
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-center py-10">Nenhuma proposta gerada para este lead ainda.</p>
                )}
             </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">Resumo Financeiro</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Poder de Compra</p>
                  <p className="text-sm font-bold text-gray-900">R$ 500k - 800k</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary text-white rounded-2xl p-6 shadow-xl shadow-primary/20">
             <h3 className="text-xs font-bold text-white/60 uppercase mb-4">Lead Score</h3>
             <div className="flex items-center gap-4 mb-4">
               <span className="text-5xl font-black">8.5</span>
               <div>
                  <p className="text-xs font-bold">ALTO POTENCIAL</p>
                  <p className="text-[10px] text-white/70">Baseado no engajamento recente.</p>
               </div>
             </div>
             <div className="w-full bg-white/20 h-2 rounded-full">
               <div className="bg-white h-full rounded-full" style={{ width: '85%' }}></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
