"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Globe,
  Monitor,
  Smartphone,
  Layout,
  ExternalLink,
  Eye,
  Settings,
  Brush,
  Share2,
  CheckCircle2,
  Copy,
  ChevronRight,
  Plus,
  Upload,
  Trash2,
  Save,
  Image as ImageIcon,
  Map,
  Loader2,
  RefreshCw,
  X,
  Edit3,
  Palette,
  FileImage,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  Check,
} from "lucide-react";

// URL-base é a raiz do site agora, já que o Next.js fará o rewrite (proxy) das chamadas /api para o Backend.
// Isso corta o CORS e permite acessar tudo pela mesma URL
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

const DEFAULT_CONFIG: StandConfig = {
  nome_empreendimento: "Reserva das Flores",
  slogan: "Onde a natureza e o design se encontram.",
  descricao:
    "Lotes a partir de 250m² com infraestrutura de lazer completa e segurança 24h para sua família.",
  cor_primaria: "#4f46e5",
  template: "premium",
  hero_image_url: null,
  map_image_url: null,
  diferenciais: [
    "Quadra de Tênis",
    "Portais Monumentais",
    "Ciclovias",
    "Rede de Esgoto Própria",
  ],
  stats_vendido: "85",
  stats_total_lotes: "120",
  stats_area_minima: "250m²",
  publicado: true,
  plugins: {
    mapa_interativo: true,
    simulador_financeiro: true,
    tour_virtual: false,
  },
};

const PALETTE = [
  { name: "Índigo", value: "#4f46e5" },
  { name: "Violeta", value: "#7c3aed" },
  { name: "Esmeralda", value: "#059669" },
  { name: "Rosa", value: "#e11d48" },
  { name: "Âmbar", value: "#d97706" },
  { name: "Ciano", value: "#0891b2" },
];

// ─── Upload Area component ───────────────────────────────────────────────────
function UploadArea({
  label,
  hint,
  currentUrl,
  onUpload,
  onRemove,
  uploading,
  icon: Icon,
}: {
  label: string;
  hint: string;
  currentUrl: string | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
  uploading: boolean;
  icon: React.ElementType;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) onUpload(file);
    },
    [onUpload]
  );

  const imageUrl = currentUrl ? `${API_BASE}${currentUrl}` : null;

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-gray-500 ml-1">
        {label}
      </label>

      {imageUrl ? (
        <div className="relative group rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
          <img
            src={imageUrl}
            alt={label}
            className="w-full h-32 object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              onClick={() => inputRef.current?.click()}
              className="p-2 bg-white rounded-xl text-gray-900 hover:bg-gray-100 transition-colors"
              title="Trocar imagem"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={onRemove}
              className="p-2 bg-red-500 rounded-xl text-white hover:bg-red-600 transition-colors"
              title="Remover imagem"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={`h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer
            ${uploading ? "opacity-60 cursor-wait border-primary/40 bg-primary/5" : "border-slate-200 hover:border-primary/50 hover:bg-primary/5"}`}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          ) : (
            <>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold text-slate-500">
                Clique ou arraste a imagem aqui
              </p>
              <p className="text-[10px] text-slate-400">{hint}</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            onUpload(file);
            e.target.value = "";
          }
        }}
      />
    </div>
  );
}

