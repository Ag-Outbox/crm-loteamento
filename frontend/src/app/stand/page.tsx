"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import {
  Globe,
  Plus,
  RefreshCw,
  Loader2,
  Trash2,
  ExternalLink,
  Save,
  Share2,
  Check,
  ChevronLeft,
  Layout,
  Brush,
  Palette,
  Image as ImageIcon,
  Map as MapIcon,
  X,
  AlertCircle,
  Settings,
  CheckCircle2,
} from "lucide-react";

const API_BASE = "";

// ─── Types ──────────────────────────────────────────────────────────────────
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

interface StandSummary {
  id: number;
  uuid: string;
  name: string;
  is_active: boolean;
  development_id: number | null;
  config: StandConfig;
  created_at: string;
}

const PALETTE = [
  { name: "Índigo", value: "#4f46e5" },
  { name: "Violeta", value: "#7c3aed" },
  { name: "Esmeralda", value: "#059669" },
  { name: "Rosa", value: "#e11d48" },
  { name: "Âmbar", value: "#d97706" },
  { name: "Ciano", value: "#0891b2" },
];

function StandManagerContent() {
  const [stands, setStands] = useState<StandSummary[]>([]);
  const [selectedUuid, setSelectedUuid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newStandName, setNewStandName] = useState("");
  const [developments, setDevelopments] = useState<any[]>([]);

  // Estados do Editor
  const [localConfig, setLocalConfig] = useState<StandConfig | null>(null);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingMap, setUploadingMap] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "loading" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" | "loading", duration = 3000) => {
    setToast({ msg, type });
    if (type !== "loading") setTimeout(() => setToast(null), duration);
  };

  const fetchStands = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/stand/list`);
      if (res.ok) {
        const data = await res.json();
        setStands(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDevelopments = useCallback(async () => {
    try {
      const res = await fetch("/api/units/developments");
      if (res.ok) setDevelopments(await res.json());
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    fetchStands();
    fetchDevelopments();
  }, [fetchStands, fetchDevelopments]);

  const handleCreateStand = async () => {
    if (!newStandName) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", newStandName);
      const res = await fetch(`${API_BASE}/api/stand/create`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setStands([...stands, data]);
        setIsCreating(false);
        setNewStandName("");
        setSelectedUuid(data.uuid);
        setLocalConfig(data.config);
        showToast("Site de apresentação gerado!", "success");
      }
    } catch (err) {
      showToast("Erro ao criar stand", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEditStand = (stand: StandSummary) => {
    setSelectedUuid(stand.uuid);
    setLocalConfig(stand.config);
  };

  const handleSaveConfig = async () => {
    if (!selectedUuid || !localConfig) return;
    setSaving(true);
    showToast("Salvando...", "loading");
    try {
      const formData = new FormData();
      Object.entries(localConfig).forEach(([key, value]) => {
        if (typeof value === "object") {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      });

      const res = await fetch(`${API_BASE}/api/stand/${selectedUuid}/config`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        showToast("Configurações salvas!", "success");
        fetchStands();
      }
    } catch (err) {
      showToast("Erro ao salvar", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStand = async (uuid: string) => {
    if (!confirm("Tem certeza que deseja excluir este stand?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/stand/${uuid}`, { method: "DELETE" });
      if (res.ok) {
        setStands(stands.filter(s => s.uuid !== uuid));
        showToast("Stand excluído", "success");
      }
    } catch (err) { showToast("Erro ao excluir", "error"); }
  };

  // ── Render Listagem ────────────────────────────────────────────────────────
  if (!selectedUuid) {
    return (
      <div className="p-6 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-10">
          <div>
             <h1 className="text-3xl font-black text-gray-900 tracking-tight">Vitrines Digitais (Stands)</h1>
             <p className="text-slate-500 font-medium">Gerencie seus sites de apresentação para cada loteamento</p>
          </div>
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-primary text-white font-black py-3 px-6 rounded-2xl flex items-center gap-2 shadow-xl shadow-primary/20 hover:scale-105 transition-all"
          >
            <Plus className="h-5 w-5" /> Gerar Novo Link
          </button>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          </div>
        ) : stands.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-20 text-center flex flex-col items-center gap-4">
             <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                <Globe className="h-10 w-10" />
             </div>
             <h2 className="text-xl font-black text-slate-800">Nenhum Stand Gerado</h2>
             <p className="text-slate-400 max-w-md">Crie seu primeiro site de apresentação clicando no botão acima e comece a vender suas unidades online.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stands.map(stand => (
              <div key={stand.uuid} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all">
                <div className="h-32 bg-slate-50 flex items-center justify-center text-slate-200 group-hover:bg-primary/5 transition-all">
                   <Monitor className="h-12 w-12" />
                </div>
                <div className="p-6">
                  <h3 className="font-black text-slate-900 text-lg mb-1">{stand.name}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4">
                    {stand.is_active ? "● Online" : "○ Offline"}
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditStand(stand)}
                      className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-black text-xs hover:bg-slate-800 transition-all"
                    >
                      GERENCIAR
                    </button>
                    <button 
                      onClick={() => window.open(`/stand/v/${stand.uuid}`, '_blank')}
                      className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteStand(stand.uuid)}
                      className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Criação */}
        {isCreating && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
               <h2 className="text-2xl font-black text-slate-900 mb-6">Novo Site de Stand</h2>
               <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2">Nome do Site</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Reserva das Flores - Lançamento" 
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                      value={newStandName}
                      onChange={(e) => setNewStandName(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button onClick={() => setIsCreating(false)} className="flex-1 py-4 text-slate-400 font-black">CANCELAR</button>
                    <button 
                      disabled={!newStandName || saving}
                      onClick={handleCreateStand}
                      className="flex-1 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50"
                    >
                      {saving ? "GERANDO..." : "CRIAR AGORA"}
                    </button>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Render Editor ─────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {toast && <div className={`fixed bottom-6 right-6 z-[999] px-6 py-4 rounded-2xl text-white font-black shadow-2xl flex items-center gap-3 animate-in slide-in-from-right ${toast.type === 'success' ? 'bg-emerald-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-primary'}`}>
        {toast.type === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
        {toast.msg}
      </div>}

      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-4">
           <button onClick={() => setSelectedUuid(null)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400"><ChevronLeft className="h-6 w-6" /></button>
           <div>
              <h2 className="font-black text-slate-900">{stands.find(s => s.uuid === selectedUuid)?.name}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Editor de Vitrine</p>
           </div>
        </div>
        <div className="flex gap-3">
           <button 
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/stand/v/${selectedUuid}`);
              showToast("Link copiado!", "success");
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl font-black text-xs hover:bg-slate-100 transition-all"
           >
              <Share2 className="h-4 w-4" /> COPIAR LINK
           </button>
           <button 
            onClick={handleSaveConfig}
            className="bg-primary text-white px-6 py-2 rounded-xl font-black text-xs shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
           >
              SALVAR SITE
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
         <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
               <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Conteúdo Principal</h3>
                  <div className="space-y-4">
                     <div>
                        <label className="block text-xs font-black text-slate-500 mb-2">Vincular Loteamento</label>
                        <select 
                          className="w-full p-3 bg-slate-50 rounded-xl border-none font-bold text-sm"
                          value={localConfig?.development_id || ""}
                          onChange={(e) => setLocalConfig({...localConfig!, development_id: Number(e.target.value)})}
                        >
                          <option value="">Selecione um loteamento</option>
                          {developments.map(dev => <option key={dev.id} value={dev.id}>{dev.name}</option>)}
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-black text-slate-500 mb-2">Nome Comercial</label>
                        <input className="w-full p-3 bg-slate-50 rounded-xl border-none font-bold text-sm" value={localConfig?.nome_empreendimento} onChange={e => setLocalConfig({...localConfig!, nome_empreendimento: e.target.value})} />
                     </div>
                     <div>
                        <label className="block text-xs font-black text-slate-500 mb-2">Slogan d'O Stand</label>
                        <input className="w-full p-3 bg-slate-50 rounded-xl border-none font-bold text-sm" value={localConfig?.slogan} onChange={e => setLocalConfig({...localConfig!, slogan: e.target.value})} />
                     </div>
                  </div>
               </div>

               <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Identidade Visual</h3>
                  <div className="grid grid-cols-6 gap-2">
                     {PALETTE.map(c => (
                        <button 
                          key={c.value} 
                          onClick={() => setLocalConfig({...localConfig!, cor_primaria: c.value})}
                          style={{ backgroundColor: c.value }} 
                          className={`h-10 w-10 rounded-full transition-all ${localConfig?.cor_primaria === c.value ? 'ring-4 ring-offset-2 scale-110' : 'hover:scale-105'}`}
                        />
                     ))}
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Imagens da Vitrine</h3>
                  <div className="space-y-4">
                     <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center cursor-pointer hover:border-primary transition-all">
                        <ImageIcon className="h-6 w-6 mx-auto mb-2 text-slate-300" />
                        <p className="text-[10px] font-black text-slate-400">IMAGEM HERO</p>
                        {localConfig?.hero_image_url && <p className="text-[8px] text-emerald-500 font-bold mt-1">✓ ENVIADA</p>}
                     </div>
                     <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center cursor-pointer hover:border-primary transition-all">
                        <MapIcon className="h-6 w-6 mx-auto mb-2 text-slate-300" />
                        <p className="text-[10px] font-black text-slate-400">MAPA DO LOTEAMENTO</p>
                        {localConfig?.map_image_url && <p className="text-[8px] text-emerald-500 font-bold mt-1">✓ ENVIADA</p>}
                     </div>
                     <p className="text-[10px] text-slate-400 text-center">Os uploads serão salvos automaticamente ao selecionar os arquivos.</p>
                  </div>
               </div>

               <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Publicação</h3>
                  <label className="flex items-center justify-between cursor-pointer">
                     <span className="text-sm font-bold text-slate-700">Site está Online?</span>
                     <input type="checkbox" className="sr-only peer" checked={localConfig?.publicado} onChange={e => setLocalConfig({...localConfig!, publicado: e.target.checked})} />
                     <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                  </label>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

export default function StandOnlinePage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-transparent"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>}>
      <StandManagerContent />
    </Suspense>
  );
}
