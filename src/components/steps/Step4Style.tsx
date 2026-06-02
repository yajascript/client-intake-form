import React, { useState, useEffect, useRef } from "react";
import { IntakeFormPayload } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { Image as ImageIcon, Search, Home, User, Pen, Tag, Box, Sparkles, ChevronDown, Check, Sun, Moon, Pipette } from "lucide-react";

interface Step4StyleProps {
  data: IntakeFormPayload;
  updateData: (updates: Partial<IntakeFormPayload>) => void;
  logoFile: File | null;
  setLogoFile: (file: File | null) => void;
  errors?: Record<string, string>;
  clearError?: (field: string) => void;
  sessionId: string;
}

const voiceOptions = [
  "Professional",
  "Playful",
  "Minimalist",
  "Bold & Edgy",
  "Luxurious",
  "Friendly",
];

const PRESET_COLORS = [
  "#EF4444", "#F97316", "#F59E0B", "#10B981", "#0EA5E9", "#3B82F6", "#6366F1", "#8B5CF6", "#EC4899",
  "#B91C1C", "#C2410C", "#B45309", "#047857", "#0369A1", "#1D4ED8", "#4338CA", "#6D28D9", "#BE185D",
  "#020617", "#0F172A", "#1E293B", "#334155", "#475569", "#64748B", "#94A3B8", "#CBD5E1", "#F1F5F9"
];

const POPULAR_FONTS = [
  // Sans-serif
  "Inter", "Roboto", "Geist", "Outfit", "Plus Jakarta Sans",
  "Montserrat", "Poppins", "Nunito", "DM Sans", "Work Sans",
  // Serif
  "Playfair Display", "Merriweather", "Lora", "Crimson Text", "Cinzel",
  // Display / Unique
  "Space Grotesk", "Syne", "Bricolage Grotesque", "Righteous", "Oswald"
];

function hexToHSL(hex: string) {
  let H = hex.replace("#", "");
  if (H.length === 3) H = H[0] + H[0] + H[1] + H[1] + H[2] + H[2];
  if (H.length !== 6) return { h: 0, s: 0, l: 0 };
  let r = parseInt(H.substring(0, 2), 16) / 255;
  let g = parseInt(H.substring(2, 4), 16) / 255;
  let b = parseInt(H.substring(4, 6), 16) / 255;
  let cmin = Math.min(r, g, b), cmax = Math.max(r, g, b), delta = cmax - cmin, h = 0, s = 0, l = 0;
  if (delta == 0) h = 0; else if (cmax == r) h = ((g - b) / delta) % 6; else if (cmax == g) h = (b - r) / delta + 2; else h = (r - g) / delta + 4;
  h = Math.round(h * 60); if (h < 0) h += 360;
  l = (cmax + cmin) / 2; s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1); l = +(l * 100).toFixed(1);
  return { h, s, l };
}

function HSLToHex(h: number, s: number, l: number) {
  s /= 100; l /= 100;
  let c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2, r = 0, g = 0, b = 0;
  if (0 <= h && h < 60) { r = c; g = x; b = 0; } else if (60 <= h && h < 120) { r = x; g = c; b = 0; } else if (120 <= h && h < 180) { r = 0; g = c; b = x; } else if (180 <= h && h < 240) { r = 0; g = x; b = c; } else if (240 <= h && h < 300) { r = x; g = 0; b = c; } else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
  let rHex = Math.max(0, Math.min(255, Math.round((r + m) * 255))).toString(16).padStart(2, '0');
  let gHex = Math.max(0, Math.min(255, Math.round((g + m) * 255))).toString(16).padStart(2, '0');
  let bHex = Math.max(0, Math.min(255, Math.round((b + m) * 255))).toString(16).padStart(2, '0');
  return "#" + rHex + gHex + bHex;
}

function getContrastYIQ(hexcolor: string) {
  let hex = hexcolor.replace("#", "");
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  if (hex.length !== 6) return '#FFFFFF';
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#0B1326' : '#FFFFFF';
}

