import React, { useState } from "react";
import { IntakeFormPayload } from "@/lib/schema";
import { TextInputField } from "../TextInputField";
import { TextAreaField } from "../TextAreaField";
import { X, Plus, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step3MarketProps {
  data: IntakeFormPayload;
  updateData: (updates: Partial<IntakeFormPayload>) => void;
}

export const Step3Market: React.FC<Step3MarketProps> = ({ data, updateData }) => {
  const [newKeyword, setNewKeyword] = useState("");

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.endsWith(",")) {
      const kw = val.replace(",", "").trim();
      if (kw) {
        const current = data.keywords || [];
        if (!current.includes(kw)) {
          updateData({ keywords: [...current, kw] });
        }
      }
      setNewKeyword("");
    } else {
      setNewKeyword(val);
    }
  };

  const forceAddKeyword = (val: string) => {
    const kw = val.trim().replace(/^,|,$/g, ''); // remove trailing/leading commas
    if (!kw) return;
    const current = data.keywords || [];
    if (current.length >= 10) {
      setNewKeyword("");
      return; // max 10 tags
    }
    if (!current.includes(kw)) {
      updateData({ keywords: [...current, kw] });
    }
    setNewKeyword("");
  };

  const addKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      forceAddKeyword(newKeyword);
    }
  };

  const removeKeyword = (keyword: string) => {
    const current = data.keywords || [];
    updateData({ keywords: current.filter((k) => k !== keyword) });
  };

  const competitors = data.competitors || [];

  const updateCompetitor = (index: number, field: string, val: string) => {
    const current = [...competitors];
    current[index] = { ...current[index], [field]: val };
    updateData({ competitors: current });
  };

  const addCompetitor = () => {
    if (competitors.length < 3) {
      updateData({ competitors: [...competitors, { name: "", doingWell: "", differentiate: "" }] });
    }
  };

  const removeCompetitor = (index: number) => {
    const current = [...competitors];
    current.splice(index, 1);
    updateData({ competitors: current });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="glass p-8 flex flex-col gap-6">
        <h2 className="text-xl font-semibold mb-2">Target Market</h2>

        <TextAreaField
          label="Target Audience"
          placeholder="e.g. Millennials seeking..."
          value={data.targetAudience || ""}
          onChange={(e) => updateData({ targetAudience: e.target.value })}
          maxLength={300}
        />

        <TextAreaField
          label="Project Goal"
          placeholder="e.g. Lead Gen, E-com"
          value={data.projectGoal || ""}
          onChange={(e) => updateData({ projectGoal: e.target.value })}
          maxLength={300}
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-white/80 ml-1 flex justify-between items-center">
            Target Keywords
            <span className="text-xs text-white/40 font-normal">Comma or Enter to add</span>
          </label>
          <div className="glass-input flex flex-wrap gap-2 items-center min-h-[48px] p-2 focus-within:ring-1 focus-within:ring-[#ADC8FF] focus-within:border-[#ADC8FF] transition-all">
            {(data.keywords || []).map((kw) => (
              <div key={kw} className="flex items-center gap-1 bg-[#ADC8FF] text-[#0B1326] px-3 py-1 rounded-full text-xs font-medium">
                {kw}
                <button onClick={() => removeKeyword(kw)} className="hover:bg-black/10 rounded-full p-0.5" aria-label={`Remove ${kw}`}>
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <input
              type="text"
              className="flex-1 bg-transparent outline-none min-w-[120px] text-sm px-2 text-white placeholder:text-white/40"
              placeholder={(data.keywords || []).length >= 10 ? "Max tags reached" : "Add keyword..."}
              value={newKeyword}
              onChange={handleKeywordChange}
              onKeyDown={addKeyword}
              onBlur={() => forceAddKeyword(newKeyword)}
              disabled={(data.keywords || []).length >= 10}
            />
          </div>
        </div>
      </div>

      <div className="glass p-8 flex flex-col gap-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">Top Competitors</h2>
          {data.hasCompetitors && <span className="text-xs text-white/40">{competitors.length} / 3</span>}
        </div>

        <label className="flex items-center gap-3 cursor-pointer group w-fit">
          <div className={cn(
            "w-5 h-5 rounded flex items-center justify-center border transition-colors",
            data.hasCompetitors ? "bg-[#ADC8FF] border-[#ADC8FF] text-[#0B1326]" : "bg-white/5 border-white/20 text-transparent group-hover:border-white/40"
          )}>
            <Check className="w-3 h-3" />
          </div>
          <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">I have specific competitors in mind</span>
          <input 
            type="checkbox" 
            className="hidden" 
            checked={data.hasCompetitors || false} 
            onChange={(e) => {
              updateData({ hasCompetitors: e.target.checked });
              if (e.target.checked && competitors.length === 0) {
                addCompetitor();
              }
            }} 
          />
        </label>

        {data.hasCompetitors && (
          <div className="flex flex-col gap-6 mt-2">
            {competitors.map((comp, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 p-5 rounded-xl flex flex-col gap-4 relative animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white/60 uppercase tracking-widest">Competitor</span>
              </div>

              {competitors.length > 1 && (
                <button
                  onClick={() => removeCompetitor(idx)}
                  className="absolute top-4 right-4 text-white/30 hover:text-red-400 transition-colors z-10"
                  aria-label="Remove Competitor"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <TextInputField
                label="Competitor Name"
                placeholder="Name or URL..."
                value={comp.name || ""}
                onChange={(e) => updateCompetitor(idx, 'name', e.target.value)}
                maxLength={60}
              />

              <div className="flex flex-col gap-4">
                <TextAreaField
                  label="What do they do well?"
                  placeholder="e.g. Great UX, fast load times..."
                  value={comp.doingWell || ""}
                  onChange={(e) => updateCompetitor(idx, 'doingWell', e.target.value)}
                  maxLength={300}
                />
              </div>

              <TextAreaField
                label="How will you differentiate?"
                placeholder="e.g. Focus on speed and a more generous free tier..."
                value={comp.differentiate || ""}
                onChange={(e) => updateCompetitor(idx, 'differentiate', e.target.value)}
                maxLength={300}
              />
            </div>
          ))}

          {competitors.length < 3 && (
            <button
              onClick={addCompetitor}
              className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-white/20 rounded-xl text-sm text-white/60 hover:text-white hover:border-[#ADC8FF]/50 hover:bg-[#ADC8FF]/5 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Competitor
            </button>
          )}
        </div>
        )}
      </div>
    </div>
  );
};
