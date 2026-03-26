"use client";

import { Building, Filter, Plus, Search } from "lucide-react";

const STATUS_COLORS = {
  vendido: "bg-red-500",
  disponivel: "bg-green-500",
  reservado: "bg-orange-500",
  pre_reserva: "bg-purple-500",
  res_permanente: "bg-yellow-500",
  bloqueado: "bg-black",
  indisponivel: "bg-gray-500",
};

export default function UnidadesPage() {
  // Mock data para a grade de unidades
  const andares = Array.from({ length: 10 }, (_, i) => 10 - i);
  const colunas = Array.from({ length: 8 }, (_, i) => i + 1);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Gestão de Unidades</h1>
          <p className="text-sm text-gray-500 mt-1">Espelho de vendas e mapa interativo.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar unidade..." 
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-gray-300 hover:bg-gray-100 h-10 px-4 bg-white text-gray-700 shadow-sm">
            <Filter className="mr-2 h-4 w-4" /> Filtros
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex flex-wrap gap-4">
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${color}`} />
                <span className="text-xs font-medium text-gray-600 capitalize">
                  {status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 overflow-auto">
          <div className="min-w-fit inline-block border border-gray-200 rounded-lg">
            <div className="grid grid-cols-[60px_repeat(8,1fr)] gap-px bg-gray-200">
              <div className="bg-gray-50 flex items-center justify-center font-bold text-gray-400 text-xs py-2">Andar</div>
              {colunas.map(c => (
                <div key={c} className="bg-gray-50 flex items-center justify-center font-bold text-gray-400 text-xs py-2">{c}</div>
              ))}
              
              {andares.map(andar => (
                <>
                  <div key={`andar-${andar}`} className="bg-gray-50 flex items-center justify-center font-bold text-gray-700 text-sm py-4">
                    {andar}º
                  </div>
                  {colunas.map(col => {
                    const statusKeys = Object.keys(STATUS_COLORS);
                    const randomStatus = statusKeys[Math.floor(Math.random() * statusKeys.length)];
                    const statusColor = STATUS_COLORS[randomStatus as keyof typeof STATUS_COLORS];
                    
                    return (
                      <button 
                        key={`${andar}-${col}`} 
                        className={`bg-white p-2 hover:bg-gray-50 transition-colors group relative`}
                      >
                        <div className={`h-full w-full rounded border-2 border-transparent flex items-center justify-center text-xs font-bold text-white ${statusColor} py-2`}>
                          {andar}{col.toString().padStart(2, '0')}
                        </div>
                      </button>
                    );
                  })}
                </>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
