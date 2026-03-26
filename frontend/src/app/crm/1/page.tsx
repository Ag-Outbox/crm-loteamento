"use client";

import { useState } from "react";
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
  Loader2
} from "lucide-react";

export default function LeadDetailsPage() {
  const [activeTab, setActiveTab] = useState("detalhes");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [simulation, setSimulation] = useState({
    total: 250000,
    downPayment: 25000,
    installments: 120,
    interest: 0.8
  });

  const handleGeneratePdf = async () => {
    setIsGeneratingPdf(true);
    // Simulação de chamada de API para o roteador /api/proposals/{lead_id}/pdf
    // Em um cenário real: 
    // const response = await fetch(`http://localhost:8000/api/proposals/1/pdf?unit_id=1&installments=${simulation.installments}`, { headers: authHeaders });
    // const blob = await response.blob();
    // const url = window.URL.createObjectURL(blob);
    // window.open(url);
    
    setTimeout(() => {
      setIsGeneratingPdf(false);
      alert("Proposta PDF gerada com sucesso! O download iniciará em instantes (Simulado).");
    }, 2000);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header do Lead */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
            JS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">João da Silva</h1>
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                Lead Quente
              </span>
            </div>
            <p className="text-sm text-gray-500">Nº 865 • Cadastrado em 12/03/2026</p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium text-sm hover:bg-gray-50">Transferir</button>
          <button className="bg-primary text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-primary/90">Ações Rápidas</button>
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {["detalhes", "simulador", "documentos", "historico"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize
                ${activeTab === tab 
                  ? "border-primary text-primary" 
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}
              `}
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
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Info className="h-5 w-5 text-primary" /> Informações do Lead</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">E-mail</label>
                    <p className="text-sm text-gray-900">joao.silva@email.com</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Telefone</label>
                    <p className="text-sm text-gray-900">+55 (11) 99999-8888</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Produto de Interesse</label>
                    <p className="text-sm text-gray-900 font-medium">Loteamento Reserva das Flores</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Origem</label>
                    <p className="text-sm text-gray-900">Meta Ads (Instagram)</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Building className="h-5 w-5 text-primary" /> Unidade de Interesse</h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-green-500 rounded flex items-center justify-center text-white font-bold">101</div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Torre Jasmim - Unidade 101</p>
                      <p className="text-xs text-gray-500">65m² • R$ 250.000,00</p>
                    </div>
                  </div>
                  <button className="text-primary text-sm font-medium hover:underline">Trocar Unidade</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "simulador" && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2"><Calculator className="h-5 w-5 text-primary" /> Simulador de Venda</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Valor do Imóvel</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                      <input 
                        type="number" 
                        value={simulation.total} 
                        onChange={(e) => setSimulation({...simulation, total: Number(e.target.value)})}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Valor de Entrada</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                      <input 
                        type="number" 
                        value={simulation.downPayment} 
                        onChange={(e) => setSimulation({...simulation, downPayment: Number(e.target.value)})}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Parcelas</label>
                      <input 
                        type="number" 
                        value={simulation.installments} 
                        onChange={(e) => setSimulation({...simulation, installments: Number(e.target.value)})}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Juros (% a.m)</label>
                      <input 
                        type="number" 
                        value={simulation.interest} 
                        onChange={(e) => setSimulation({...simulation, interest: Number(e.target.value)})}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" 
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <h4 className="text-sm font-bold text-gray-400 uppercase mb-4 tracking-wider">Resumo do Plano</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end border-b border-gray-200 pb-2">
                      <span className="text-sm text-gray-600">Entrada</span>
                      <span className="font-bold text-gray-900">R$ {simulation.downPayment.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-gray-200 pb-2">
                      <span className="text-sm text-gray-600">{simulation.installments}x Parcelas de</span>
                      <span className="text-xl font-bold text-primary">R$ 3.250,55</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-gray-200 pb-2">
                      <span className="text-sm text-gray-600">Total Pago</span>
                      <span className="font-bold text-gray-900">R$ 415.066,00</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleGeneratePdf}
                    disabled={isGeneratingPdf}
                    className="w-full bg-primary text-white font-bold py-3 rounded-lg mt-8 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                     {isGeneratingPdf ? (
                       <Loader2 className="h-5 w-5 animate-spin" />
                     ) : (
                       <FileText className="h-5 w-5 group-hover:scale-110 transition-transform" />
                     )}
                     {isGeneratingPdf ? "Gerando PDF..." : "Gerar Proposta em PDF"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">Próximas Tarefas</h3>
            <div className="space-y-3">
              {[
                { title: "Ligar para João", date: "Hoje, 14:00", type: "call" },
                { title: "Enviar Vídeo da Unidade", date: "Amanhã, 10:00", type: "whatsapp" },
              ].map((task, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                    <div className="h-4 w-4 rounded-full border-2 border-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{task.title}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">{task.date}</p>
                  </div>
                </div>
              ))}
              <button className="w-full py-2 text-primary text-sm font-bold border border-dashed border-primary/30 rounded-lg hover:bg-primary/5">
                + Nova Tarefa
              </button>
            </div>
          </div>

          <div className="bg-gray-900 text-white rounded-xl p-6 shadow-xl">
             <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 tracking-wider flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" /> Scoring do Lead
             </h3>
             <div className="flex items-center gap-4 mb-4">
               <span className="text-4xl font-black text-green-500">85</span>
               <p className="text-xs text-gray-400 leading-tight">Probabilidade de fechamento classificada como <b>Alta</b> pelo sistema.</p>
             </div>
             <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
               <div className="bg-green-500 h-full" style={{ width: '85%' }}></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
