"use client";

import { useState, useEffect } from "react";
import { Building, Filter, Plus, Search, Loader2, Map as MapIcon, ChevronDown, List, LayoutGrid } from "lucide-react";

const STATUS_COLORS = {
  vendido: "bg-red-500",
  disponivel: "bg-green-500",
  reservado: "bg-orange-500",
  pre_reserva: "bg-purple-500",
  res_permanente: "bg-yellow-500",
  bloqueado: "bg-black",
  indisponivel: "bg-gray-500",
};

interface Development {
  id: number;
  name: string;
  map_image_url?: string;
}

interface Block {
  id: number;
  name: string;
}

interface Unit {
  id: number;
  number: string;
  block_id: number;
  status: string;
  price: number;
  area_m2: number;
  map_x?: number;
  map_y?: number;
}

export default function UnidadesPage() {
  const [viewMode, setViewMode] = useState<"mirror" | "map">("mirror");
  const [developments, setDevelopments] = useState<Development[]>([]);
  const [selectedDevId, setSelectedDevId] = useState<number | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    fetch(`${API_BASE}/api/units/developments`)
      .then(res => res.json())
      .then(data => {
        setDevelopments(data);
        if (data.length > 0) setSelectedDevId(data[0].id);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao carregar loteamentos:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedDevId) return;

    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/api/units/developments/${selectedDevId}/blocks`).then(res => res.json()),
      fetch(`${API_BASE}/api/units/developments/${selectedDevId}/mirror`).then(res => res.json())
    ])
    .then(([blocksData, unitsData]) => {
      setBlocks(blocksData);
      setUnits(unitsData);
      setLoading(false);
    })
    .catch(err => {
      console.error("Erro ao carregar dados do loteamento:", err);
      setLoading(false);
    });
  }, [selectedDevId]);

  const selectedDev = developments.find(d => d.id === selectedDevId);

  // Estatísticas
  const totalUnits = units.length;
  const stats = Object.keys(STATUS_COLORS).reduce((acc, status) => {
    const count = units.filter(u => u.status === status).length;
    const percentage = totalUnits > 0 ? Math.round((count / totalUnits) * 100) : 0;
    acc[status] = { count, percentage };
    return acc;
  }, {} as Record<string, { count: number; percentage: number }>);

  return (
    <div className="flex h-full flex-col font-sans text-gray-900">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 uppercase">Espelho de Vendas</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Gestão de disponibilidade e mapa de lotes em tempo real.</p>
        </div>
        
        <div className="flex gap-4 items-center">
          {/* Toggle View Mode (Estilo iOS Premium) */}
          <div className="bg-gray-100 p-1 rounded-xl flex gap-1 border border-gray-200 shadow-inner">
            <button 
              onClick={() => setViewMode("mirror")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "mirror" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <LayoutGrid className="h-4 w-4" /> ESPELHO
            </button>
            <button 
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "map" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <MapIcon className="h-4 w-4" /> MAPA
            </button>
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <select
                value={selectedDevId || ""}
                onChange={(e) => setSelectedDevId(Number(e.target.value))}
                className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 bg-white shadow-sm transition-all"
              >
                {developments.map(dev => (
                  <option key={dev.id} value={dev.id}>{dev.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* DASHBOARD DE DISPONIBILIDADE */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {Object.entries(STATUS_COLORS).map(([status, color]) => {
          const { count, percentage } = stats[status] || { count: 0, percentage: 0 };
          return (
            <div key={status} className="bg-white rounded-2xl border border-gray-100 p-3 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group">
              <div className={`h-1 w-full absolute top-0 left-0 ${color}`} />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">{status.replace("_", " ")}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-gray-900">{count}</span>
                <span className="text-[10px] font-bold text-gray-400">{percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden flex-1 flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : viewMode === "mirror" ? (
          <div className="p-10 overflow-auto bg-gray-50/20 flex-1">
            <div className="space-y-12 max-w-7xl mx-auto">
              {blocks.map(block => {
                const blockUnits = units.filter(u => u.block_id === block.id);
                return (
                  <div key={block.id}>
                    <div className="flex items-center gap-4 mb-8">
                       <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">{block.name}</h3>
                       <div className="h-px flex-1 bg-gray-100" />
                       <span className="text-xs font-bold text-gray-400">{blockUnits.length} UNIDADES</span>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3">
                      {blockUnits.map(unit => (
                        <button key={unit.id} className="group relative flex flex-col items-center justify-center w-full aspect-square rounded-2xl transition-all border border-gray-100 bg-white hover:shadow-xl hover:-translate-y-1 active:scale-95">
                          <div className={`h-2.5 w-2.5 absolute top-3 right-3 rounded-full ${STATUS_COLORS[unit.status as keyof typeof STATUS_COLORS] || "bg-gray-500"} shadow-sm`} />
                          <span className="text-sm font-black text-gray-900">{unit.number}</span>
                          <span className="text-[9px] text-gray-400 font-bold">{unit.area_m2}m²</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* MAPA INTERATIVO */
          <div className="relative flex-1 bg-gray-200 overflow-hidden flex items-center justify-center p-8">
            <div className="relative inline-block max-w-full max-h-full shadow-2xl rounded-2xl overflow-hidden group">
               {selectedDev?.map_image_url ? (
                 <>
                   <img 
                    src={selectedDev.map_image_url} 
                    alt="Mapa do Loteamento" 
                    className="max-w-full max-h-[70vh] object-contain"
                   />
                   {/* Plotagem dos Lotes */}
                   {units.map(unit => (unit.map_x && unit.map_y) && (
                     <div 
                        key={unit.id}
                        className={`absolute h-4 w-4 -ml-2 -mt-2 rounded-full border-2 border-white cursor-pointer shadow-lg hover:scale-150 transition-all z-10 ${STATUS_COLORS[unit.status as keyof typeof STATUS_COLORS] || "bg-gray-500"}`}
                        style={{ left: `${unit.map_x}%`, top: `${unit.map_y}%` }}
                        title={`Lote ${unit.number} - ${unit.status}`}
                     />
                   ))}
                 </>
               ) : (
                 <div className="bg-white p-20 flex flex-col items-center gap-4 text-center">
                    <MapIcon className="h-16 w-16 text-gray-200" />
                    <p className="text-gray-400 font-medium">Imagem do mapa não configurada para este loteamento.</p>
                    <button className="text-primary text-sm font-bold underline">Configurar via Loteadora</button>
                 </div>
               )}
            </div>
            
            {/* Legenda Flutuante */}
            <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur p-4 rounded-2xl border border-gray-100 shadow-xl space-y-2">
               <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Legenda Mapa</p>
               {Object.entries(STATUS_COLORS).slice(0, 3).map(([status, color]) => (
                 <div key={status} className="flex items-center gap-2 text-xs font-bold">
                    <div className={`h-2 w-2 rounded-full ${color}`} />
                    <span className="capitalize">{status}</span>
                 </div>
               ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