function generateShades(hex: string) {
  let H = hex.replace("#", "");
  if (H.length === 3) H = H[0] + H[0] + H[1] + H[1] + H[2] + H[2];
  if (H.length !== 6) return Array(10).fill("#000");

  let r = parseInt(H.substring(0, 2), 16);
  let g = parseInt(H.substring(2, 4), 16);
  let b = parseInt(H.substring(4, 6), 16);

  const shades = [];
  for (let i = 0; i < 10; i++) {
    const factor = (i - 4.5) * 0.15;
    let newR = Math.min(255, Math.max(0, Math.round(r + (r * factor))));
    let newG = Math.min(255, Math.max(0, Math.round(g + (g * factor))));
    let newB = Math.min(255, Math.max(0, Math.round(b + (b * factor))));
    if (factor > 0) {
      newR = Math.min(255, Math.max(0, Math.round(r + ((255 - r) * factor))));
      newG = Math.min(255, Math.max(0, Math.round(g + ((255 - g) * factor))));
      newB = Math.min(255, Math.max(0, Math.round(b + ((255 - b) * factor))));
    }
    const hexVal = "#" + [newR, newG, newB].map(x => x.toString(16).padStart(2, '0')).join('');
    shades.push(hexVal);
  }
  return shades.reverse();
}

