"use client";

import { MoreHorizontal, Plus } from "lucide-react";
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

export default function Home() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">CRM de Vendas</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie seus leads e o funil de loteamento (35 ativos)</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border border-gray-300 hover:bg-gray-100 h-10 py-2 px-4 bg-white text-gray-700 shadow-sm">
            Filtrar
          </button>
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-semibold bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4 shadow-sm">
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
              {/* Fake Card Mockup */}
              <div className="group relative flex flex-col gap-2 rounded-md border border-gray-200 bg-white p-3 shadow-sm hover:border-primary/50 hover:shadow-md transition-all cursor-grab active:cursor-grabbing">
                <div className="flex items-start justify-between">
                  <span className="inline-flex items-center rounded-sm bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    Lead Quente
                  </span>
                  <span className="text-xs text-gray-400">2d</span>
                </div>
                <div>
                  <Link href="/crm/1">
                    <h4 className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors">João da Silva</h4>
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">Loteamento Reserva das Flores</p>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-600 font-medium">CT</div>
                    <span className="text-xs text-gray-500">Corretor Teste</span>
                  </div>
                  <span className="text-xs font-semibold text-green-600">Score 85</span>
                </div>
              </div>
            </div>

            {/* Add Card Button */}
            <div className="p-2 border-t border-gray-100">
              <button className="flex w-full items-center justify-center rounded py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100/50 hover:text-gray-700">
                <Plus className="mr-1 h-4 w-4" /> Adicionar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