// ─── Toast component ─────────────────────────────────────────────────────────
function Toast({
  msg,
  type,
}: {
  msg: string;
  type: "success" | "error" | "loading";
}) {
  const colors = {
    success: "bg-emerald-600",
    error: "bg-red-600",
    loading: "bg-indigo-600",
  };
  const icons = {
    success: <Check className="h-4 w-4" />,
    error: <AlertCircle className="h-4 w-4" />,
    loading: <Loader2 className="h-4 w-4 animate-spin" />,
  };
  return (
    <div
      className={`fixed bottom-6 right-6 z-[999] flex items-center gap-3 ${colors[type]} text-white font-bold py-3 px-5 rounded-2xl shadow-2xl animate-in slide-in-from-bottom duration-300`}
    >
      {icons[type]}
      {msg}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
function StandOnlineContent() {
  const searchParams = useSearchParams();
  const isPublicView = searchParams.get("view") === "true";

  const [activeTab, setActiveTab] = useState<"preview" | "settings">("preview");
  const [config, setConfig] = useState<StandConfig>(DEFAULT_CONFIG);
  const [localConfig, setLocalConfig] = useState<StandConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingMap, setUploadingMap] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error" | "loading";
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">(
    "desktop"
  );

  const showToast = (
    msg: string,
    type: "success" | "error" | "loading",
    duration = 3000
  ) => {
    setToast({ msg, type });
    if (type !== "loading") setTimeout(() => setToast(null), duration);
  };

  // ── Carregar config da API ──────────────────────────────────────────────────
  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/stand/config`);
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
        setLocalConfig(data);
      }
    } catch {
      // API offline, usa defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  // ── Salvar configurações ───────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    showToast("Salvando...", "loading");
    try {
      const formData = new FormData();
      formData.append("nome_empreendimento", localConfig.nome_empreendimento);
      formData.append("slogan", localConfig.slogan);
      formData.append("descricao", localConfig.descricao);
      formData.append("cor_primaria", localConfig.cor_primaria);
      formData.append("template", localConfig.template);
      formData.append("stats_vendido", localConfig.stats_vendido);
      formData.append("stats_total_lotes", localConfig.stats_total_lotes);
      formData.append("stats_area_minima", localConfig.stats_area_minima);
      formData.append(
        "diferenciais",
        JSON.stringify(localConfig.diferenciais)
      );
      formData.append(
        "plugins",
        JSON.stringify(localConfig.plugins)
      );
      formData.append(
        "publicado",
        localConfig.publicado ? "true" : "false"
      );

      const res = await fetch(`${API_BASE}/api/stand/config`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
        setLocalConfig(data.config);
        showToast("Configurações salvas com sucesso!", "success");
      } else {
        showToast("Erro ao salvar configurações.", "error");
      }
    } catch {
      showToast("Sem conexão com o servidor.", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Upload Imagens ─────────────────────────────────────────────────────────
  const handleUploadHero = async (file: File) => {
    setUploadingHero(true);
    showToast("Enviando imagem principal...", "loading");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE}/api/stand/upload/hero-image`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        const updated = { ...localConfig, hero_image_url: data.url };
        setConfig(updated);
        setLocalConfig(updated);
        showToast("Imagem principal atualizada!", "success");
      } else {
        const err = await res.json();
        showToast(err.detail || "Falha no upload.", "error");
      }
    } catch {
      showToast("Erro ao conectar ao servidor.", "error");
    } finally {
      setUploadingHero(false);
    }
  };

  const handleUploadMap = async (file: File) => {
    setUploadingMap(true);
    showToast("Enviando imagem do mapa...", "loading");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE}/api/stand/upload/map-image`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        const updated = { ...localConfig, map_image_url: data.url };
        setConfig(updated);
        setLocalConfig(updated);
        showToast("Imagem do mapa atualizada!", "success");
      } else {
        const err = await res.json();
        showToast(err.detail || "Falha no upload.", "error");
      }
    } catch {
      showToast("Erro ao conectar ao servidor.", "error");
    } finally {
      setUploadingMap(false);
    }
  };

  const handleRemoveHero = async () => {
    try {
      await fetch(`${API_BASE}/api/stand/upload/hero-image`, {
        method: "DELETE",
      });
      const updated = { ...localConfig, hero_image_url: null };
      setConfig(updated);
      setLocalConfig(updated);
      showToast("Imagem removida.", "success");
    } catch {
      showToast("Erro ao remover imagem.", "error");
    }
  };

  const handleRemoveMap = async () => {
    try {
      await fetch(`${API_BASE}/api/stand/upload/map-image`, {
        method: "DELETE",
      });
      const updated = { ...localConfig, map_image_url: null };
      setConfig(updated);
      setLocalConfig(updated);
      showToast("Imagem do mapa removida.", "success");
    } catch {
      showToast("Erro ao remover imagem.", "error");
    }
  };

  const handleCopyLink = () => {
    const publicUrl = `${window.location.origin}/stand?view=true`;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const heroImageSrc = config.hero_image_url
    ? `${API_BASE}${config.hero_image_url}`
    : "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";

  const mapImageSrc = config.map_image_url
    ? `${API_BASE}${config.map_image_url}`
    : null;

  const hasChanges =
    JSON.stringify(config) !== JSON.stringify(localConfig);

  if (isPublicView) {
    if (loading) {
      return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
      );
    }

    if (!config.publicado) {
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

    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <div className="w-full max-w-5xl mx-auto bg-white shadow-xl min-h-screen flex flex-col">
          {/* Navbar do Stand */}
          <div className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 lg:px-12 sticky top-0 z-50">
            <div className="font-black italic text-2xl tracking-tighter" style={{ color: config.cor_primaria }}>
              {config.nome_empreendimento.toUpperCase()}
            </div>
            <div className="hidden md:flex gap-8 text-sm font-bold text-gray-500">
              <span className="border-b-2 pb-1" style={{ color: config.cor_primaria, borderColor: config.cor_primaria }}>Início</span>
              <span className="hover:text-gray-900 cursor-pointer">Unidades</span>
              <span className="hover:text-gray-900 cursor-pointer">Localização</span>
              <button 
                className="bg-primary text-white px-6 py-2 rounded-full text-xs font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all"
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

          {/* Mapa Interactiva */}
          {config.plugins.mapa_interativo && (
            <div className="p-8 lg:p-16 bg-slate-50/30">
              <h3 className="text-3xl font-black text-slate-900 mb-10 flex items-center gap-4">
                <div className="h-1.5 w-16 rounded-full" style={{ backgroundColor: config.cor_primaria }} />
                Mapa do Loteamento
              </h3>
              {mapImageSrc ? (
                <div className="rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-2xl bg-white p-4">
                  <img src={mapImageSrc} alt="Mapa" className="w-full object-contain" />
                </div>
              ) : (
                <div className="h-64 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 bg-white">
                  <Map className="h-12 w-12 text-slate-200" />
                  <p className="text-slate-400 font-bold">Mapa em breve</p>
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
                <div key={item} className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-4 hover:border-primary/20 transition-all">
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

  return (
    <div className="flex h-full flex-col">
      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Stand Online
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Configure a vitrine digital para seus clientes consultarem as
            unidades
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCopyLink}
            className="bg-white border border-gray-200 text-gray-700 font-bold py-2.5 px-5 rounded-xl shadow-sm hover:bg-gray-50 flex items-center gap-2 transition-all"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            {copied ? "Copiado!" : "Link do Stand"}
          </button>
          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-amber-500 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-amber-500/20 hover:bg-amber-600 flex items-center gap-2 transition-all disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar Alterações
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 flex items-center gap-2 transition-all disabled:opacity-60"
          >
            <Globe className="h-4 w-4" /> Publicar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 min-h-0">
        {/* ── Painel de Configurações Lateral ── */}
        <div className="lg:col-span-1 space-y-6 overflow-y-auto pr-2 pb-10">
          {/* Imagens */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-5 border-b border-slate-50 pb-3">
              Imagens
            </h3>
            <div className="space-y-5">
              <UploadArea
                label="Imagem Principal (Hero)"
                hint="JPG, PNG ou WEBP · Recomendado 1200×600px"
                currentUrl={localConfig.hero_image_url}
                onUpload={handleUploadHero}
                onRemove={handleRemoveHero}
                uploading={uploadingHero}
                icon={ImageIcon}
              />
              <UploadArea
                label="Mapa / Planta do Loteamento"
                hint="JPG, PNG ou WEBP · Alta resolução recomendada"
                currentUrl={localConfig.map_image_url}
                onUpload={handleUploadMap}
                onRemove={handleRemoveMap}
                uploading={uploadingMap}
                icon={Map}
              />
            </div>
          </div>

          {/* Personalização */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-5 border-b border-slate-50 pb-3">
              Personalização
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">
                  Nome do Empreendimento
                </label>
                <input
                  type="text"
                  value={localConfig.nome_empreendimento}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      nome_empreendimento: e.target.value,
                    })
                  }
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">
                  Slogan
                </label>
                <input
                  type="text"
                  value={localConfig.slogan}
                  onChange={(e) =>
                    setLocalConfig({ ...localConfig, slogan: e.target.value })
                  }
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">
                  Cor da Identidade
                </label>
                <div className="flex gap-2 flex-wrap">
                  {PALETTE.map((c) => (
                    <button
                      key={c.value}
                      title={c.name}
                      onClick={() =>
                        setLocalConfig({
                          ...localConfig,
                          cor_primaria: c.value,
                        })
                      }
                      className={`h-8 w-8 rounded-full transition-all ${
                        localConfig.cor_primaria === c.value
                          ? "ring-4 ring-offset-1 scale-110"
                          : "hover:scale-105"
                      }`}
                      style={{
                        backgroundColor: c.value,
                        // @ts-ignore: ringColor is Tailwind's custom property
                        "--tw-ring-color":
                          localConfig.cor_primaria === c.value
                            ? c.value
                            : undefined,
                      } as React.CSSProperties}
                    />
                  ))}
                  <div className="relative">
                    <input
                      type="color"
                      value={localConfig.cor_primaria}
                      onChange={(e) =>
                        setLocalConfig({
                          ...localConfig,
                          cor_primaria: e.target.value,
                        })
                      }
                      className="absolute inset-0 opacity-0 cursor-pointer w-8 h-8"
                    />
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 cursor-pointer hover:scale-105 transition-all">
                      <Plus className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">
                  Modelo de Interface
                </label>
                <div className="space-y-2">
                  {["premium", "minimal"].map((t) => (
                    <button
                      key={t}
                      onClick={() =>
                        setLocalConfig({ ...localConfig, template: t })
                      }
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                        localConfig.template === t
                          ? "bg-slate-50 border-2 border-primary"
                          : "bg-white border border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {t === "premium" ? (
                          <Layout className="h-5 w-5 text-primary" />
                        ) : (
                          <Brush className="h-5 w-5 text-gray-400" />
                        )}
                        <span
                          className={`text-sm font-bold ${
                            localConfig.template === t
                              ? "text-gray-700"
                              : "text-gray-500"
                          }`}
                        >
                          {t === "premium" ? "Premium Modern" : "Minimal Bold"}
                        </span>
                      </div>
                      {localConfig.template === t && (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Informações */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-5 border-b border-slate-50 pb-3">
              Estatísticas
            </h3>
            <div className="space-y-4">
              {[
                {
                  key: "stats_vendido",
                  label: "% Vendido",
                  suffix: "%",
                },
                {
                  key: "stats_total_lotes",
                  label: "Total de Lotes",
                },
                {
                  key: "stats_area_minima",
                  label: "Área Mínima",
                },
              ].map((s) => (
                <div key={s.key}>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">
                    {s.label}
                  </label>
                  <input
                    type="text"
                    value={localConfig[s.key as keyof StandConfig] as string}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        [s.key]: e.target.value,
                      })
                    }
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Plugins */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-5 border-b border-slate-50 pb-3">
              Plugins
            </h3>
            <div className="space-y-3">
              {[
                { key: "mapa_interativo", label: "Mapa Interativo" },
                { key: "simulador_financeiro", label: "Simulador Financeiro" },
                { key: "tour_virtual", label: "Tour Virtual 360º" },
              ].map((plugin) => {
                const isActive =
                  localConfig.plugins[
                    plugin.key as keyof typeof localConfig.plugins
                  ];
                return (
                  <div
                    key={plugin.key}
                    className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                      isActive ? "bg-green-50" : "bg-slate-50"
                    }`}
                  >
                    <span
                      className={`text-xs font-bold ${
                        isActive ? "text-green-700" : "text-slate-400"
                      }`}
                    >
                      {plugin.label}
                    </span>
                    <button
                      onClick={() =>
                        setLocalConfig({
                          ...localConfig,
                          plugins: {
                            ...localConfig.plugins,
                            [plugin.key]: !isActive,
                          },
                        })
                      }
                      className="transition-colors"
                    >
                      {isActive ? (
                        <ToggleRight className="h-6 w-6 text-green-500" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-slate-300" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status */}
          <div className="bg-gradient-to-br from-gray-900 to-slate-800 rounded-3xl p-6 shadow-xl text-white">
            <div className="flex items-center gap-2 mb-3">
              <Monitor className="h-4 w-4 text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Status do Stand
              </span>
            </div>
            <div className="flex items-center gap-3 mb-1">
              <div
                className={`h-2.5 w-2.5 rounded-full ${localConfig.publicado ? "bg-green-400 animate-pulse" : "bg-slate-500"}`}
              />
              <p className="text-xl font-bold">
                {localConfig.publicado ? "Online" : "Offline"}
              </p>
            </div>
            <p className="text-xs text-slate-400 font-medium mb-4">
              Seu stand recebeu 1.240 visitas nas últimas 24h.
            </p>
            <button
              onClick={() =>
                setLocalConfig({
                  ...localConfig,
                  publicado: !localConfig.publicado,
                })
              }
              className={`w-full font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 ${
                localConfig.publicado
                  ? "bg-red-500/20 hover:bg-red-500/30 text-red-300"
                  : "bg-green-500/20 hover:bg-green-500/30 text-green-300"
              }`}
            >
              {localConfig.publicado ? "Desativar Stand" : "Ativar Stand"}
            </button>
          </div>
        </div>

        {/* ── Visualização do Stand ── */}
        <div className="lg:col-span-3 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden">
          {/* Barra de Tabs */}
          <div className="h-14 border-b border-slate-100 flex items-center justify-between px-6 bg-slate-50/50">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab("preview")}
                className={`text-xs font-bold flex items-center gap-2 transition-all ${activeTab === "preview" ? "text-primary" : "text-gray-400 hover:text-gray-600"}`}
              >
                <Eye className="h-4 w-4" /> Visualizar
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`text-xs font-bold flex items-center gap-2 transition-all ${activeTab === "settings" ? "text-primary" : "text-gray-400 hover:text-gray-600"}`}
              >
                <Settings className="h-4 w-4" /> Configurações Avançadas
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Toggle Desktop/Mobile */}
              <div className="flex bg-white border border-slate-200 rounded-lg p-0.5 gap-0.5">
                <button
                  onClick={() => setPreviewMode("desktop")}
                  className={`p-1.5 rounded-md transition-all ${previewMode === "desktop" ? "bg-primary text-white" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <Monitor className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setPreviewMode("mobile")}
                  className={`p-1.5 rounded-md transition-all ${previewMode === "mobile" ? "bg-primary text-white" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex items-center bg-white border border-slate-200 rounded-lg py-1.5 px-3 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 mr-2">
                  URL:
                </p>
                <span className="text-[10px] font-black text-gray-700">
                  seuloteamento.crm.digital/stand
                </span>
                <button onClick={handleCopyLink}>
                  {copied ? (
                    <Check className="h-3 w-3 text-emerald-500 ml-3" />
                  ) : (
                    <Copy className="h-3 w-3 text-slate-300 ml-3 hover:text-primary transition-colors" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Preview */}
          {activeTab === "preview" && (
            <div className="flex-1 overflow-y-auto p-8 bg-slate-100/40 flex justify-center">
              <div
                className={`bg-white shadow-2xl rounded-2xl overflow-hidden border border-slate-200 flex flex-col transition-all duration-300 ${
                  previewMode === "mobile"
                    ? "w-[390px]"
                    : "w-full max-w-4xl"
                }`}
              >
                {/* Navbar do Stand */}
                <div
                  className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8"
                  style={{ borderBottomColor: `${localConfig.cor_primaria}15` }}
                >
                  <div
                    className="font-black italic text-lg tracking-tighter"
                    style={{ color: localConfig.cor_primaria }}
                  >
                    {localConfig.nome_empreendimento.toUpperCase()}
                  </div>
                  {previewMode !== "mobile" && (
                    <div className="flex gap-6 text-xs font-bold text-gray-500">
                      <span
                        className="border-b-2 pb-1"
                        style={{
                          color: localConfig.cor_primaria,
                          borderColor: localConfig.cor_primaria,
                        }}
                      >
                        Início
                      </span>
                      <span>Unidades</span>
                      <span>Localização</span>
                      <span>Contato</span>
                    </div>
                  )}
                </div>

                {/* Hero */}
                <div className="relative h-[340px]">
                  <img
                    src={heroImageSrc}
                    className="w-full h-full object-cover"
                    alt="Hero do Stand"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-10">
                    <h2
                      className={`font-black text-white mb-2 leading-tight ${previewMode === "mobile" ? "text-2xl" : "text-4xl"}`}
                    >
                      {localConfig.slogan}
                    </h2>
                    <p className="text-slate-200 max-w-lg text-sm font-medium">
                      {localConfig.descricao}
                    </p>
                    <div className="flex gap-4 mt-6 flex-wrap">
                      <button
                        className="text-white font-bold py-3 px-7 rounded-full text-xs"
                        style={{
                          backgroundColor: localConfig.cor_primaria,
                        }}
                      >
                        Ver Mapa Interativo
                      </button>
                      <button className="bg-white/20 backdrop-blur-md text-white border border-white/30 font-bold py-3 px-7 rounded-full text-xs">
                        Falar com Corretor
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="p-8">
                  <div
                    className={`grid gap-6 text-center mb-10 ${previewMode === "mobile" ? "grid-cols-3" : "grid-cols-3"}`}
                  >
                    {[
                      {
                        value: `${localConfig.stats_vendido}%`,
                        label: "Vendido",
                      },
                      {
                        value: localConfig.stats_total_lotes,
                        label: "Lotes Totais",
                      },
                      {
                        value: localConfig.stats_area_minima,
                        label: "Área Mínima",
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="p-4 bg-slate-50 rounded-2xl"
                      >
                        <p
                          className="text-2xl font-black mb-1"
                          style={{ color: localConfig.cor_primaria }}
                        >
                          {stat.value}
                        </p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Mapa do Loteamento */}
                  {localConfig.plugins.mapa_interativo && (
                    <div className="mb-10">
                      <h3 className="text-xl font-black text-slate-900 mb-5 flex items-center gap-3">
                        <div
                          className="h-1 w-10 rounded-full"
                          style={{
                            backgroundColor: localConfig.cor_primaria,
                          }}
                        />
                        Mapa do Loteamento
                      </h3>
                      {mapImageSrc ? (
                        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                          <img
                            src={mapImageSrc}
                            alt="Mapa do Loteamento"
                            className="w-full object-contain max-h-80"
                          />
                        </div>
                      ) : (
                        <div
                          className="h-48 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/40 transition-colors"
                          onClick={() => {
                            // Abre o painel de upload
                            const el = document.getElementById(
                              "map-upload-trigger"
                            );
                            el?.click();
                          }}
                        >
                          <Map className="h-10 w-10 text-slate-300" />
                          <p className="text-sm font-bold text-slate-400">
                            Nenhum mapa enviado
                          </p>
                          <p className="text-xs text-slate-300">
                            Faça o upload pela barra lateral esquerda
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Diferenciais */}
                  <div>
                    <h3 className="text-xl font-black text-slate-900 mb-5 flex items-center gap-3">
                      <div
                        className="h-1 w-10 rounded-full"
                        style={{ backgroundColor: localConfig.cor_primaria }}
                      />
                      Diferenciais
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {localConfig.diferenciais.map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-3 text-sm font-bold text-gray-700"
                        >
                          <div
                            className="h-5 w-5 rounded-full flex items-center justify-center text-white"
                            style={{
                              backgroundColor: `${localConfig.cor_primaria}20`,
                            }}
                          >
                            <CheckCircle2
                              className="h-3 w-3"
                              style={{ color: localConfig.cor_primaria }}
                            />
                          </div>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div
                  className="p-6 text-center border-t"
                  style={{ borderTopColor: `${localConfig.cor_primaria}15` }}
                >
                  <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                    Desenvolvido por
                  </p>
                  <div
                    className="font-bold"
                    style={{ color: localConfig.cor_primaria }}
                  >
                    CRM Loteamento
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Aba Configurações Avançadas */}
          {activeTab === "settings" && (
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                  <h4 className="text-sm font-black text-gray-700 mb-4 flex items-center gap-2">
                    <Edit3 className="h-4 w-4 text-primary" />
                    Descrição Completa
                  </h4>
                  <textarea
                    value={localConfig.descricao}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        descricao: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                  />
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                  <h4 className="text-sm font-black text-gray-700 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Diferenciais do Empreendimento
                  </h4>
                  <div className="space-y-2">
                    {localConfig.diferenciais.map((d, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="text"
                          value={d}
                          onChange={(e) => {
                            const arr = [...localConfig.diferenciais];
                            arr[i] = e.target.value;
                            setLocalConfig({
                              ...localConfig,
                              diferenciais: arr,
                            });
                          }}
                          className="flex-1 p-2.5 border border-slate-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        />
                        <button
                          onClick={() =>
                            setLocalConfig({
                              ...localConfig,
                              diferenciais: localConfig.diferenciais.filter(
                                (_, idx) => idx !== i
                              ),
                            })
                          }
                          className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() =>
                        setLocalConfig({
                          ...localConfig,
                          diferenciais: [...localConfig.diferenciais, ""],
                        })
                      }
                      className="w-full flex items-center justify-center gap-2 p-2.5 border-2 border-dashed border-slate-200 rounded-xl text-sm font-bold text-slate-400 hover:border-primary/40 hover:text-primary transition-all"
                    >
                      <Plus className="h-4 w-4" /> Adicionar Diferencial
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-primary text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 flex items-center gap-2 transition-all disabled:opacity-60"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Salvar Todas as Configurações
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StandOnlinePage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    }>
      <StandOnlineContent />
    </Suspense>
  );
}
