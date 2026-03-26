"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  ShieldCheck, 
  Clock, 
  UserCheck, 
  X, 
  Edit3, 
  Scan, 
  Save, 
  Plus, 
  Trash2, 
  Upload,
  Loader2,
  Settings2,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface Lote {
  id: number | string;
  x: number;
  y: number;
  lote: string;
  quadra: string;
  status: string;
  preco: number;
}

export default function MapaVendasPage() {
  const [selectedLote, setSelectedLote] = useState<Lote | null>(null);
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [userRole, setUserRole] = useState<string>("broker");
  const [showGallery, setShowGallery] = useState(false);
  
  const [mapZoom, setMapZoom] = useState(1);
  const [markerSize, setMarkerSize] = useState(36);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Imagens do loteamento
  const [galleryImages, setGalleryImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1524813636040-af84617154f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  ]);

  // Mock de lotes cadastrados
  const [lotes, setLotes] = useState<Lote[]>([
    { id: 1, x: 25, y: 30, lote: "01", quadra: "A", status: "disponivel", preco: 150000 },
    { id: 2, x: 28, y: 30, lote: "02", quadra: "A", status: "reservado", preco: 155000 },
    { id: 3, x: 31, y: 30, lote: "03", quadra: "A", status: "vendido", preco: 160000 },
    { id: 4, x: 34, y: 30, lote: "04", quadra: "A", status: "bloqueado", preco: 150000 },
  ]);

  useEffect(() => {
    const role = localStorage.getItem("user_role");
    if (role) setUserRole(role);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "disponivel": return "bg-green-500 ring-green-100";
      case "reservado": return "bg-orange-500 ring-orange-100";
      case "vendido": return "bg-red-500 ring-red-100";
      case "bloqueado": return "bg-gray-500 ring-gray-100";
      default: return "bg-blue-500 ring-blue-100";
    }
  };

  const handleDetectAI = () => {
    setIsDetecting(true);
    setTimeout(() => {
      const detected: Lote[] = [
        ...lotes,
        { id: `new-${Date.now()}-1`, x: 45, y: 50, lote: "??", quadra: "??", status: "disponivel", preco: 0 },
        { id: `new-${Date.now()}-2`, x: 48, y: 50, lote: "??", quadra: "??", status: "disponivel", preco: 0 },
        { id: `new-${Date.now()}-3`, x: 51, y: 50, lote: "??", quadra: "??", status: "disponivel", preco: 0 },
      ];
      setLotes(detected);
      setIsDetecting(false);
    }, 2000);
  };

  const addMarker = (e: React.MouseEvent) => {
    if (!isEditorMode || !mapRef.current) return;
    
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newLote: Lote = {
      id: `new-${Date.now()}`,
      x,
      y,
      lote: "Novo",
      quadra: "X",
      status: "disponivel",
      preco: 0
    };

    setLotes([...lotes, newLote]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setGalleryImages([url, ...galleryImages]);
    }
  };

  const handleDrag = (id: number | string, x: number, y: number) => {
    setLotes(lotes.map(l => l.id === id ? { ...l, x, y } : l));
  };

  return (
    <div className="flex h-full flex-col relative bg-slate-50 overflow-hidden">
      {/* Header com Modo Editor e Fotos */}
      <div className="absolute top-6 right-6 z-30 flex gap-3">
        <button 
           onClick={() => setShowGallery(!showGallery)}
           className="flex items-center gap-2 bg-white text-gray-700 font-bold py-2.5 px-5 rounded-xl shadow-xl hover:bg-gray-50 transition-all border border-slate-100"
        >
           <ImageIcon className="h-5 w-5 text-primary" />
           Fotos do Loteamento
        </button>
        {userRole === "admin" && (
          <button 
            onClick={() => setIsEditorMode(!isEditorMode)}
            className={`flex items-center gap-2 font-bold py-2.5 px-5 rounded-xl shadow-xl transition-all ${
              isEditorMode ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-slate-100'
            }`}
          >
            {isEditorMode ? <Save className="h-5 w-5" /> : <Edit3 className="h-5 w-5" />}
            {isEditorMode ? "Salvar Mapa" : "Gerenciar Mapa"}
          </button>
        )}
      </div>

      {/* Galeria de Imagens (Flyout Lateral) */}
      {showGallery && (
        <div className="absolute top-20 right-6 z-40 bg-white/95 backdrop-blur-md p-6 rounded-[2.5rem] shadow-2xl border border-white/20 w-[400px] animate-in slide-in-from-right duration-300">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Fotos do Empreendimento</h3>
              <button onClick={() => setShowGallery(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
           </div>

           {userRole === "admin" && (
             <div 
               onClick={() => fileInputRef.current?.click()}
               className="mb-6 h-32 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
             >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                   <Upload className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-slate-500">Clique para enviar fotos</p>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*" />
             </div>
           )}

           <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
              {galleryImages.map((img, idx) => (
                <div key={idx} className="group relative h-32 rounded-xl overflow-hidden shadow-sm border border-slate-100">
                   <img src={img} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button className="p-2 bg-white rounded-lg text-gray-900"><Maximize2 className="h-4 w-4" /></button>
                      {userRole === 'admin' && <button className="p-2 bg-red-500 rounded-lg text-white"><Trash2 className="h-4 w-4" /></button>}
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* Toolbar do Editor - Expandido com Sliders de proporção */}
      {isEditorMode && (
        <div className="absolute top-20 right-6 z-30 bg-white/95 backdrop-blur-md p-5 rounded-[2rem] shadow-2xl border border-white/20 w-72 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2 mb-4">
             <Settings2 className="h-4 w-4 text-primary" />
             <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Ajustes de Proporção</h3>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-[10px] font-black text-gray-500 uppercase">Zoom do Mapa</label>
                <span className="text-[10px] font-bold text-primary">{Math.round(mapZoom * 100)}%</span>
              </div>
              <input 
                type="range" min="0.5" max="3" step="0.1" 
                value={mapZoom} 
                onChange={(e) => setMapZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-[10px] font-black text-gray-500 uppercase">Tamanho das Bolinhas</label>
                <span className="text-[10px] font-bold text-primary">{markerSize}px</span>
              </div>
              <input 
                type="range" min="10" max="80" step="1" 
                value={markerSize} 
                onChange={(e) => setMarkerSize(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <button 
              onClick={handleDetectAI}
              disabled={isDetecting}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3.5 rounded-2xl hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {isDetecting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Scan className="h-5 w-5" />}
              Auto-Detectar Lotes
            </button>
          </div>
        </div>
      )}

      {/* Overlay de Legenda */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-4">
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Disponibilidade</h3>
          <div className="space-y-2.5">
            {[
              { status: "disponivel", label: "Disponível" },
              { status: "reservado", label: "Reservado" },
              { status: "vendido", label: "Vendido" },
              { status: "bloqueado", label: "Bloqueado" },
            ].map(s => (
              <div key={s.status} className="flex items-center gap-2 text-xs font-bold text-gray-700">
                <span className={`h-3.5 w-3.5 rounded-full ${getStatusColor(s.status).split(' ')[0]} shadow-sm`}></span>
                {s.label}
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-xl border border-white/20 flex flex-col gap-1">
           <button onClick={() => setMapZoom(prev => Math.min(prev + 0.2, 3))} className="p-2.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"><ZoomIn className="h-5 w-5" /></button>
           <button onClick={() => setMapZoom(prev => Math.max(prev - 0.2, 0.5))} className="p-2.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"><ZoomOut className="h-5 w-5" /></button>
        </div>
      </div>

      {/* Container Principal com Scroll */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto bg-slate-200 m-4 rounded-[2.5rem] shadow-inner relative flex items-center justify-center p-20"
      >
        <div 
          ref={mapRef}
          onClick={addMarker}
          className={`relative shadow-2xl transition-transform duration-200 ease-out flex-shrink-0 bg-white ${isEditorMode ? 'cursor-crosshair border-2 border-primary/30 border-dashed' : ''}`}
          style={{ 
            width: '1200px', 
            height: '800px', 
            transform: `scale(${mapZoom})`,
            transformOrigin: 'center center'
          }}
        >
          <div 
            className="absolute inset-0 bg-no-repeat bg-contain bg-center"
            style={{ backgroundImage: 'url("/mapa_loteamento.png")' }}
          >
            {lotes.map((lote) => (
              <div
                key={lote.id}
                draggable={isEditorMode}
                onDragEnd={(e) => {
                  if (!isEditorMode || !mapRef.current) return;
                  const rect = mapRef.current.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  handleDrag(lote.id, x, y);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedLote(lote);
                }}
                className={`absolute rounded-full border-2 border-white shadow-lg cursor-pointer transition-all hover:scale-110 flex items-center justify-center text-[10px] font-black text-white ring-2
                  ${getStatusColor(lote.status)}
                  ${isEditorMode ? 'hover:ring-primary/60 ring-transparent' : ''}
                `}
                style={{ 
                  left: `${lote.x}%`, 
                  top: `${lote.y}%`,
                  width: `${markerSize}px`,
                  height: `${markerSize}px`,
                  marginLeft: `-${markerSize / 2}px`,
                  marginTop: `-${markerSize / 2}px`,
                  fontSize: `${markerSize / 3.5}px`
                }}
              >
                {lote.lote}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detalhes do Lote */}
      {selectedLote && (
        <div className="absolute top-6 right-6 z-40 w-80 bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-right duration-300">
           <div className={`h-2.5 w-full ${getStatusColor(selectedLote.status).split(' ')[0]}`}></div>
           <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                 <div>
                    {isEditorMode ? (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase">Nº Lote</label>
                        <input 
                          type="text" 
                          value={selectedLote.lote} 
                          onChange={(e) => setLotes(lotes.map(l => l.id === selectedLote.id ? {...l, lote: e.target.value} : l))}
                          className="text-2xl font-black text-gray-900 border-b-2 border-primary outline-none w-full" 
                        />
                      </div>
                    ) : (
                      <>
                        <h2 className="text-3xl font-black text-gray-900 leading-none">LOTE {selectedLote.lote}</h2>
                        <p className="text-sm font-bold text-gray-400 uppercase mt-2 tracking-wider">Quadra {selectedLote.quadra}</p>
                      </>
                    )}
                 </div>
                 <button onClick={() => setSelectedLote(null)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors">
                    <X className="h-6 w-6" />
                 </button>
              </div>

              <div className="flex flex-col gap-3">
                 {isEditorMode ? (
                    <button 
                      onClick={() => { setLotes(lotes.filter(l => l.id !== selectedLote.id)); setSelectedLote(null); }}
                      className="w-full bg-red-50 text-red-600 font-bold py-4 rounded-xl hover:bg-red-100 flex items-center justify-center gap-2"
                    >
                      <Trash2 className="h-5 w-5" /> Excluir Marcador
                    </button>
                 ) : (
                    <button className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all">Reservar Lote</button>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
