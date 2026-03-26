"use client";

import { useState, useRef, useEffect } from "react";
import { Save, Plus, Trash2, Info, Maximize2, Move } from "lucide-react";

interface Pin {
  id: number;
  x: number;
  y: number;
  lote: string;
  quadra: string;
}

export default function ConfigurarMapaPage() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const handleMapClick = (e: React.MouseEvent) => {
    if (!mapRef.current) return;
    
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newPin: Pin = {
      id: Date.now(),
      x,
      y,
      lote: (pins.length + 1).toString(),
      quadra: "01"
    };

    setPins([...pins, newPin]);
    setSelectedPin(newPin);
  };

  const updatePin = (id: number, field: keyof Pin, value: string) => {
    setPins(pins.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const deletePin = (id: number) => {
    setPins(pins.filter(p => p.id !== id));
    setSelectedPin(null);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Configurar Mapa Interativo</h1>
          <p className="text-sm text-gray-500 mt-1">Clique no mapa para posicionar os lotes e preencher as informações.</p>
        </div>
        <button className="bg-primary text-white font-bold py-2 px-6 rounded-lg shadow-lg shadow-primary/20 flex items-center gap-2">
          <Save className="h-4 w-4" /> Salvar Configuração
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        {/* Mapa de Edição */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-3 border-b border-gray-100 flex justify-between bg-gray-50">
             <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
               <Move className="h-3 w-3" /> Editor de Planta
             </span>
             <span className="text-xs text-gray-400 font-medium">{pins.length} Lotes Mapeados</span>
          </div>
          <div 
            ref={mapRef}
            onClick={handleMapClick}
            className="flex-1 relative cursor-crosshair bg-gray-100 overflow-hidden"
            style={{ 
              backgroundImage: 'url("/mapa_loteamento.png")',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {pins.map((pin) => (
              <div
                key={pin.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPin(pin);
                }}
                className={`absolute h-6 w-6 -ml-3 -mt-3 rounded-full border-2 border-white shadow-lg cursor-pointer transition-transform hover:scale-125 flex items-center justify-center text-[8px] font-bold text-white
                  ${selectedPin?.id === pin.id ? "bg-primary scale-125 ring-4 ring-primary/20" : "bg-green-500"}
                `}
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              >
                {pin.lote}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar de Configuração */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col gap-6">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
             <Info className="h-4 w-4 text-primary" /> Informações do Lote
          </h3>
          
          {selectedPin ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Número do Lote</label>
                <input 
                  type="text" 
                  value={selectedPin.lote}
                  onChange={(e) => updatePin(selectedPin.id, "lote", e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Quadra</label>
                <input 
                  type="text" 
                  value={selectedPin.quadra}
                  onChange={(e) => updatePin(selectedPin.id, "quadra", e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Área (m²)</label>
                <input type="text" placeholder="Ex: 250" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Valor do Lote (R$)</label>
                <input type="text" placeholder="Ex: 150.000" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
              </div>
              
              <button 
                onClick={() => deletePin(selectedPin.id)}
                className="w-full py-2 flex items-center justify-center gap-2 text-red-500 font-bold text-xs bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="h-4 w-4" /> Excluir Marcador
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
               <Plus className="h-8 w-8 text-gray-300 mb-2" />
               <p className="text-xs text-gray-400 font-medium italic">Selecione ou clique no mapa para configurar um lote.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
