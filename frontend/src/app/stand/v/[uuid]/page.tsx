"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useParams } from "next/navigation";
import { Loader2, RefreshCw, X, ExternalLink, CheckCircle2, Map } from "lucide-react";

const API_BASE = "";

interface StandConfig {
  nome_empreendimento: string;
  slogan: string;
  descricao: string;
  cor_primaria: string;
  template: string;
  hero_image_url: string | null;
  map_image_url: string | null;
  diferenciais: string[];
  stats_vendido: string;
  stats_total_lotes: string;
  stats_area_minima: string;
  publicado: boolean;
  plugins: {
    mapa_interativo: boolean;
    simulador_financeiro: boolean;
    tour_virtual: boolean;
  };
}

function StandPublicContent() {
  const params = useParams();
  const uuid = params.uuid as string;

  const [config, setConfig] = useState<StandConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [standUnits, setStandUnits] = useState<any[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/stand/${uuid}`);
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
      }
    } catch (err) {
      console.error("Erro config:", err);
    } finally {
      setLoading(false);
    }
  }, [uuid]);

  const fetchUnits = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/stand/v/${uuid}/units`);
      if (res.ok) {
        const data = await res.json();
        setStandUnits(data);
      }
    } catch (err) {
      console.error("Erro units:", err);
    }
  }, [uuid]);

  useEffect(() => {
    if (uuid) {
      fetchConfig();
      fetchUnits();
    }
  }, [uuid, fetchConfig, fetchUnits]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!config || !config.publicado) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="h-20 w-20 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-6">
          <RefreshCw className="h-10 w-10 animate-spin-slow" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Stand em Manutenção</h1>
        <p className="text-slate-500 max-w-md font-medium">
          Estamos preparando novidades incríveis para você. Em breve este stand estará online com todas as unidades e diferenciais.
        </p>
      </div>
    );
  }

  const heroImageSrc = config.hero_image_url
    ? `${API_BASE}${config.hero_image_url}`
    : "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";

  const mapImageSrc = config.map_image_url
    ? `${API_BASE}${config.map_image_url}`
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="w-full max-w-5xl mx-auto bg-white shadow-xl min-h-screen flex flex-col">
        {/* Navbar */}
        <div className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 lg:px-12 sticky top-0 z-50">
          <div className="font-black italic text-2xl tracking-tighter" style={{ color: config.cor_primaria }}>
            {config.nome_empreendimento.toUpperCase()}
          </div>
          <div className="hidden md:flex gap-8 text-sm font-bold text-gray-500">
            <span className="border-b-2 pb-1" style={{ color: config.cor_primaria, borderColor: config.cor_primaria }}>Início</span>
            <button className="hover:text-gray-900 cursor-pointer">Unidades</button>
            <button className="hover:text-gray-900 cursor-pointer">Localização</button>
            <button 
              className="px-6 py-2 rounded-full text-xs font-black shadow-lg text-white hover:scale-105 transition-all"
              style={{ backgroundColor: config.cor_primaria }}
            >
              CONTATO
            </button>
          </div>
        </div>

        {/* Hero */}
        <div className="relative h-[450px] lg:h-[600px]">
          <img src={heroImageSrc} className="w-full h-full object-cover" alt="Hero" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-8 lg:p-20">
            <h2 className="font-black text-white text-4xl lg:text-6xl mb-4 leading-tight max-w-3xl">
              {config.slogan}
            </h2>
            <p className="text-slate-200 max-w-2xl text-lg font-medium">
              {config.descricao}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="p-8 lg:p-16 border-b border-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { value: `${config.stats_vendido}%`, label: "Vendido" },
              { value: config.stats_total_lotes, label: "Lotes Totais" },
              { value: config.stats_area_minima, label: "Área Mínima" },
            ].map((stat) => (
              <div key={stat.label} className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 hover:shadow-lg transition-all">
                <p className="text-4xl font-black mb-2" style={{ color: config.cor_primaria }}>{stat.value}</p>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mapa Interativo */}
        {config.plugins.mapa_interativo && (
          <div className="p-8 lg:p-16 bg-slate-50/30" id="mapa">
            <h3 className="text-3xl font-black text-slate-900 mb-10 flex items-center gap-4">
              <div className="h-1.5 w-16 rounded-full" style={{ backgroundColor: config.cor_primaria }} />
              Mapa do Loteamento
            </h3>
            
            <div className="relative rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-2xl bg-white p-4 min-h-[400px]">
              {mapImageSrc ? (
                <div className="relative inline-block w-full">
                  <img src={mapImageSrc} alt="Mapa" className="w-full object-contain" />
                  
                  {standUnits.map(unit => (unit.map_x && unit.map_y) && (
                    <div 
                      key={unit.id}
                      onClick={() => setSelectedUnit(unit)}
                      className={`absolute h-4 w-4 -ml-2 -mt-2 rounded-full border-2 border-white cursor-pointer shadow-lg hover:scale-150 transition-all z-10 
                        ${unit.status === 'disponivel' ? 'bg-green-500' : 
                          unit.status === 'vendido' ? 'bg-red-500' : 
                          unit.status === 'reservado' ? 'bg-orange-500' : 'bg-gray-500'}`}
                      style={{ left: `${unit.map_x}%`, top: `${unit.map_y}%` }}
                      title={`Lote ${unit.number}`}
                    />
                  ))}
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center gap-4">
                  <Map className="h-12 w-12 text-slate-200" />
                  <p className="text-slate-400 font-bold">Imagem do mapa não configurada</p>
                </div>
              )}
            </div>

            {selectedUnit && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl">
                  <div className="p-8">
                     <div className="flex justify-between items-start mb-6">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unidade</span>
                          <h4 className="text-3xl font-black text-slate-900">{selectedUnit.block_name} {selectedUnit.number}</h4>
                        </div>
                        <button onClick={() => setSelectedUnit(null)} className="p-2 hover:bg-slate-100 rounded-full">
                          <X className="h-6 w-6 text-slate-400" />
                        </button>
                     </div>

                     <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-4 bg-slate-50 rounded-2xl">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Área</p>
                           <p className="text-lg font-black text-slate-900">{selectedUnit.area_m2}m²</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Status</p>
                           <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${selectedUnit.status === 'disponivel' ? 'bg-green-500' : 'bg-red-500'}`} />
                              <p className="text-sm font-black uppercase" style={{ color: selectedUnit.status === 'disponivel' ? '#10b981' : '#ef4444' }}>
                                 {selectedUnit.status}
                              </p>
                           </div>
                        </div>
                     </div>

                     {selectedUnit.status === 'disponivel' && (
                       <div className="mb-8">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Valor do Investimento</p>
                          <p className="text-3xl font-black text-slate-900" style={{ color: config.cor_primaria }}>
                             {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedUnit.price)}
                          </p>
                       </div>
                     )}

                     <button 
                      className="w-full py-4 rounded-2xl text-white font-black flex items-center justify-center gap-3 shadow-xl hover:scale-105 transition-all"
                      style={{ backgroundColor: config.cor_primaria }}
                      onClick={() => {
                        const msg = encodeURIComponent(`Olá! Tenho interesse no Lote ${selectedUnit.number} do ${config.nome_empreendimento}.`);
                        window.open(`https://wa.me/55?text=${msg}`);
                      }}
                     >
                        TENHO INTERESSE
                        <ExternalLink className="h-4 w-4" />
                     </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Diferenciais */}
        <div className="p-8 lg:p-16">
          <h3 className="text-3xl font-black text-slate-900 mb-10 flex items-center gap-4">
            <div className="h-1.5 w-16 rounded-full" style={{ backgroundColor: config.cor_primaria }} />
            Diferenciais
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {config.diferenciais.map((item) => (
              <div key={item} className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${config.cor_primaria}15` }}>
                  <CheckCircle2 className="h-5 w-5" style={{ color: config.cor_primaria }} />
                </div>
                <span className="text-sm font-black text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-12 text-center border-t border-slate-50 mt-auto bg-slate-50/50">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Desenvolvido por</p>
          <div className="font-black text-xl tracking-tighter" style={{ color: config.cor_primaria }}>
            CRM LOTEAMENTO
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StandPublicPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="h-10 w-10 text-indigo-600 animate-spin" /></div>}>
      <StandPublicContent />
    </Suspense>
  );
}