export const Step4Style: React.FC<Step4StyleProps> = ({ data, updateData, logoFile, setLogoFile, errors = {}, clearError, sessionId }) => {
  // logoPreview state moved down
  const [isExtracting, setIsExtracting] = useState(false);
  const [activeTheme, setActiveTheme] = useState<"dark-neutral" | "light-airy" | "monochromatic" | "complementary">("dark-neutral");
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    POPULAR_FONTS.forEach(font => {
      const fontName = font.replace(/ /g, "+");
      const linkId = `google-font-prefetch-${fontName.toLowerCase()}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement("link");
        link.id = linkId;
        link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;500;600;700&display=swap`;
        link.rel = "stylesheet";
        document.head.appendChild(link);
      }
    });
  }, []);

  const applyPalette = (type: "dark-neutral" | "light-airy" | "monochromatic" | "complementary", overrideColor?: string) => {
    setActiveTheme(type);
    const baseColor = overrideColor || data.primaryColor || "#3B82F6";
    const hsl = hexToHSL(baseColor);

    let secondaryColor = "";
    let tertiaryColor = "";
    let neutralColor = "";

    switch (type) {
      case "dark-neutral":
        secondaryColor = HSLToHex(hsl.h, Math.min(hsl.s, 30), 18);
        tertiaryColor = HSLToHex((hsl.h + 30) % 360, hsl.s, hsl.l);
        neutralColor = HSLToHex(hsl.h, Math.min(hsl.s, 15), 8);
        break;
      case "light-airy":
        secondaryColor = HSLToHex(hsl.h, Math.min(hsl.s, 20), 92);
        tertiaryColor = HSLToHex((hsl.h + 30) % 360, hsl.s, Math.max(hsl.l, 70));
        neutralColor = HSLToHex(hsl.h, Math.min(hsl.s, 10), 98);
        break;
      case "monochromatic":
        secondaryColor = HSLToHex(hsl.h, hsl.s, Math.max(10, hsl.l - 20));
        tertiaryColor = HSLToHex(hsl.h, hsl.s, Math.min(90, hsl.l + 20));
        neutralColor = HSLToHex(hsl.h, Math.min(hsl.s, 20), 15);
        break;
      case "complementary":
        secondaryColor = HSLToHex((hsl.h + 180) % 360, hsl.s, Math.max(15, hsl.l - 20));
        tertiaryColor = HSLToHex((hsl.h + 180) % 360, hsl.s, hsl.l);
        neutralColor = HSLToHex(hsl.h, Math.min(hsl.s, 20), 12);
        break;
    }

    updateData({ secondaryColor, tertiaryColor, neutralColor });
  };

  const [logoPreview, setLogoPreview] = useState<string | null>(data.logoUrl || null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  useEffect(() => {
    if (!logoFile && data.logoUrl) {
      setLogoPreview(data.logoUrl);
    }
  }, [data.logoUrl, logoFile]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      setLogoFile(file);
      if (clearError) clearError('logo');
      
      // Temporary local preview while uploading
      const tempUrl = URL.createObjectURL(file);
      setLogoPreview(tempUrl);
      setIsUploadingLogo(true);
      
      try {
        const response = await fetch(`/api/upload?sessionId=${sessionId}&filename=${encodeURIComponent(file.name)}`, {
          method: "POST",
          body: file,
        });
        
        if (response.ok) {
          const newBlob = await response.json();
          updateData({ logoUrl: newBlob.url });
          setLogoPreview(newBlob.url);
        } else {
          console.error("Failed to upload logo");
          alert("Failed to upload logo to server.");
        }
      } catch (error) {
        console.error("Error uploading logo", error);
      } finally {
        setIsUploadingLogo(false);
      }
    }
  };

  const extractColors = () => {
    if (!imgRef.current) return;
    setIsExtracting(true);

    setTimeout(() => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx || !imgRef.current) {
          setIsExtracting(false);
          return;
        }

        const img = imgRef.current;
        const MAX_DIM = 200;
        let width = img.naturalWidth;
        let height = img.naturalHeight;
        if (width > MAX_DIM || height > MAX_DIM) {
          const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const imgData = ctx.getImageData(0, 0, width, height).data;
        const colorCounts: Record<string, number> = {};

        for (let i = 0; i < imgData.length; i += 16) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];

          if (a < 128) continue;

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const diff = max - min;
          if (diff < 15 && max > 240) continue;
          if (diff < 15 && max < 30) continue;

          const qR = Math.round(r / 10) * 10;
          const qG = Math.round(g / 10) * 10;
          const qB = Math.round(b / 10) * 10;
          const key = `${qR},${qG},${qB}`;

          colorCounts[key] = (colorCounts[key] || 0) + 1;
        }

        const sortedColors = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]);

        if (sortedColors.length > 0) {
          const rgbToHex = (r: number, g: number, b: number) => "#" + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');

          const primaryStr = sortedColors[0][0].split(',').map(Number);
          const primaryHex = rgbToHex(primaryStr[0], primaryStr[1], primaryStr[2]);

          updateData({ primaryColor: primaryHex });
          applyPalette(activeTheme, primaryHex);
        }
      } catch (e) {
        console.warn("Color extraction failed:", e);
      } finally {
        setIsExtracting(false);
      }
    }, 100);
  };

  const ColorCard = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);
    const shades = generateShades(value);

    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      }
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    return (
      <div className={cn("bg-[#121c33]/40 border border-white/5 rounded-2xl flex flex-col p-6 gap-4 transition-all hover:bg-[#121c33]/60 relative", isOpen ? "z-50" : "z-10")}>
        <div className="flex justify-between items-start relative">
          <span className="text-sm font-semibold text-white/80">{label}</span>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 text-xs font-mono text-white/50 hover:text-white/80 transition-colors bg-white/5 px-2 py-1 rounded truncate max-w-[120px]"
          >
            <div className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/20" style={{ backgroundColor: value }} />
            <span className="truncate uppercase">{value}</span> <ChevronDown className="w-3 h-3 flex-shrink-0" />
          </button>

          {isOpen && (
            <>
              <div className="fixed inset-0 bg-black/50 z-[90] sm:hidden" onClick={() => setIsOpen(false)} />
              <div ref={popoverRef} className="fixed sm:absolute top-1/2 left-1/2 sm:top-10 sm:left-1/2 -translate-x-1/2 -translate-y-1/2 sm:translate-y-0 mt-0 sm:mt-2 w-64 bg-[#0B1326] border border-white/10 rounded-xl shadow-2xl z-[100] p-4 flex flex-col gap-4 animate-in fade-in zoom-in-95">
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-white/50">Custom Color</label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">#</span>
                      <input
                        type="text"
                        className="bg-[#121c33]/50 border border-white/10 rounded-lg pl-7 pr-3 py-2 text-sm text-white/80 outline-none w-full focus:border-[#ADC8FF] transition-colors font-mono uppercase"
                        value={value.replace('#', '')}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val.length <= 6) onChange('#' + val);
                        }}
                        maxLength={6}
                      />
                    </div>
                    <label className="flex items-center justify-center w-9 h-9 shrink-0 rounded-lg bg-[#121c33]/50 border border-white/10 hover:bg-white/10 cursor-pointer transition-colors relative overflow-hidden group">
                      <Pipette className="w-4 h-4 text-white/50 group-hover:text-white transition-colors relative z-10 pointer-events-none" />
                      <input
                        type="color"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 opacity-0 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-white/50">Presets</label>
                  <div className="grid grid-cols-9 gap-1.5">
                    {PRESET_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => {
                          onChange(color);
                          setIsOpen(false);
                        }}
                        className={cn(
                          "w-full aspect-square rounded-md transition-transform hover:scale-110 flex items-center justify-center",
                          value.toUpperCase() === color.toUpperCase() ? "ring-2 ring-white ring-offset-1 ring-offset-[#0B1326]" : ""
                        )}
                        style={{ backgroundColor: color }}
                      >
                        {value.toUpperCase() === color.toUpperCase() && <Check className="w-3 h-3 text-white mix-blend-difference" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col gap-1 w-full flex-1">
          <div
            className="w-full min-h-[100px] h-full rounded-t-xl transition-colors shadow-inner relative overflow-hidden cursor-pointer flex-1"
            style={{ backgroundColor: value }}
            onClick={() => setIsOpen(true)}
          />
          <div className="flex h-6 rounded-b-xl overflow-hidden">
            {shades.map((shade, i) => (
              <div key={i} className="flex-1" style={{ backgroundColor: shade }} />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const TypographyCard = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => {
    const [localValue, setLocalValue] = useState(value);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false);
      }
      if (isMenuOpen) document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isMenuOpen]);

    useEffect(() => {
      setLocalValue(value);
    }, [value]);

    useEffect(() => {
      if (!localValue) return;
      const fontName = localValue.trim().replace(/ /g, "+");
      const linkId = `google-font-${fontName.toLowerCase()}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement("link");
        link.id = linkId;
        link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;500;600;700&display=swap`;
        link.rel = "stylesheet";
        document.head.appendChild(link);
      }
    }, [localValue]);

    return (
      <div className={cn("bg-[#121c33]/40 border border-white/5 rounded-2xl p-6 flex flex-col gap-4 relative group hover:bg-[#121c33]/60 transition-colors", isMenuOpen ? "z-50" : "z-10")}>
        <div className="flex justify-between items-start relative" ref={menuRef}>
          <span className="text-sm font-semibold text-white/80">{label}</span>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-1 text-xs font-mono text-white/50 hover:text-white/80 transition-colors bg-white/5 px-2 py-1 rounded truncate max-w-[120px]"
          >
            <span className="truncate">{localValue}</span> <ChevronDown className="w-3 h-3 flex-shrink-0" />
          </button>

          {isMenuOpen && (
            <div className="absolute top-8 right-0 mt-2 w-56 bg-[#0B1326] border border-white/10 rounded-xl shadow-2xl z-50 p-4 flex flex-col gap-4 animate-in fade-in zoom-in-95">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-white/50">Custom Font</label>
                <input
                  type="text"
                  className="bg-[#121c33]/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 outline-none w-full focus:border-[#ADC8FF] transition-colors"
                  value={localValue}
                  onChange={(e) => setLocalValue(e.target.value)}
                  onBlur={() => onChange(localValue)}
                  placeholder="e.g. Inter"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur();
                      onChange(localValue);
                      setIsMenuOpen(false);
                    }
                  }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-white/50">Popular</label>
                <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                  {POPULAR_FONTS.map(f => (
                    <button
                      key={f}
                      onClick={() => {
                        setLocalValue(f);
                        onChange(f);
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                      style={{ fontFamily: `'${f}', sans-serif` }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-center flex-1 min-h-[100px] overflow-hidden">
          <span
            className="text-6xl font-bold tracking-tight text-white/90 truncate"
            style={{ fontFamily: `'${localValue}', sans-serif` }}
          >
            Aa
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8">

      {/* 1. Brand Identity (Logo & Voice) */}
      <div className="glass p-8 flex flex-col gap-6">
        <h2 className="text-xl font-semibold mb-2">Brand Core</h2>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-white/80">Brand Logo <span className="text-yellow-400">*</span></label>
            </div>
            <div className="flex flex-col gap-2">
              <div className={cn("border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 transition-colors relative group min-h-[140px]", errors.logo ? "border-rose-400 bg-rose-400/5 hover:border-rose-400/80" : "border-white/10 hover:border-[#ADC8FF]/30 bg-[#040B18]/50")}>
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  title=""
                />
                {isUploadingLogo ? (
                  <div className="flex flex-col items-center gap-2">
                    <Sparkles className="w-6 h-6 text-[#ADC8FF] animate-pulse" />
                    <span className="text-xs font-medium text-white/60">Uploading...</span>
                  </div>
                ) : logoPreview ? (
                  <img
                    ref={imgRef}
                    src={logoPreview.startsWith('https://') ? `/api/image?url=${encodeURIComponent(logoPreview)}` : logoPreview}
                    alt="Logo Preview"
                    className="h-16 w-auto object-contain rounded drop-shadow-lg relative z-10"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <>
                    <ImageIcon className="w-6 h-6 text-white/40 mb-1" />
                    <span className="text-xs font-medium text-white/60">Upload Logo (SVG, PNG, JPG)</span>
                  </>
                )}
              </div>
              {errors.logo && <span className="text-xs text-rose-400 font-medium">{errors.logo}</span>}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-white/80">Brand Voice</label>
            <div className="flex flex-wrap gap-2">
              {voiceOptions.map((voice) => {
                const isSelected = (data.brandVoice || []).includes(voice);
                return (
                  <button
                    key={voice}
                    onClick={() => {
                      let current = [...(data.brandVoice || [])];
                      if (isSelected) current = current.filter(v => v !== voice);
                      else if (current.length < 3) current.push(voice);
                      updateData({ brandVoice: current });
                    }}
                    className={cn(
                      "px-4 py-2 rounded-full border text-xs font-medium transition-all",
                      isSelected
                        ? "bg-[#ADC8FF] border-[#ADC8FF] text-[#0B1326]"
                        : "bg-[#121c33]/50 border-white/10 text-white/60 hover:border-white/30 hover:text-white"
                    )}
                  >
                    {voice}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Theme */}
      <div className="glass p-8 flex flex-col gap-6 relative z-30">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Theme</h2>
          {logoPreview && (
            <button
              onClick={extractColors}
              disabled={isExtracting}
              className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white/80 hover:bg-[#ADC8FF] hover:text-[#0B1326] hover:border-[#ADC8FF] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Pipette className="w-4 h-4" />
              {isExtracting ? "Extracting..." : "Generate Palette from Logo"}
            </button>
          )}
        </div>
        <div className="flex flex-col gap-12">
          <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-6">
            <ColorCard
              label="Primary"
              value={data.primaryColor || "#3B82F6"}
              onChange={(v) => {
                updateData({ primaryColor: v });
                applyPalette(activeTheme, v);
              }}
            />
            <ColorCard
              label="Secondary"
              value={data.secondaryColor || "#1E293B"}
              onChange={(v) => updateData({ secondaryColor: v })}
            />
            <ColorCard
              label="Tertiary"
              value={data.tertiaryColor || "#D16900"}
              onChange={(v) => updateData({ tertiaryColor: v })}
            />
          </div>

          <div className="w-full flex flex-col gap-3">
            <label className="text-sm font-medium text-white/80">Select UI Theme</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => applyPalette("dark-neutral")}
                className={cn("px-4 py-3 rounded-xl border text-sm font-medium transition-colors text-left", activeTheme === 'dark-neutral' ? 'bg-[#ADC8FF] text-[#0B1326] border-[#ADC8FF]' : 'border-white/10 bg-[#121c33]/50 text-white/80 hover:bg-[#121c33]')}
              >
                Dark
              </button>
              <button
                onClick={() => applyPalette("light-airy")}
                className={cn("px-4 py-3 rounded-xl border text-sm font-medium transition-colors text-left", activeTheme === 'light-airy' ? 'bg-[#ADC8FF] text-[#0B1326] border-[#ADC8FF]' : 'border-white/10 bg-[#121c33]/50 text-white/80 hover:bg-[#121c33]')}
              >
                Light
              </button>
              <button
                onClick={() => applyPalette("monochromatic")}
                className={cn("px-4 py-3 rounded-xl border text-sm font-medium transition-colors text-left", activeTheme === 'monochromatic' ? 'bg-[#ADC8FF] text-[#0B1326] border-[#ADC8FF]' : 'border-white/10 bg-[#121c33]/50 text-white/80 hover:bg-[#121c33]')}
              >
                Monochromatic
              </button>
              <button
                onClick={() => applyPalette("complementary")}
                className={cn("px-4 py-3 rounded-xl border text-sm font-medium transition-colors text-left", activeTheme === 'complementary' ? 'bg-[#ADC8FF] text-[#0B1326] border-[#ADC8FF]' : 'border-white/10 bg-[#121c33]/50 text-white/80 hover:bg-[#121c33]')}
              >
                High Contrast
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Typography */}
      <div className="glass p-8 flex flex-col gap-6 relative z-20">
        <h2 className="text-xl font-semibold mb-2">Typography</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <TypographyCard label="Headline Font" value={data.headlineFont || "Geist"} onChange={(v) => updateData({ headlineFont: v })} />
          <TypographyCard label="Body Font" value={data.bodyFont || "Geist"} onChange={(v) => updateData({ bodyFont: v })} />
        </div>
      </div>

      {/* 4. UI Preview */}
      <div className="glass p-8 flex flex-col gap-6 relative z-10">
        <h2 className="text-xl font-semibold mb-2">UI Preview</h2>

        {(() => {
          const previewBg = data.neutralColor || '#0F172A';
          const previewCardBg = data.secondaryColor || '#1E293B';

          return (
            <div className="border border-white/10 rounded-3xl p-8 flex flex-col gap-8 max-w-2xl mx-auto w-full shadow-2xl transition-colors duration-500" style={{ backgroundColor: previewBg }}>

              <div className="flex flex-col gap-2">
                <h1 style={{ fontFamily: `'${data.headlineFont}'` || 'sans-serif', color: data.primaryColor || '#3B82F6' }} className="text-3xl font-bold">
                  The quick brown fox
                </h1>
                <p style={{ fontFamily: `'${data.bodyFont}'` || 'sans-serif', color: getContrastYIQ(previewBg) }} className="text-sm opacity-80">
                  Jumps over the lazy dog. A beautifully crafted experience tailored to your unique brand identity.
                </p>
              </div>

              {/* Search Preview */}
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl transition-colors shadow-inner"
                style={{ backgroundColor: previewCardBg }}
              >
                <Search className="w-4 h-4" style={{ color: getContrastYIQ(previewCardBg) }} />
                <span className="text-sm font-medium opacity-70" style={{ fontFamily: `'${data.bodyFont}'` || 'sans-serif', color: getContrastYIQ(previewCardBg) }}>Search components...</span>
              </div>

              {/* Button Previews */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div
                  className="py-2.5 rounded-xl flex items-center justify-center text-sm font-medium transition-colors shadow-lg shadow-black/20"
                  style={{ backgroundColor: data.primaryColor || '#3B82F6', color: getContrastYIQ(data.primaryColor || '#3B82F6'), fontFamily: `'${data.bodyFont}'` || 'sans-serif' }}
                >
                  Primary
                </div>
                <div
                  className="py-2.5 rounded-xl flex items-center justify-center text-sm font-medium transition-colors shadow"
                  style={{ backgroundColor: data.tertiaryColor || '#D16900', color: getContrastYIQ(data.tertiaryColor || '#D16900'), fontFamily: `'${data.bodyFont}'` || 'sans-serif' }}
                >
                  Tertiary
                </div>
                <div
                  className="py-2.5 rounded-xl flex items-center justify-center text-sm font-medium transition-colors"
                  style={{ backgroundColor: getContrastYIQ(previewBg), color: previewBg, fontFamily: `'${data.bodyFont}'` || 'sans-serif' }}
                >
                  Inverted
                </div>
                <div
                  className="py-2.5 rounded-xl flex items-center justify-center text-sm font-medium transition-colors border-2"
                  style={{ backgroundColor: 'transparent', color: data.primaryColor || '#3B82F6', borderColor: data.primaryColor || '#3B82F6', fontFamily: `'${data.bodyFont}'` || 'sans-serif' }}
                >
                  Outlined
                </div>
              </div>

              {/* Progress & Actions */}
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 w-full flex flex-col gap-3">
                  <div className="h-2 rounded-full w-full overflow-hidden" style={{ backgroundColor: previewCardBg }}>
                    <div className="h-full w-3/4 rounded-full" style={{ backgroundColor: data.primaryColor || '#3B82F6' }}></div>
                  </div>
                  <div className="h-2 rounded-full w-full overflow-hidden" style={{ backgroundColor: previewCardBg }}>
                    <div className="h-full w-1/3 rounded-full" style={{ backgroundColor: data.tertiaryColor || '#D16900' }}></div>
                  </div>
                </div>

                <div
                  className="flex items-center gap-4 py-2 px-6 rounded-2xl shadow-inner"
                  style={{ backgroundColor: previewCardBg }}
                >
                  <Home className="w-5 h-5 cursor-pointer" style={{ color: data.primaryColor || '#3B82F6' }} />
                  <div className="w-1 h-1 rounded-full opacity-20" style={{ backgroundColor: getContrastYIQ(previewCardBg) }} />
                  <Box className="w-4 h-4 cursor-pointer" style={{ color: getContrastYIQ(previewCardBg) }} />
                  <div className="w-1 h-1 rounded-full opacity-20" style={{ backgroundColor: getContrastYIQ(previewCardBg) }} />
                  <User className="w-4 h-4 cursor-pointer" style={{ color: getContrastYIQ(previewCardBg) }} />
                </div>
              </div>

            </div>
          );
        })()}

      </div>

    </div>
  );
};

