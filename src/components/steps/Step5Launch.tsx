import React, { useState, useRef, useEffect } from "react";
import { IntakeFormPayload } from "@/lib/schema";
import { Plus, Trash2, CalendarIcon } from "lucide-react";
import { addDays, addYears, format } from "date-fns";
import { cn } from "@/lib/utils";
import { TextAreaField } from "../TextAreaField";
import { TextInputField } from "../TextInputField";
import { FieldWrapper } from "../FieldWrapper";
import { Calendar } from "../ui/calendar";

interface Step5LaunchProps {
  data: IntakeFormPayload;
  updateData: (updates: Partial<IntakeFormPayload>) => void;
  errors?: Record<string, string>;
  clearError?: (field: string) => void;
}

const budgetTiers = [
  { id: "<2.5k", label: "Under $2.5k" },
  { id: "2.5k-5k", label: "$2.5k - $5k" },
  { id: "5k-10k", label: "$5k - $10k" },
  { id: "10k+", label: "$10k+" },
];

const MILESTONE_SUGGESTIONS = [
  "Beta Release",
  "Initial Launch"
];

const MilestoneAutocomplete = ({ value, onChange, error, onBlur, placeholder, maxLength, required }: any) => {
  const [show, setShow] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = MILESTONE_SUGGESTIONS.filter(s => s.toLowerCase().includes((value || '').toLowerCase()) && s.toLowerCase() !== (value || '').toLowerCase());

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!show || filtered.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      pickSuggestion(filtered[activeIndex]);
    } else if (e.key === "Escape") {
      setShow(false);
    }
  };

  const pickSuggestion = (s: string) => {
    onChange({ target: { value: s } });
    setShow(false);
  };

  return (
    <FieldWrapper label="Milestone Name" error={error} required={required}>
      <div className="relative w-full">
        <input
          type="text"
          value={value}
          onChange={(e) => { onChange(e); setShow(true); setActiveIndex(0); }}
          onFocus={() => { if (filtered.length > 0) setShow(true); }}
          onBlur={(e) => {
            setTimeout(() => setShow(false), 150);
            if (onBlur) onBlur(e);
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          maxLength={maxLength}
          placeholder={placeholder}
          className={cn(
            "glass-input w-full",
            error ? "border-rose-400 focus:ring-rose-400 focus:border-rose-400" : ""
          )}
        />
        {show && filtered.length > 0 && (
          <div className="absolute z-[100] left-0 w-full bg-[#121c33] border border-white/10 mt-1 shadow-2xl max-h-72 overflow-y-auto rounded-md animate-in fade-in slide-in-from-top-1 duration-200">
            {filtered.map((s, i) => (
              <button
                key={s}
                type="button"
                onMouseDown={() => pickSuggestion(s)}
                className={cn(
                  "w-full text-left px-4 py-3 text-sm transition-all border-b border-white/5 last:border-0",
                  i === activeIndex
                    ? "bg-[#ADC8FF] text-[#0B1326] font-medium"
                    : "hover:bg-white/5 text-slate-300 hover:text-white"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </FieldWrapper>
  );
};

export const Step5Launch: React.FC<Step5LaunchProps> = ({ data, updateData, errors = {}, clearError }) => {
  const [activeCalendarIdx, setActiveCalendarIdx] = useState<number | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const minDate = addDays(new Date(), 1);
  const maxDate = addYears(new Date(), 1);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setActiveCalendarIdx(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addMilestone = () => {
    if ((data.milestones || []).length >= 3) return;
    updateData({
      milestones: [
        ...(data.milestones || []),
        { date: "", name: "" }
      ]
    });
  };

  const updateMilestone = (idx: number, field: string, value: string) => {
    const updated = (data.milestones || []).map((m, i) =>
      i === idx ? { ...m, [field]: value } : m
    );
    updateData({ milestones: updated });
  };

  const removeMilestone = (idx: number) => {
    updateData({
      milestones: (data.milestones || []).filter((_, i) => i !== idx)
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="glass p-8 flex flex-col gap-6 relative z-30">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold mb-2">Project Milestones</h2>
          <span className="text-xs text-white/40">{(data.milestones || []).length} / 3</span>
        </div>

        <div className="flex flex-col gap-4">

          <div className="flex flex-col gap-4">
            {(data.milestones || []).map((milestone, idx) => (
              <div
                key={idx}
                className={cn(
                  "bg-white/5 border border-white/10 p-5 rounded-xl flex flex-col gap-4 relative animate-in fade-in zoom-in-95",
                  activeCalendarIdx === idx ? "z-50" : "z-10"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white/60 uppercase tracking-widest">Milestone</span>
                </div>

                {(data.milestones || []).length > 1 && (
                  <button
                    onClick={() => removeMilestone(idx)}
                    className="absolute top-4 right-4 text-white/30 hover:text-red-400 transition-colors z-20"
                    aria-label="Remove Milestone"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <MilestoneAutocomplete
                      placeholder="e.g. Target Launch Date"
                      value={milestone.name}
                      onChange={(e: any) => {
                        updateMilestone(idx, 'name', e.target.value);
                        if (idx === 0 && clearError) clearError('milestoneName');
                      }}
                      onBlur={() => {
                        if (idx === 0 && clearError && milestone.name?.trim()) clearError('milestoneName');
                      }}
                      maxLength={40}
                      error={idx === 0 ? errors.milestoneName : undefined}
                      required={idx === 0}
                    />
                  </div>
                  <div className="w-full md:w-48 relative">
                    <FieldWrapper label="Target Date" error={idx === 0 ? errors.milestoneDate : undefined} required={idx === 0}>
                      <button
                        onClick={() => setActiveCalendarIdx(activeCalendarIdx === idx ? null : idx)}
                        className={cn("glass-input w-full text-left flex items-center justify-between h-[42px] px-3 mt-1", !milestone.date && "text-white/40", idx === 0 && errors.milestoneDate && "border-rose-400 focus:ring-rose-400 focus:border-rose-400")}
                      >
                        <span>
                          {milestone.date ? format(new Date(milestone.date + 'T12:00:00'), "MMM dd, yyyy") : "Select date"}
                        </span>
                        <CalendarIcon className="w-4 h-4 text-white/40 group-hover:text-[#ADC8FF] transition-colors" />
                      </button>
                    </FieldWrapper>

                    {activeCalendarIdx === idx && (
                      <>
                        <div className="fixed inset-0 bg-black/50 z-[90] md:hidden" onClick={(e) => { e.stopPropagation(); setActiveCalendarIdx(null); }} />
                        <div ref={calendarRef} className="fixed md:absolute top-1/2 left-1/2 md:top-full md:left-auto md:right-0 -translate-x-1/2 -translate-y-1/2 md:translate-x-0 md:translate-y-0 mt-0 md:mt-2 z-[100] shadow-2xl bg-[#0B1326] md:bg-transparent rounded-xl border border-white/10 md:border-0 p-2 md:p-0">
                          <Calendar
                          mode="single"
                          selected={milestone.date ? new Date(milestone.date + 'T12:00:00') : undefined}
                          onSelect={(date) => {
                            if (date) {
                              updateMilestone(idx, 'date', format(date, 'yyyy-MM-dd'));
                              setActiveCalendarIdx(null);
                              if (idx === 0 && clearError) clearError('milestoneDate');
                            }
                          }}
                          disabled={(date) => date < minDate || date > maxDate}
                        />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {(data.milestones || []).length < 3 && (
              <button
                onClick={addMilestone}
                className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-white/20 rounded-xl text-sm text-white/60 hover:text-white hover:border-[#ADC8FF]/50 hover:bg-[#ADC8FF]/5 transition-all"
              >
                <Plus className="w-4 h-4" /> Add Milestone
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="glass p-8 flex flex-col gap-6 relative z-20">
        <h2 className="text-xl font-semibold mb-2">Estimated Budget</h2>
        <div className="flex flex-col gap-3">
          <span className="text-xs text-white/40 ml-1 mt-1">This helps us scope the right solution for your resources.</span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {budgetTiers.map((tier) => {
              const isSelected = data.budgetTier === tier.id;
              return (
                <button
                  key={tier.id}
                  onClick={() => updateData({ budgetTier: tier.id })}
                  className={cn(
                    "py-3 rounded-lg border text-sm font-medium transition-all",
                    isSelected
                      ? "bg-[#ADC8FF] border-[#ADC8FF] text-[#0B1326] shadow-[0_0_15px_rgba(173,200,255,0.2)]"
                      : "bg-[#121c33]/50 border-white/10 text-white/60 hover:border-white/30 hover:text-white"
                  )}
                >
                  {tier.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="glass p-8 flex flex-col gap-6 relative z-10">
        <h2 className="text-xl font-semibold mb-2">Final Details</h2>
        <TextInputField
          label="How did you hear about us?"
          placeholder="e.g. Referral from a friend, Twitter, Google Search..."
          value={data.referralSource || ""}
          onChange={(e) => updateData({ referralSource: e.target.value })}
          maxLength={100}
        />
        
        <div className="flex flex-col gap-2 mt-2">
          <label className="text-sm font-medium text-white/80 ml-1">Additional Notes</label>
          <TextAreaField
            label=""
            placeholder="Anything else we should know?"
            value={data.additionalNotes || ""}
            onChange={(e) => updateData({ additionalNotes: e.target.value })}
            maxLength={1000}
          />
        </div>
      </div>
    </div>
  );
};
